import * as React from 'react'
import * as d3 from 'd3'
import { BaseChart } from './_base'

export class Histogram extends BaseChart {
    x = d3.scaleLinear()
    y = d3.scaleLinear()
    bins = d3.histogram()

    updateChart (data) {
        const mappedData = data.map(d => d[this.config.measures[0].ref])
        this.x
            .domain(d3.extent(mappedData) as any)
            .rangeRound([0, this.getWidthtWithMargins()])
        this.bins
            .domain(this.x.domain() as any)
            .thresholds(this.x.ticks(20))
        const myData = this.bins(mappedData)
        this.y
            .domain([0, d3.max(myData, d => d.length)])
            .range([this.getHeightWithMargins(), 0])
        return myData
    }

    renderChart () {
        return <g transform={`translate(${this.config.margins.left}, ${this.config.margins.top})`}>
            {this.state.chart.map((row, index) => <rect key={index}
                fill='steelblue'
                x={this.x(row.x0) + 1}
                y={this.y(row.length)}
                height={this.y(0) - this.y(row.length)}
                width={Math.max(0, this.x(row.x1) - this.x(row.x0) - 1)}>
            </rect>)}
        </g>
    }
}
