import * as React from 'react'
import Card from 'reactstrap/lib/Card'
import CardHeader from 'reactstrap/lib/CardHeader'
import Button from 'reactstrap/lib/Button'
import CardTitle from 'reactstrap/lib/CardTitle'
import CardBody from 'reactstrap/lib/CardBody'
import * as FontAwesome from 'react-fontawesome'

import { IWidget, ISource, ISourceColumn } from 'common/models'
import { store } from 'data/store'
import WidgetActions from 'data/widgets/actions'
import NotifyActions from 'data/notifications/actions'

import { Histogram } from '../charts/histogram'
import { BarGrouped } from '../charts/barGrouped'
// import { MeasureDropdown } from '../charts/chart'
import { ColumnButton } from './content/columnBtn'
import { ConfirmModal } from '../../_common/confirmation'
import { EditButton } from './edit'
import { Scatter } from '../charts/scatter';
import { Line } from '../charts/line';

interface Props {
    _id?: any
}

class State {
    widgetConfig: IWidget = undefined
    source: ISource = undefined
    width: number = 0
    height: number = 0
}

export class Widget extends React.Component<Props, State> {
    state = new State()
    unsubscribe: Function
    myRef: any = React.createRef()

    getInitalState () {
        const storeState = store.getState()
        const widget = storeState.widgets.list.filter(w => w._id === this.props._id)[0]
        let source = undefined
        if (widget) {
            source = storeState.sources.list.filter(s => s._id === widget.sourceId)[0]
            WidgetActions.query(widget)
            .catch(err => console.warn(err))
        }

        this.setState({
            widgetConfig: widget,
            source: source
        })
    }

    componentDidUpdate () {
        const width = this.myRef.current.offsetWidth
        const height = this.myRef.current.offsetHeight - 85
        if (!this.state.widgetConfig) return
        if (this.state.width === width && this.state.height === height) return
        WidgetActions.setSize(this.state.widgetConfig._id, width, height)
    }

    componentDidMount () {
        this.getInitalState()

        this.unsubscribe = store.subscribe(() => {
            let newValue = store.getState().widgets.list.filter(w => w._id === this.props._id)[0]
            if (this.state.widgetConfig !== newValue) {
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
        WidgetActions.delete(this.props._id)
        .then(() => NotifyActions.success('Widget removed'))
        .catch(err => NotifyActions.error(err.message))
    }

    getDropdown (): JSX.Element {
        if (!this.state.widgetConfig) return
        if (this.state.widgetConfig.type === 'scatter') {
            return <div style={{ display: 'flex', justifyContent: 'center', height: 29 }}>
                <ColumnButton
                    colType='number'
                    sourceId={this.state.widgetConfig.sourceId}
                    colId={this.state.widgetConfig.dimensions[1]}
                    onColUpdate={col => {
                        this.state.widgetConfig.dimensions[1] = col.ref
                        WidgetActions.update(this.state.widgetConfig)
                        .then(() => WidgetActions.query(this.state.widgetConfig))
                    }}/>
            </div>
        }

        return <div style={{ display: 'flex', justifyContent: 'center', height: 29 }}>
            {this.state.widgetConfig.measures.map((measure, index) => {
                return <ColumnButton
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
        if (this.state.widgetConfig.type === 'scatter') {
            return <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ColumnButton
                    colType='number'
                    sourceId={this.state.widgetConfig.sourceId}
                    colId={this.state.widgetConfig.dimensions[0]}
                    onColUpdate={col => {
                        this.state.widgetConfig.dimensions[0] = col.ref
                        WidgetActions.update(this.state.widgetConfig)
                        .then(() => WidgetActions.query(this.state.widgetConfig))
                    }}/>
            </div>
        }


        return <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ fontSize: 10, paddingTop: 7 }}>Grouped by </div>
            {this.state.widgetConfig.dimensions.map((dim, index) => {
                return <ColumnButton
                    key={index}
                    colType={this.state.widgetConfig.type === 'histogram' ? 'number' : 'group'}
                    sourceId={this.state.widgetConfig.sourceId}
                    colId={dim}
                    onColUpdate={col => {
                        this.state.widgetConfig.dimensions[index] = col.ref
                        WidgetActions.update(this.state.widgetConfig)
                        .then(() => WidgetActions.query(this.state.widgetConfig))
                    }}/>
            })}
        </div>
    }

    onColUpdate = (col: ISourceColumn): void => {
        this.state.widgetConfig.measures[0] = {
            ref: col.ref
        }
        WidgetActions.update(this.state.widgetConfig)
        .then(() => WidgetActions.query(this.state.widgetConfig))
        .catch(err => NotifyActions.success(err.message))
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
            <CardHeader style={{ padding: 0, border: 0 }} color='secondary'>
                <EditButton id={this.props._id} />
                <ConfirmModal header='Delete Widget'
                    message='Are you sure you want to delete this widget?'>
                    <Button color='secondary'
                        className='pull-right'
                        size='sm'
                        outline
                        onClick={() => this.removeWidget()}>
                        <FontAwesome name='times' />
                    </Button>
                </ConfirmModal>
                <CardTitle style={{ display: 'flex', justifyContent: 'center', margin: 0 }}>
                    {this.state.source ? this.state.source.title : 'Loading..'}
                </CardTitle>
            </CardHeader>
            <CardBody style={{ height: '100%', padding: 0 }}>
                <div ref={this.myRef} style={{ height: '100%', width: '100%' }}>
                    {this.getDropdown()}
                    {this.getChart(this.state.widgetConfig)}
                    {this.getDimDropdown()}
                </div>
            </CardBody>
        </Card>
    }
}
