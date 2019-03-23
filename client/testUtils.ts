import { store } from 'data/store'
import { IPage, IBook } from 'common/models'

const addItemToStore = (namespace: string, item) => {
    store.dispatch({
        type: 'addedOrChanged',
        namespace,
        payload: [item]
    })
}

const setSelected = (namespace: string, payload: string) => {
    store.dispatch({
        type: 'select',
        namespace,
        payload
    })
}

export const setSelectedBook = (id: string) => {
    setSelected('books', id)
}

export const addBookToStore = (item) => {
    addItemToStore('books', item)
}

export const setUser = (item) => {
    store.dispatch({
        type: 'set_user',
        payload: item,
        namespace: 'auth'
    })
}

export const pages = {
    upsert: (page: IPage) => addItemToStore('pages', page),
    remove: (id: string) => console.warn(''),
    select: (id: string) => console.warn('')
}

export const waitATick = (wait?: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), wait || 0)
    })
}

export const resetStore = () => {
    store.dispatch({
        type: 'RESET'
    })
}
