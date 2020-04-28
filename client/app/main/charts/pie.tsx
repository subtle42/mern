import * as React from 'react'
import * as d3 from 'd3'
import { BaseChart } from './_base'

export class Pie extends BaseChart {
    arc = d3.arc()
        .innerRadius(0)
    pie = d3.pie()
        .sort(null)
    color = d3.scaleOrdinal(d3.schemeCategory10)
    radius: number

    resize () {
        this.radius = Math.min(this.getHeightWithMargins(), this.getWidthtWithMargins()) / 2
        this.arc.innerRadius(this.radius)
    }

    updateChart (data) {
        this.radius = Math.min(this.getHeightWithMargins(), this.getWidthtWithMargins()) / 2
        this.pie.value(d => d[this.config.measures[0].ref])
        this.arc.innerRadius(this.radius)
        return this.pie(data)
    }

    renderChart () {
        return <g transform={`translate(${this.getHeightWithMargins() / 2},
            ${this.getWidthtWithMargins() / 2})`}>
            {this.chart.map((row, index) => <path
                fill={this.color(`${index}`)}
                d={row.path}>
            </path>)}
        </g>
    }
}
