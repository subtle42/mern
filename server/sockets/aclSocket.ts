import {IBook} from "common/models";
import { Document, Model} from "mongoose";
import { ISharedModel } from "../dbModels";
import * as jwt from "jsonwebtoken";
import config from "../config/environment";
declare var global:any;
let myIO:SocketIO.Server = global.myIO;

export class AclSocket {
    private namespace:SocketIO.Namespace;

    constructor(
        private name:string,
        protected model:Model<ISharedModel>
    ) {
        this.namespace = myIO.of(this.name);
        this.setupSockEvents();
    }

    private setupSockEvents() {
        this.namespace.on("connection", socket => {
            console.log(`Joined Namespace: ${this.name}`);
            // this.onJoin(socket);
            jwt.verify(socket.handshake.query.token, config.shared.secret, (err, decoded) => {
                if (err) return;
                socket.join(decoded._id);
                this.getInitialState(decoded._id)
                .then(data => this.namespace.in(decoded._id).emit("addedOrChanged", data));
            });
            // console.log(socket.handshake.query.token)
        });
        console.log(`Created Namespace: ${this.name}`);
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
        return this.model.find({
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

    private getAcl(shared:ISharedModel):string[] {
        return [shared.owner].concat(shared.editors, shared.viewers);
    }

    onDelete(shared:ISharedModel) {
        if (shared.isPublic === true) {
            this.namespace.emit("removed", [shared._id]);
        }
        else {
            this.getAcl(shared).forEach(id => this.namespace.in(id).emit("removed", [shared._id]))
        }
    }

    onAddOrChange(newShared:ISharedModel, oldShared?:ISharedModel) {
        if (!oldShared) {
            this.namespace.in(newShared.owner).emit("addedOrChanged", [newShared]);
        }
        else if (newShared.isPublic === true) {
            this.namespace.emit("addedOrChanged", [newShared]);
        }
        else if (oldShared.isPublic === true && newShared.isPublic === false) {
            this.namespace.emit("removed", [newShared._id]);
            this.getAcl(newShared).forEach(id => this.namespace.in(id).emit("addedOrChanged", [newShared]))
        }
        else {
            const oldAcl = this.getAcl(oldShared);
            const newAcl = this.getAcl(newShared);
            let removed = oldAcl.filter(id => newAcl.indexOf(id) === -1);
            
            removed.forEach(id => this.namespace.in(id).emit("removed", [newShared._id]));
            this.getAcl(newShared).forEach(id => this.namespace.in(id).emit("addedOrChanged", [newShared]));
        }
    }
};