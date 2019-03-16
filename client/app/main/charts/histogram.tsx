import * as React from 'react'
import { scaleLinear } from 'd3-scale'
import { extent, max, histogram } from 'd3-array'
import { BaseChart } from './_base'

export class Histogram extends BaseChart {
    x = scaleLinear()
    y = scaleLinear()
    bins = histogram()

    updateChart (data) {
        const mappedData = data.map(d => d[this.config.measures[0].ref])

        this.x
            .domain(this.adjustDomain(extent(mappedData), this.config.yAxis))
            .rangeRound([this.config.margins.left, this.getWidthtWithMargins()])
        this.bins
            .domain(this.x.domain() as any)
            .thresholds(this.x.ticks(this.config.other.ticks || 20))
        const myData = this.bins(mappedData)

        const yDomain = [0, max(myData, (d: any) => d.length)] as [number, number]

        this.y
            .domain(this.adjustDomain(yDomain, this.config.yAxis))
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
            {this.getXAxis()}
            {this.getYAxis()}
        </g>
    }
}
