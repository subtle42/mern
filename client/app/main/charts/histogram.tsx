import * as React from 'react'
import * as d3 from 'd3'
import { store } from 'data/store'
import { Unsubscribe } from 'redux'
import { IWidget } from 'common/models'

class State {
    chart: any[] = []
    data: any[]
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
        this.updateChart()
    }

    shouldComponentUpdate (nextProps: Props, nextState: State) {
        if (!nextProps.height || !nextProps.width) return false
        if (nextState.chart.length !== this.state.chart.length) return true
        if (nextProps.height === this.props.height && nextProps.width === this.props.width) return false
        return true
    }

    updateChart () {
        if (!this.props.height || !this.props.width) return
        if (!this.data || this.data.length === 0) return
        const mappedData = this.data.map(d => d[this.config.measures[0].ref])
        this.setRanges()
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
        this.config = store.getState().widgets.list.find(w => w._id === this.props.id)
        this.setRanges()

        this.unsub = store.subscribe(() => {
            const config = store.getState().widgets.list.find(w => w._id === this.props.id)
            if (this.config !== config) {
                this.config = config
            }

            const data = store.getState().widgets.data[this.props.id] || []
            if (this.data !== data) {
                this.data = data
                this.updateChart()
            }
        })
    }

    setRanges () {
        if (!this.config) return
        if (!this.props.height || !this.props.width) return
        this.xScale.rangeRound([0, this.props.width - this.config.margins.left - this.config.margins.right])
        this.yScale.range([this.props.height - this.config.margins.top - this.config.margins.bottom, 0])
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
