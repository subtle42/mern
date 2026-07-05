import { FastifyInstance } from "fastify"
import { Server } from "socket.io"


let MyWsServer: Server

export const buildWsServer = (app: FastifyInstance) => {
    const wss = new Server(app.server)
    wss.on('connection', socket => {
        socket.emit('message', socket.id)
    })
    MyWsServer = wss
    return wss
}

export const getWsServer = () => {
    if (!MyWsServer) throw Error(`Wss not ready yet`)
    return MyWsServer
}

