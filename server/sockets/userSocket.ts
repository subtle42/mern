import {ISharedModel} from "../dbModels";
import {Schema, Document, Model} from "mongoose";

declare var global:any;
let myIO:SocketIO.Server = global.myIO;

export default class BookSocket {
    private namespace:SocketIO.Namespace;

    constructor(
        private name:string,
        private schema:Schema,
        private myModel:Model<ISharedModel>
    ) {
        this.namespace = myIO.of(this.name);
        this.setupSockEvents();
        console.log(`Created Namespace: ${name}`);
    }

    private setupSockEvents() {
        this.namespace.on("connection", socket => {
            console.log(`Joined Namespace: ${this.name}`);
            this.onJoin(socket);
        });

        this.schema.post("remove", (doc:ISharedModel) => {
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
        return this.myModel.find({
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

    private getAcl(book:ISharedModel):string[] {
        return [book.owner].concat(book.editors, book.viewers);
    }

    private onDelete(book:ISharedModel) {
        if (book.isPublic === true) {
            this.namespace.emit("removed", [book._id]);
        }
        else {
            this.getAcl(book).forEach(id => this.namespace.in(id).emit("removed", [book._id]))
        }
    }

    onAddOrChange(newBook:ISharedModel, oldBook?:ISharedModel) {
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