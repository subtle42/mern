import * as React from 'react'
import { store } from 'data/store'
import { Unsubscribe } from 'redux'
import { IWidget } from 'common/models'

class State {
    chart: any[] = []
}

interface Props {
    id: string
}

export abstract class BaseChart extends React.Component<Props, State> {
    private data: any[]
    private unsub: Unsubscribe
    state = new State()
    chart: any[] = []
    config: IWidget
    height: number
    width: number

    private _updateChart () {
        if (!this.config) return
        if (!this.height || !this.width) return
        if (!this.data || this.data.length === 0) return
        if (!this.data[0][this.config.measures[0].ref]) return

        this.setState({
            chart: this.updateChart(this.data)
        })
    }

    abstract updateChart (data: any[])
    abstract renderChart (): JSX.Element

    componentDidMount () {
        this.config = store.getState().widgets.list.find(w => w._id === this.props.id)
        this.data = store.getState().data.results[this.props.id]
        this._updateChart()

        this.unsub = store.subscribe(() => {
            if (store.getState().widgets.sizes[this.props.id]) {
                const { width, height } = store.getState().widgets.sizes[this.props.id]

                if (this.width !== width || this.height !== height) {
                    this.width = width
                    this.height = height
                    this._updateChart()
                }
            }

            const config = store.getState().widgets.list.find(w => w._id === this.props.id)
            if (this.config !== config) {
                this.config = config
                this._updateChart()
            }

            const data = store.getState().data.results[this.props.id] || []
            if (this.data !== data) {
                this.data = data
                this._updateChart()
            }
        })
    }

    getWidthtWithMargins (): number {
        return this.width - this.config.margins.left - this.config.margins.right
    }

    getHeightWithMargins (): number {
        return this.height - this.config.margins.top - this.config.margins.bottom
    }

    componentWillUnmount () {
        this.unsub()
    }

    render () {
        if (!this.config) return <div />
        return <svg
            width={this.width}
            height={this.height}>
            {this.renderChart()}
        </svg>
    }
}
