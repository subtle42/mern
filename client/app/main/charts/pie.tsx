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

    updateChart (data) {
        this.radius = Math.min(this.getHeightWithMargins(), this.getWidthtWithMargins()) / 2
        this.pie.value(d => d[this.config.measures[0].ref])
        this.arc.innerRadius(this.radius)
        console.log(this.pie(data))
        return this.pie(data)
    }

    renderChart () {
        return <g transform={`tanslate(${this.getHeightWithMargins() / 2},
            ${this.getWidthtWithMargins() / 2})`}>
            {this.chart.map((row, index) => <path
                fill={this.color(`${index}`)}
                d={row.path}>
            </path>)}
        </g>
    }
}
