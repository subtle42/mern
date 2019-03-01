import * as React from 'react'
import { IWidget, ISource, ISourceColumn } from 'common/models'
import { store } from 'data/store'
import WidgetActions from 'data/widgets/actions'
import { Histogram } from '../charts/histogram'
import { MeasureDropdown } from '../charts/chart'
import * as FontAwesome from 'react-fontawesome'
import { Card, CardBody, CardTitle, Button, CardHeader } from 'reactstrap'
import { ConfirmModal } from '../../_common/confirmation'
import NotifyActions from 'data/notifications/actions'
import { EditButton } from './edit'

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
        const height = this.myRef.current.offsetHeight - 60
        if (this.state.width === width && this.state.height === height) return
        this.setState({
            width,
            height
        })
    }

    componentDidMount () {
        this.getInitalState()

        this.unsubscribe = store.subscribe(() => {
            let newValue = store.getState().widgets.list.filter(w => w._id === this.props._id)[0]
            if (this.state.widgetConfig !== newValue) {
                this.setState({
                    widgetConfig: newValue
                })
                WidgetActions.query(newValue)
                .catch(err => console.warn(err))
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
        .catch(err => NotifyActions.notify('danger', JSON.stringify(err)))
    }

    getDropdown (): JSX.Element {
        if (!this.state.widgetConfig) return
        return <MeasureDropdown
            sourceId={this.state.widgetConfig.sourceId}
            colId={this.state.widgetConfig.measures[0].ref}
            onColUpdate={this.onColUpdate}
            colType='number'
        />
    }

    onColUpdate = (col: ISourceColumn): void => {
        this.state.widgetConfig.measures[0] = {
            ref: col.ref
        }
        WidgetActions.update(this.state.widgetConfig)
    }

    render () {
        return (<Card style={{ height: '100%' }}>
            <CardHeader style={{ padding: 0, border: 0 }} color='secondary'>
                <EditButton id={this.props._id} />
                <ConfirmModal header='Delete Widget'
                    message='Are you sure you want to delete this widget?'>
                    <Button onClick={() => this.removeWidget()}
                        className='pull-right'
                        color='secondary'
                        outline size='small'>
                        <FontAwesome name='times' />
                    </Button>
                </ConfirmModal>
                <CardTitle style={{ margin: 0 }}>{this.state.source ? this.state.source.title : 'Loading..'}</CardTitle>
            </CardHeader>
            <CardBody style={{ height: '100%', padding: 0 }}>
                <div ref={this.myRef} style={{ height: '100%', width: '100%' }}>
                    {this.getDropdown()}
                    <Histogram
                        id={this.props._id}
                        height={this.state.height}
                        width={this.state.width} />
                </div>
            </CardBody>
        </Card>)
    }
}
