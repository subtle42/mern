import * as React from 'react'
import { store } from 'data/store'
import { Unsubscribe } from 'redux'
import { IWidget, AxisConfig } from 'common/models'
import sourceActions from 'data/sources/actions'
import { ScaleLinear, ScaleBand } from 'd3-scale'
import { axisBottom, axisLeft, Axis } from 'd3-axis'
import { format } from 'd3-format'
import { select } from 'd3-selection'

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
    xAxis: Axis<any>
    yAxis: Axis<any>
    x: ScaleLinear<number, number> | ScaleBand<string>
    y: ScaleLinear<number, number>

    private _updateChart () {
        if (!this.config) return
        if (!this.height || !this.width) return
        if (!this.data || this.data.length === 0) return
        if (!this.data[0][this.config.measures[0].ref]) return

        const chart = this.updateChart(this.data)
        this.yAxis = axisLeft(this.y)
        this.xAxis = axisBottom(this.x as any)
        this.setState({ chart })
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

    adjustDomain (domain: any[], axis: AxisConfig): [number, number] {
        if (axis.min) {
            domain[0] = domain[0] < axis.min ? domain[0] : axis.min
        }
        if (axis.max) {
            domain[1] = domain[1] > axis.max ? domain[1] : axis.max
        }

        return domain as [number, number]
    }

    clear () {
        sourceActions.addFilter(this.config.sourceId, this.config.dimensions[0], [])
    }

    getXAxis (): JSX.Element {
        if (!this.xAxis || !this.config.xAxis.show) return
        return <g transform={`translate(0, ${this.getHeightWithMargins()})`}
            className='xAxis'
            ref={node => select(node).call(
                this.xAxis
                .ticks(this.config.xAxis.ticks || 10)
            )}>
        </g>
    }

    getYAxis (): JSX.Element {
        if (!this.yAxis || !this.config.yAxis.show) return
        return <g transform={`translate(${this.config.margins.left}, 0)`}
            className='xAxis'
            ref={node => select(node).call(
                this.yAxis
                .ticks(this.config.yAxis.ticks || 10)
                .tickFormat(format('~s'))
            )}>
        </g>
    }

    render () {
        if (!this.config) return <div />
        return <svg
            onClick={() => this.clear()}
            width={this.width}
            height={this.height}>
            {this.renderChart()}
        </svg>
    }
}
