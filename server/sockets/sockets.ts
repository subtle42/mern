// import * as IO from "socket.io";
import {Document} from "mongoose";

declare var global:any;
let myIO:SocketIO.Server = global.myIO;

export default abstract class BaseSocket {
    protected namespace:SocketIO.Namespace;

    constructor (
        protected name:string
    ) {
        this.namespace = myIO.of(name);
        this.setupSocket(name);
    }

    setupSocket(name:string) {
        this.namespace.on("connection", socket => {
            console.log(`Joined Namespace: ${name}`);
            this.onJoin(socket);
        });

        // this.schema.post("save", (doc:Document) => {
        //     this.onAddOrChange(this.getParentId(doc), [doc]);
        // });

        // this.schema.post("remove", (doc:Document) => {
        //     this.onDelete(this.getParentId(doc), [doc._id]);
        // });

        console.log(`Created Namespace: ${name}`);
    }

    protected abstract getParentId(model:Document):string
    
    protected abstract getInitialState(room:string):Promise<any[]>

    abstract onAddOrChange(changed:Document|Document[]):void;

    abstract onDelete(removed:Document|Document[]):void;

    private onJoin(socket:SocketIO.Socket) {
        socket.on("join", (room:string) => {
            socket.leaveAll();
            socket.join(room);
            socket.emit("message", `${this.name.toUpperCase()}, joined room: ${room}`);
            this.getInitialState(room)
            .then(data => this._onAddOrChange(room, data))
        });
    }

    protected _onDelete(room:string, ids:string[]):void {
        console.log(`room: ${room} - ${ids}`)
        this.namespace.in(room).emit("removed", ids);
    }

    protected _onAddOrChange(room:string, items:Document[]):void {
        this.namespace.in(room).emit("addedOrChanged", items);
    }
}
