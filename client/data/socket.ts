import {store} from './store'


export const connnect = (token: string) => {
    const mySocket = new WebSocket(`ws://localhost:3333/ws?token=${token}`);
    mySocket.onopen = () => {
        console.log('websocket connection is open')
        hiddenWs = mySocket
    }
    mySocket.onerror = ev => console.error(ev)
    mySocket.onclose = () => console.log('websocket connection is closed')
    mySocket.onmessage = ev => {
        const {channel, namespace, data, error} = JSON.parse(ev.data)
        if (error) return console.error(error)
        store.dispatch({
            payload: data,
            type: `${namespace}/${channel}`,
        })
    }
}

let hiddenWs: WebSocket
export const getWebsocket = () => hiddenWs

export const disconnect = () => {
    if (!hiddenWs) return
    hiddenWs.close()
}

type Namespace = 'books' | 'pages' | 'widgets' | 'sources'

export const joinRoom = async(namespace: Namespace, room: string) => {
    if (!hiddenWs || hiddenWs.readyState !== hiddenWs.OPEN) {
        return console.warn('No socket connection')
    }
    await store.dispatch({
        type: `${namespace}/joinRoom`,
        payload: undefined
    })
    hiddenWs.send(JSON.stringify({
        channel: 'join',
        namespace,
        room
    }))
}