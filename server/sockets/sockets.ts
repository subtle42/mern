import * as IO from "socket.io";
import * as http from "http";
import {Document, Schema} from "mongoose";

declare var global:any;
let myIO:SocketIO.Server = global.myIO;

export default abstract class BaseSocket {
    protected namespace:SocketIO.Namespace;

    constructor (
        protected name:string,
        protected schema:Schema
    ) {
        this.namespace = myIO.of(name);
        this.setupSockEvents(name);
    }

    setupSockEvents(name:string) {
        this.namespace.on("connection", socket => {
            console.log(`Joined Namespace: ${name}`);
            this.onJoin(socket);
        });

        this.schema.post("save", (doc:Document) => {
            this.onAddOrChange(this.getParentId(doc), [doc]);
        });

        this.schema.post("remove", (doc:Document) => {
            this.onDelete(this.getParentId(doc), [doc._id]);
        });

        console.log(`Created Namespace: ${name}`);
    }

    abstract getParentId(model:Document):string
    
    abstract getInitialState(room:string):Promise<any[]>

    onJoin(socket:SocketIO.Socket) {
        socket.on("join", (room:string) => {
            socket.leaveAll();
            socket.join(room);
            socket.emit("message", `${this.name.toUpperCase()}, joined room: ${room}`);
            this.getInitialState(room)
            .then(data => this.onAddOrChange(room, data))
        });
    }

    onDelete(room:string, ids:string[]):void {
        this.namespace.in(room).emit("removed", ids);
    }

    onAddOrChange(room:string, items:Document[]):void {
        this.namespace.in(room).emit("addedOrChanged", items);
    }
}
