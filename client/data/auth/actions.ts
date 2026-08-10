import axios, { AxiosPromise } from 'axios'
import { store } from '../store'
import { IUser } from '@mern/server/api/user/model'
import { myBookActions } from '../books/actions'
import { connnect, disconnect } from '../socket'

class AuthActions {
    private nameSpace = 'auth'

    constructor (
        private store
    ) {}

    private sendDispatch (type: string, payload: any): Promise<void> {
        return this.store.dispatch(new Promise((resolve) => {
            resolve({
                type: `${this.nameSpace}/${type}`,
                payload,
            })
        }))
    }

    create (user: {email: string, password: string, name: string}): AxiosPromise<string> {
        return axios.post('/api/user', user)
        .then(res => res.data)
    }

    update (user: IUser): Promise<void> {
        return axios.put('/api/user', user)
        .then(res => this.setUser(user))
    }

    private setAuths (token: string): void {
        axios.defaults.headers.common['Authorization'] = token
        document.cookie = `authToken=${token}`
    }

    private getCookieAuth (): string | void {
        const myCookies = document.cookie.split(';')
        return myCookies.filter(cookie => {
            return cookie.trim().indexOf('authToken') === 0
        })[0]
    }

    preloadUser (): void {
        const token = this.getCookieAuth()
        if (!token) return
        this.loadConnections(token.split('=')[1])
    }

    private async loadConnections (token: string): Promise<void> {
        await this.setToken(token)
        await this.me()
        connnect(token)
        const unsub = store.subscribe(() => {
            const books = store.getState().books.list
            if (books.length === 0) return
            unsub()
            myBookActions.select(books[0]._id)
        })
        
        return undefined
    }

    login (email: string, password: string): Promise<void> {
        return axios.post('/api/auth/local', {
            email,
            password
        })
        .then(res => this.loadConnections(res.data.token))
    }

    waitFor3rdPartyAuth (callback: Function): Promise<string> {
        const mySocket = store.getState().auth.socket
        if (mySocket && mySocket.id) return Promise.resolve(mySocket.id)

        return new Promise((resolve, reject) => {
            import('socket.io-client')
            .then(io => io.connect())
            .then(socket => {
                return this.setSocket(socket)
                .then(() => socket)
            })
            .then(socket => {
                socket.on('message', msg => resolve(msg))
                .on('auth', msg => {
                    socket.disconnect()
                    this.setAuths(msg)
                    this.setSocket(undefined)
                    .then(() => this.loadConnections(msg))
                    .then(() => callback())
                })
            })
            .catch(err => reject(err))
        })
    }

    logout (): Promise<void> {
        return axios.get('/auth/logout')
        .then(() => this._logout())
        .then(() => {
            axios.defaults.headers.common['Authorization'] = undefined
            this.deleteAuthCookie()
            this.setUser(undefined)
            disconnect()
        })
    }

    private deleteAuthCookie () {
        this.deleteCookie('authToken')
    }

    private deleteCookie (name: string) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    }

    private _logout (): Promise<void> {
        return this.sendDispatch('logout', undefined)
    }

    private setUser (user: IUser|undefined): Promise<void> {
        return this.sendDispatch('set_user', user)
    }

    private setToken (token: string): Promise<void> {
        this.setAuths(token)
        return this.sendDispatch('set_token', token)
    }

    private setSocket (socket: any): Promise<void> {
        return this.sendDispatch('set_socket', socket)
    }

    private me (): Promise<void> {
        return axios.get('/api/user/me')
        .then(res => res.data)
        .then(user => this.setUser(user))
    }
}

export const myAuthActions = new AuthActions(store)
