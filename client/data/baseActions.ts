import * as io from 'socket.io-client'

export default abstract class BaseActions {
    private isNewList: boolean = true

    constructor (
        protected store,
        private nameSpace: string
    ) {}

    protected sendDispatch (type: string, payload: any): Promise<void> {
        return this.store.dispatch(new Promise((resolve) => {
            resolve({
                type,
                payload,
                namespace: this.nameSpace
            })
        }))
    }

    private addedOrChanged (items: any[]): Promise<void> {
        return this.sendDispatch(`addedOrChanged`, items)
    }

    private remove (items: any[]): Promise<void> {
        return this.sendDispatch(`removed`, items)
    }

    private storeSocket (socket): Promise<void> {
        return this.sendDispatch(`storeSocket`, socket)
    }

    disconnect (): Promise<void> {
        let mySocket: SocketIOClient.Socket = this.store.getState()[this.nameSpace].socket
        if (mySocket) {
            mySocket.disconnect()
        }

        return this.sendDispatch(`disconnect`, undefined)
    }

    protected _select (id: string): Promise<void> {
        return this.sendDispatch(`select`, id)
    }

    abstract select (id: string): Promise<void>
    abstract create (item: any): Promise<any>
    abstract update (item: any): Promise<any>
    abstract delete (item: any): Promise<void>

    /**
     * Connect to socket channel
     * @param auth
     */
    connect (auth: string): Promise<void> {
        if (this.store.getState()[this.nameSpace].socket) {
            return Promise.reject(`Already connected to ${this.nameSpace}`)
        }

        let nsp = io.connect(`/${this.nameSpace}`, {
            query: {
                token: auth
            }
        })

        nsp.on('message', (msg) => console.log(msg))
        .on('addedOrChanged', (items: any[]) => {
            if (this.isNewList) {
                this.isNewList = false
                this.addedOrChanged(items)
                .then(() => this.select(items[0] ? items[0]._id : ''))
            } else {
                this.addedOrChanged(items)
            }
        })
        .on('removed', (items) => this.remove(items))
        .on('error', (err) => console.error(err))

        return this.storeSocket(nsp)
    }

    /**
     * Join different room on channel
     * @param room
     */
    joinRoom (room: string): Promise<void> {
        if (!this.store.getState()[this.nameSpace].socket) {
            return Promise.reject(`Cannot join room in ${this.nameSpace} channel. No socket connection`)
        }

        this.isNewList = true
        return this.sendDispatch('joinRoom', room)
        .then(() => {
            let myState = this.store.getState()
            let mySocket: SocketIOClient.Socket = myState[this.nameSpace].socket
            mySocket.emit('join', room)
        })
    }
}
