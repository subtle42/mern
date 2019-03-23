import * as React from 'react'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { BaseChart } from './_base'

export class Scatter extends BaseChart {
    radius: number
    x = scaleLinear()
    y = scaleLinear()

    updateChart (data: any[]) {
        const myData = data.slice(0, 1000)
        this.radius = 3.5
        this.x
            .range([0, this.getWidthtWithMargins()])
            .domain(this.adjustDomain(
                extent(myData, d => d[this.config.dimensions[0]]) as any, this.config.xAxis)
            )
        this.y
            .range([this.getHeightWithMargins(), 0])
            .domain(this.adjustDomain(
                extent(myData, d => d[this.config.dimensions[1]]) as any, this.config.yAxis)
            )
        return myData
    }

    renderChart () {
        return <g transform={`translate(${this.config.margins.left}, ${this.config.margins.top})`}>
            {this.state.chart.map((row, index) => <circle key={index}
                r={this.radius}
                cx={this.x(row[this.config.dimensions[0]])}
                cy={this.y(row[this.config.dimensions[1]])}
                style={{ fill: 'steelblue' }}>
            </circle>)}
            {this.getYAxis()}
            {this.getXAxis()}
        </g>
    }
}
