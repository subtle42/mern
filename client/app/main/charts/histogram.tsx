import * as React from 'react'
// import * as d3 from 'd3'
import { store } from 'data/store'
import './style.css'

interface Props {
    _id?: any
}

class State {
    height: number = 0
    width: number = 0
}

export class Test extends React.Component<TestProps, {}> {
    height: number = 0
    width: number = 0
    svg: d3.Selection<any, {}, null, undefined>
    focus: d3.Selection<any, {}, null, undefined>
    bins: d3.Bin<number, number>[]
    chart: d3.Selection<d3.BaseType, d3.Bin<number, number>, d3.BaseType, {}>
    xScale: d3.ScaleLinear<number, number>
    yScale: d3.ScaleLinear<number, number>

    componentDidMount () {
        this.setState({
            height: this.props.height,
            width: this.props.width
        })
        setTimeout(() => this.drawChart(), 20)

        store.subscribe(() => {
            const mySize = store.getState().widgets.sizes['dan']

            if (this.width !== mySize.width || this.height !== mySize.height) {
                this.width = mySize.width
                this.height = mySize.height
                this.onResize()
            }
        })
    }

    onResize () {
        // this.focus.attr("transform", `translate(10, 10`);
        this.xScale.rangeRound([0, this.width])
        this.yScale.range([this.height, 0])

        // this.svg

        this.chart
            .attr('width', this.xScale(this.bins[0].x1) - this.xScale(this.bins[0].x0) - 1)
            .attr('height', d => this.height - this.yScale(d.length))
    }

    drawChart () {
        // const data = d3.range(1000).map(d3.randomBates(10))
        // const formatCount = d3.format(',.0f')
        // this.svg = d3.select(this.props.node)

        // this.svg.select('g').remove()

        // let margin = { top: 10, right: 10, left: 10, bottom: 10 }
        // let width = this.props.width - margin.left - margin.right
        // let height = this.props.height - margin.top - margin.bottom
        // this.focus = this.svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

        // this.xScale = d3.scaleLinear()
        //     .rangeRound([0, width])

        // this.bins = d3.histogram()
        //     .domain(this.xScale.domain() as any)
        //     .thresholds(this.xScale.ticks(20))(data)

        // this.yScale = d3.scaleLinear()
        //     .domain([0, d3.max(this.bins, d => d.length)])
        //     .range([height, 0])

        // let bar = this.focus.selectAll('.bar')
        //     .data(this.bins)
        //     .enter().append('g')
        //     .attr('class', 'bar')
        //     .attr('transform', d => `translate(${this.xScale(d.x0)}, ${this.yScale(d.length)})`)

        // bar.append('rect')
        //     .attr('x', 1)
        //     .attr('width', this.xScale(this.bins[0].x1) - this.xScale(this.bins[0].x0) - 1)
        //     .attr('height', d => height - this.yScale(d.length))

        // bar.append('text')
        //     .attr('dy', '.75em')
        //     .attr('y', 6)
        //     .attr('x', (this.xScale(this.bins[0].x1 - this.xScale(this.bins[0].x0))) / 2)
        //     .attr('text-anchor', 'middle')
        //     .text(d => formatCount(d.length))

        // this.focus.append('g')
        //     .attr('class', 'axis axis--x')
        //     .attr('transform', `translate(0, ${height})`)
        //     .call(d3.axisBottom(this.xScale))

        // this.chart = bar
    }

    render () {
        return <div/>
    }
}

export class Histogram extends React.Component<Props, State> {
    node

    componentDidMount () {
        setTimeout(() => this.drawChart(), 0)
    }

    // componentDidUpdate() {
    //     this.setState({
    //         width: this.node.parentElement.offsetWidth,
    //         height: this.node.parentElement.offsetHeight - 100
    //     })
    // }

    drawChart () {
        // const data = d3.range(1000).map(d3.randomBates(10));
        // const formatCount = d3.format(",.0f");
        // let svg = d3.select(this.node);

        // console.log("offsetHeight", this.node.height);
        // let margin = {top:10, right:10, left:10, bottom:10};
        // let width = (svg.attr("width") as any ) - margin.left - margin.right,
        this.setState({
            width: this.node.parentElement.offsetWidth,
            height: this.node.parentElement.offsetHeight - 100
        })
    }

    render () {
        return <svg ref={node => this.node = node} style={{ height: '100%', width: '100%' }}>
            {this.node && <Test _id='dan' {...this.state} node={this.node} />}
        </svg>
    }
}

interface TestProps {
    height: number
    width: number
    _id: string
    node: any
}

// class TestState {
//     height: number
//     width: number
// }
