import { Model} from "mongoose";
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
        console.log(`Create namespace: ${this.name}`)
        this.setupSockEvents();
    }

    private setupSockEvents() {
        this.namespace.on("connection", (socket:any) => {
            this.veryifyToken(socket.handshake.query.token)
            .then(decoded => {
                socket.join(decoded._id);
                return this.getInitialState(decoded._id)
                .then(data => this.namespace.in(decoded._id).emit("addedOrChanged", data))
            })
            .catch(err => {
                socket.emit("error", err)
            });
        });
    }

    private veryifyToken(token:string):Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.shared.secret, (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded);
            });
        })
    }

    private getInitialState(userId:string) {
        return this.model.find({
            $or: [{
                owner: userId
            }, {
                editors: userId
            }, {
                viewers: userId
            }, {
                isPublic: true
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