import * as React from 'react'
import { scaleLinear } from 'd3-scale'
import { extent, max, histogram } from 'd3-array'
import { brushX } from 'd3-brush'
import { event } from 'd3-selection'
import { BaseChart } from './_base'
import { select } from 'd3'

export class Histogram extends BaseChart {
    x = scaleLinear()
    y = scaleLinear()
    bins = histogram()

    updateChart (data) {
        const mappedData = data.map(d => d[this.config.dimensions[0]])

        this.x
            .domain(this.adjustDomain(extent(mappedData), this.config.yAxis))
            .range([0, this.getWidthtWithMargins()])
        this.bins
            .domain(this.x.domain() as any)
            .thresholds(this.x.ticks(this.config.other.ticks || 20))
        const myData = this.bins(mappedData)

        const yDomain = [0, max(myData, (d: any) => d.length)] as [number, number]

        this.y
            .domain(this.adjustDomain(yDomain, this.config.yAxis))
            .range([this.getHeightWithMargins(), 0])

        const var1: [number, number] = [0, 0]
        const var2: [number, number] = [this.getWidthtWithMargins(), this.getHeightWithMargins()]
        this.brush.extent([var1, var2])

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
            {this.getBrush()}
        </g>
    }
}
