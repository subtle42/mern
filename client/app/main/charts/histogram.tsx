import * as React from 'react'
import * as d3 from 'd3'
import { store } from 'data/store'
import './style.css'
import { Unsubscribe } from 'redux'
import { IWidget } from 'common/models'

class State {
    chart: any[] = []
    data: any[]
    // config: IWidget
}

interface Props {
    id: string
    width: number
    height: number
}

export class Histogram extends React.Component<Props, State> {
    state = new State()
    xScale = d3.scaleLinear()
    yScale = d3.scaleLinear()
    bins = d3.histogram()
    unsub: Unsubscribe
    data: any[] = []
    config: IWidget

    componentWillUpdate () {
        // if (!this.state.config) return
        // const config = this.state.config
        // this.xScale.rangeRound([0, this.props.width - config.margins.left - config.margins.right])
        // this.yScale.range([this.props.height - config.margins.top - config.margins.bottom, 0])
    }

    updateChart () {
        if (!this.data || this.data.length === 0) return
        const mappedData = this.data.map(d => d[this.config.measures[0].ref])

        this.xScale.domain(d3.extent(mappedData) as any)
        this.bins
            .domain(this.xScale.domain() as any)
            .thresholds(this.xScale.ticks(20))
        const myData = this.bins(mappedData)
        this.yScale.domain([0, d3.max(myData, d => d.length)])
        this.setState({
            chart: myData
        })
    }

    componentDidMount () {
        const config = store.getState().widgets.list.find(w => w._id === this.props.id)
        this.xScale.rangeRound([0, this.props.width - config.margins.left - config.margins.right])
        this.yScale.range([this.props.height - config.margins.top - config.margins.bottom, 0])
        // this.setState({ config })
        this.config = config

        this.unsub = store.subscribe(() => {
            const config = store.getState().widgets.list.find(w => w._id === this.props.id)
            if (this.config !== config) {
                this.config = config
            }

            const data = store.getState().widgets.data[this.props.id] || []
            if (this.data === data) return
            this.data = data
            this.updateChart()
        })
    }

    componentWillUnmount () {
        this.unsub()
    }

    getBarSvg (data, index: number): JSX.Element {
        return <rect key={index}
            fill='steelblue'
            x={this.xScale(data.x0) + 1}
            y={this.yScale(data.length)}
            height={this.yScale(0) - this.yScale(data.length)}
            width={Math.max(0, this.xScale(data.x1) - this.xScale(data.x0) - 1)}>
        </rect>
    }

    render () {
        if (!this.config) return <div />
        return <svg
            width={this.props.width}
            height={this.props.height}>
            <g transform={`translate(${this.config.margins.left}, ${this.config.margins.top})`}>
                {this.state.chart.map((bin, index) => this.getBarSvg(bin, index))}
            </g>
        </svg>
    }
}
