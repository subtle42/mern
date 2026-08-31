import * as React from 'react'
import Card from 'reactstrap/lib/Card'
import CardHeader from 'reactstrap/lib/CardHeader'
import Button from 'reactstrap/lib/Button'
import CardTitle from 'reactstrap/lib/CardTitle'
import FontAwesome from 'react-fontawesome'

import { ConfirmModal } from '../../_common/confirmation'
import { ColumnButton } from './content/columnBtn'
import { EditButton } from './edit'
import { Histogram } from '../charts/histogram'
import { BarGrouped } from '../charts/barGrouped'
import { Scatter } from '../charts/scatter'
import { Line } from '../charts/line'
import { FilterBadge } from './filterBadge'
import { IWidget } from '@mern/server/api/widget/model'
import { ISource, ISourceColumn } from '@mern/server/api/source/model'
import { store } from '../../../data/store'
import { myNotifActions } from '../../../data/notifications/actions'
import { deleteWidget, queryWidget, setWidgetSize, updateWidget } from '../../../data/widgets/actions'

interface Props {
    _id: string
}

class State {
    widgetConfig!: IWidget
    source: ISource|undefined
    width: number = 0
    height: number = 0
    showTooltip: boolean = false
}

export class Widget extends React.Component<Props, State> {
    state = new State()
    unsubscribe!: Function
    myRef: any = React.createRef()

    getInitalState () {
        const storeState = store.getState()
        const widget = storeState.widgets.list.filter(w => w._id === this.props._id)[0]
        let source:ISource|undefined = undefined
        if (widget) {
            source = storeState.sources.list.filter(s => s._id === widget.sourceId)[0] as ISource
            queryWidget(widget)
            .catch(err => console.warn(err))
        }

        this.setState({
            widgetConfig: widget,
            source: source
        })
        
    }

    componentDidUpdate () {
        const width = this.myRef.current.offsetWidth
        const height = this.myRef.current.offsetHeight - 65
        if (!this.state.widgetConfig) return
        if (this.state.width === width && this.state.height === height) return
        // this is needed so that the widget wont mess up on resize stop
        const tmp = store.getState().widgets.sizes[this.props._id]
        if (tmp) return
        setWidgetSize(this.state.widgetConfig._id, width, height)
    }

    componentDidMount () {
        this.getInitalState()

        this.unsubscribe = store.subscribe(() => {
            let newValue = store.getState().widgets.list.filter(w => w._id === this.props._id)[0]
            if (this.state.widgetConfig !== newValue) {
                queryWidget(newValue)
                .catch(err => console.warn(err))
                this.setState({
                    widgetConfig: newValue
                })
            }

            if (!this.state.widgetConfig) return

            let newSource = store.getState().sources.list.filter(s => s._id === this.state.widgetConfig.sourceId)[0]
            if (this.state.source !== newSource) {
                this.setState({
                    source: newSource
                })
            }
        })
    }

    componentWillUnmount () {
        this.unsubscribe && this.unsubscribe()
    }

    removeWidget () {
        deleteWidget(this.props._id)
        .then(() => myNotifActions.success('Widget removed'))
        .catch(err => myNotifActions.error(err.message))
    }

    getDropdown (): JSX.Element|undefined {
        if (!this.state.widgetConfig) return

        const dimCount = this.state.widgetConfig.dimensions.length

        if (dimCount > 1) {
            return <div style={{ display: 'flex', justifyContent: 'center', height: 29 }}>
                <ColumnButton
                    colType='number'
                    sourceId={this.state.widgetConfig.sourceId}
                    colId={this.state.widgetConfig.dimensions[1]}
                    onColUpdate={col => {
                        const tmp = {
                            ...this.state.widgetConfig,
                            dimensions:[this.state.widgetConfig.dimensions[0], col.ref]
                        }
                        // this.state.widgetConfig.dimensions[1] = col.ref
                        updateWidget(tmp)
                        .then(() => queryWidget(tmp))
                    }}/>
            </div>
        }

        return <div style={{ display: 'flex', justifyContent: 'center', height: 29 }}>
            {this.state.widgetConfig.measures.map((measure, index) => {
                return <ColumnButton
                    hasCount={true}
                    key={index}
                    colType='number'
                    sourceId={this.state.widgetConfig.sourceId}
                    colId={measure.ref}
                    onColUpdate={this.onColUpdate}/>
            })}
        </div>
    }

    getDimDropdown () {
        if (!this.state.widgetConfig) return

        const source = store.getState().sources.list.find(s => s._id === this.state.widgetConfig.sourceId) as ISource
        const column = source.columns
            .find(col => col.ref === this.state.widgetConfig.dimensions[0]) as ISourceColumn
        const helpText: string = column.type !== 'number' ? 'Grouped by ' : ''

        return <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, paddingTop: 7 }}>{helpText}</div>
            <ColumnButton
                colType={column.type}
                sourceId={this.state.widgetConfig.sourceId}
                colId={this.state.widgetConfig.dimensions[0]}
                onColUpdate={col => {
                    const newDims = [...this.state.widgetConfig.dimensions]
                    newDims[0] = col.ref
                    const tmp = {...this.state.widgetConfig, dimensions:newDims}
                    updateWidget(tmp)
                    .then(() =>  queryWidget(tmp))
                }}/>
        </div>
    }

    onColUpdate = (col: ISourceColumn): void => {
        // this.state.widgetConfig.measures[0] = {
        //     ref: col.ref
        // }
        alert('in fn')
        const tmp = {...this.state.widgetConfig, measures: [col.ref]}
        updateWidget(tmp)
        .then(() => queryWidget(tmp))
        .catch(err => myNotifActions.success(err.message))
    }

    getChart = (widget: IWidget): JSX.Element => {
        if (!widget) return <div />
        if (widget.type === 'histogram') {
            return <Histogram id={this.props._id}/>
        } else if (widget.type === 'barGroup') {
            return <BarGrouped id={this.props._id} />
        } else if (widget.type === 'scatter') {
            return <Scatter id={this.props._id} />
        } else if (widget.type === 'line') {
            return <Line id={this.props._id} />
        }
        return <div/>
    }

    render () {
        return <Card style={{ height: '100%' }}>
            <CardHeader style={{ padding: 0, border: 0 }}>
                <EditButton id={this.props._id} />
                <ConfirmModal header='Delete Widget'
                    message='Are you sure you want to delete this widget?'>
                    <Button color='link'
                        style={{ padding: '2 4 2 4' }}
                        className='pull-right'
                        size='sm'
                        outline
                        onClick={() => this.removeWidget()}>
                        <FontAwesome name='times' />
                    </Button>
                </ConfirmModal>
                <CardTitle style={{ cursor: 'default',
                    fontSize: 14,
                    display: 'flex',
                    justifyContent: 'center',
                    margin: 0 }}>
                    {this.state.source ? this.state.source.title : 'Loading...'}
                </CardTitle>
            </CardHeader>
            <div className='card-body' ref={this.myRef} style={{ height: '100%', padding: 0 }}>
                <FilterBadge widgetId={this.props._id} />
                {this.getDropdown()}
                {this.getChart(this.state.widgetConfig)}
                {this.getDimDropdown()}
            </div>
        </Card>
    }
}
