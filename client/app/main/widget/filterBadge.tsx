import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import Tooltip from 'reactstrap/lib/Tooltip'
import Badge from 'reactstrap/lib/Badge'
import { useWidget, useSource } from '../../_common/hooks'
import { store } from 'data/store'

class Props {
    widgetId: string
}

const useFilter = (sourceId: string) => {
    const [filter, setFilter] = React.useState(
        store.getState().sources.filters[sourceId]
    )

    React.useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            const newFilter = store.getState().sources.filters[sourceId]
            if (newFilter === filter) return
            setFilter(newFilter)
        })
        return () => unsubscribe()
    }, [sourceId])

    return filter
}

export const FilterBadge: React.FunctionComponent<Props> = (props: Props) => {
    const widget = useWidget(props.widgetId)
    const source = useSource(widget ? widget.sourceId : undefined)
    const filters = useFilter(widget ? widget.sourceId : undefined)
    const [isOpen, setOpen] = React.useState(false)
    if (!filters) return <div/>
    const keys = Object.keys(filters)
        .filter(key => !widget.dimensions.find(dim => dim === key))
    if (keys.length === 0) return <div/>

    return <div>
        <Tooltip isOpen={isOpen}
            toggle={() => setOpen(!isOpen)}
            placement='right'
            style={{ textAlign: 'left', fontSize: 10, maxWidth: 500 }}
            target={`filterTooltip_${props.widgetId}`}>
            {keys.map((key, index) => {
                const myCol = source.columns.find(col => col.ref === key)
                const data = filters[key].map(item => {
                    if (myCol.type === 'number') {
                        return Math.round(item)
                    } else if (myCol.type === 'datetime') {
                        return (new Date(item)).toDateString()
                    }
                    return item
                })
                .join(', ')
                return <div key={index}>{`${myCol.name}: ${data}`}</div>
            })}
        </Tooltip>
        <Badge id={`filterTooltip_${props.widgetId}`}
            color='light'
            style={{ position: 'absolute', margin: 4 }}>
            <FontAwesome name='filter' />
        </Badge>
    </div>
}
