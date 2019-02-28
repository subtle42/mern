import * as React from 'react'
import * as d3 from 'd3'
import { store } from 'data/store'
import './style.css'
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
        // if (!this.state.config) return
        // const config = this.state.config
        // this.xScale.rangeRound([0, this.props.width - config.margins.left - config.margins.right])
        // this.yScale.range([this.props.height - config.margins.top - config.margins.bottom, 0])
    }

    updateChart () {
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

// export const Histogram: React.StatelessComponent<Props> = (props: Props) => {
//     const x = d3.scaleLinear()
//     const y = d3.scaleLinear()
//     const bins = d3.histogram()

//     const setRanges = () => {
//         x.rangeRound([0, props.width - config.margins.left - config.margins.right])
//         y.range([props.height - config.margins.top - config.margins.bottom, 0])
//     }

//     const setDomain = () => {
//         if (!data) return
//         const mappedData = data.map(d => d[config.measures[0].ref])
//         x.domain(d3.extent(mappedData) as any)
//         y.domain([0, d3.max(chart, (d: any) => d.length)])
//     }

//     const [config, setConfig] = React.useState(store.getState().widgets.list.find(w => w._id === props.id))
//     setRanges()
//     setDomain()
//     React.useEffect(() => {
//         const unSub = store.subscribe(() => {
//             const newConfig = store.getState().widgets.list.find(w => w._id === props.id)
//             if (config === newConfig) return
//             setConfig(config)
//             setRanges()
//         })
//         return () => unSub()
//     }, [props.id])

//     const [data, setData] = React.useState(store.getState().widgets.data[props.id] || [])
//     React.useEffect(() => {
//         const unSub = store.subscribe(() => {
//             const newData = store.getState().widgets.data[props.id]
//             if (newData === data) return
//             setData(newData || [])
//             updateChart(newData)
//         })
//         return () => unSub()
//     }, [props.id])

//     const [chart, setChart] = React.useState([])

//     const updateChart = (newData) => {
//         if (!newData || newData.length === 0) return
//         const mappedData = newData.map(d => d[config.measures[0].ref])
//         x.domain(d3.extent(mappedData) as any)
//         bins
//             .domain(x.domain() as any)
//             .thresholds(x.ticks(10))
//         const myData = bins(mappedData)
//         y.domain([0, d3.max(myData, (d: any) => d.length)])
//         setChart(myData)
//     }

//     const getBarSvg = (d: any, index: number): JSX.Element => {
//         return <rect key={index}
//             fill='steelblue'
//             x={x(d.x0) + 1}
//             y={y(d.length)}
//             height={y(0) - y(d.length)}
//             width={Math.max(0, x(d.x1) - x(d.x0) - 1)}>
//         </rect>
//     }

//     const renderSvg = (): JSX.Element => {
//         if (!config) return <div />

//         return <svg
//             width={props.width}
//             height={props.height}>
//             <g transform={`translate(${config.margins.left}, ${config.margins.top})`}>
//                 {chart.map((bin, index) => getBarSvg(bin, index))}
//             </g>
//         </svg>
//     }

//     return renderSvg()
// }
