import axios from 'axios'
import { store } from '../store'
import { IUser } from '@mern/server/api/user/model'
import { connnect, disconnect } from '../socket'
import { selectBook } from '../books/actions'
import { authCmds } from './reducer'



export const createUser = async(user: {email: string, password: string, name: string}) => {
    const res = await axios.post<string>('/api/user', user)
    return res.data
}

export const updateUser = async(user: IUser) => {
    const res = await axios.put('/api/user', user)
    store.dispatch(authCmds.set_user(user))
    return res.data
}

const setAuth = (token: string) => {
    axios.defaults.headers.common['Authorization'] = token
    document.cookie = `authToken=${token}`
    store.dispatch(authCmds.set_token(token))
}

const getCookieAuth = (): string | void => {
    const myCookies = document.cookie.split(';')
    return myCookies.filter(cookie => {
        return cookie.trim().indexOf('authToken') === 0
    })[0]
}

export const preloadUser = () => {
    const token = getCookieAuth()
    if (!token) return
    loadConnections(token.split('=')[1])
}

const loadConnections = async(token: string) => {
    setAuth(token)
    await getMe()
    connnect(token)
    const unsub = store.subscribe(() => {
        const books = store.getState().books.list
        if (books.length === 0) return
        unsub()
        selectBook(books[0]._id)
    })
}

export const getMe = async() => {
    const res = await axios.get<IUser>('/api/user/me')
    store.dispatch(authCmds.set_user(res.data))
}

export const localLogin = async(email: string, password: string) => {
    const res = await axios.post<{token:string}>('/api/auth/local', {
        email,
        password
    })
    loadConnections(res.data.token)
}

export const logout = async() => {
    const res = await axios.get('/auth/logout')
    store.dispatch(authCmds.logout())
    axios.defaults.headers.common['Authorization'] = undefined
    // deleting token
    document.cookie = `authToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    disconnect()
}

