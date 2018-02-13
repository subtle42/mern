import {Book} from "./model";
import {IBook} from "myModels";
import {IBookModel} from "../../dbModels";
import {Schema, Document} from "mongoose";
import BaseSocket from "../../sockets/sockets";
declare var global:any;
let myIO:SocketIO.Server = global.myIO;

export default class BookSocket {
    private namespace:SocketIO.Namespace;
    private name = "books";

    constructor(
        protected schema:Schema
    ) {
        this.namespace = myIO.of(this.name);
        this.setupSockEvents();
    }

    private setupSockEvents() {
        this.namespace.on("connection", socket => {
            console.log(`Joined Namespace: ${this.name}`);
            this.onJoin(socket);
        });

        this.schema.post("remove", (doc:IBookModel) => {
            // console.error("err", err);
            console.log("doc", doc);
            this.onDelete(doc);
        });
    }

    private onJoin(socket:SocketIO.Socket) {
        socket.on("join", (room:string) => {
            socket.leaveAll();
            socket.join(room);
            this.getInitialState(room)
            .then(data => this.namespace.in(room).emit("addedOrChanged", data));
        });
    }

    private getInitialState(userId:string) {
        return Book.find({
            $or: [{
                owner: userId
            }, {
                editors: {$elemMatch: { $eq: userId }}
            }, {
                viewers: {$elemMatch: { $eq: userId }}
            }, {
                isPublic: {$eq: true}
            }]
        }).exec();
    }

    private getAcl(book:IBook):string[] {
        return [book.owner].concat(book.edit, book.view);
    }

    private onDelete(book:IBook) {
        if (book.isPublic === true) {
            this.namespace.emit("removed", [book._id]);
        }
        else {
            this.getAcl(book).forEach(id => this.namespace.in(id).emit("removed", [book._id]))
        }
    }

    onAddOrChange(newBook:IBook, oldBook?:IBook) {
        if (!oldBook) {
            this.namespace.in(newBook.owner).emit("addedOrChanged", [newBook]);
        }
        else if (newBook.isPublic === true) {
            this.namespace.emit("addedOrChanged", [newBook]);
        }
        else if (oldBook.isPublic === true && newBook.isPublic === false) {
            this.namespace.emit("removed", [newBook._id]);
            this.getAcl(newBook).forEach(id => this.namespace.in(id).emit("addedOrChanged", [newBook]))
        }
        else {
            const oldAcl = this.getAcl(oldBook);
            const newAcl = this.getAcl(newBook);
            let removed = oldAcl.filter(id => newAcl.indexOf(id) === -1);
            
            removed.forEach(id => this.namespace.in(id).emit("removed", [newBook._id]));
            this.getAcl(newBook).forEach(id => this.namespace.in(id).emit("addedOrChanged", [newBook]));
        }
    }
};