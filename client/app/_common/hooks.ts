import * as React from 'react'
import { store } from 'data/store'
import { IBook, ISource, IPage, IWidget } from 'common/models'
import { NotificationModel } from 'data/notifications/reducer'

const _useList = (namespace: string) => {
    const [data, setData] = React.useState(
        store.getState()[namespace].list
    )

    React.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const newData = store.getState()[namespace].list
            if (newData === data) return
            setData(newData)
        })
        return () => unsubscribe()
    }, [namespace])

    return data
}

const _useItem = (namespace: string, id: string) => {
    const [data, setData] = React.useState(
        store.getState()[namespace].list.find(d => d._id === id)
    )

    React.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const newData = store.getState()[namespace].list
            .find(d => d._id === id)
            if (newData === data) return
            setData(newData)
        })
        return () => unsubscribe()
    }, [namespace, id])

    return data
}

export const useBook = (id: string): IBook => {
    return _useItem('books', id)
}

export const useBooks = (): IBook[] => {
    return _useList('books')
}

export const usePages = (): IPage[] => {
    return _useList('pages')
}

export const usePage = (id: string): IPage => {
    return _useItem('pages', id)
}

export const useWidgets = (): IWidget[] => {
    return _useList('widgets')
}

export const useWidget = (id: string): IWidget => {
    return _useItem('widgets', id)
}

export const useSources = (): ISource[] => {
    return _useList('sources')
}

export const useSource = (id: string): ISource => {
    return _useItem('sources', id)
}

export const useAlerts = (): NotificationModel[] => {
    const [alerts, setAlerts] = React.useState(
        store.getState().notifcations.list || []
    )

    React.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const newData = store.getState().notifcations.list
            if (alerts === newData) return
            setAlerts(newData)
        })
        return () => unsubscribe()
    })

    return alerts
}
