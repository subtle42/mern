import * as React from 'react'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { BaseChart } from './_base'

export class Scatter extends BaseChart {
    radius: number
    x = scaleLinear()
    y = scaleLinear()

    updateChart (data) {
        this.radius = 3.5
        this.x
            .range([0, this.getWidthtWithMargins()])
            .domain(extent(data, d => d[this.config.measures[0].ref]) as any)
        this.y
            .range([this.getHeightWithMargins(), 0])
            .domain(extent(data, d => d[this.config.measures[1].ref]) as any)
    }

    renderChart () {
        return <g transform={`tanslate(${this.config.margins.left}, ${this.config.margins.top}`}>
            {this.chart.map((row, index) => <circle key={index}
                r={this.radius}
                cx={this.x(row[this.config.measures[0].ref])}
                cy={this.y(row[this.config.measures[1].ref])}
                style={{ fill: 'blue' }}>
            </circle>)}
        </g>
    }
}
