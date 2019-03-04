import * as React from 'react'
import CardTitle from 'reactstrap/lib/CardTitle'
import { store } from 'data/store'

interface Props {
    _id: string
}

export const WidgetHeader: React.StatelessComponent<Props> = (props: Props) => {
    const [source, setSource] = React.useState(
        store.getState().sources.list.find(s => s._id === props._id)
    )
    React.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const newSource = store.getState().sources.list.find(s => s._id === props._id)
            if (newSource === source) return
            setSource(newSource)
        })
        return () => unsubscribe()
    }, [props._id])

    return <CardTitle style={{ margin: 0 }}>{source ? source.title : 'Loading..'}</CardTitle>
}
