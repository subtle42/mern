import * as io from "socket.io";
import * as jwt from "jsonwebtoken";
import config from "../../config/environment";

export const socketAuth = (socketServer:SocketIO.Server):void => {
    socketServer.use((socket:SocketIO.Socket, next:Function) => {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(socket.handshake.query.token, config.shared.secret, (err, decoded) => {
                if (err) return socket.emit("message", err.message);
                socket.handshake.query.user = decoded;
                next();
            });
        }
    });
}