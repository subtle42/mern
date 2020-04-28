import * as React from 'react'
import * as d3 from 'd3'
import { BaseChart } from './_base'

export class StackedBart extends BaseChart {
    x = d3.scaleBand()
        .paddingInner(0.05)
        .align(0.1)
    y = d3.scaleLinear()
    stack = d3.stack()
    color = d3.scaleOrdinal(d3.schemeCategory10)

    resize () {
        this.x.range([0, this.getWidthtWithMargins()])
        this.y.range([this.getHeightWithMargins(), 0])
    }

    updateChart (data: any[]) {
        data = data.map(d => {
            d.total = this.config.measures.reduce(m => d[m.ref])
            return d
        })
        this.x.domain(data.map(d => d[this.config.dimensions[0]]))
        this.y.domain([0, d3.max(data, d => d.total)])

        const keys = this.config.measures.map(m => m.ref)
        this.color.domain(keys)
        this.stack.keys(keys)
        const tmp = this.stack(data)
    }

    getBar (row, index: number): JSX.Element {
        return <rect key={index}
            x={this.x(row.data[this.config.dimensions[0]])}
            y={this.y(row[1])}
            height={this.y(row[0]) - this.y(row[1])}
            width={this.x.bandwidth()}>
        </rect>
    }
    renderChart () {
        return <g transform={`tanslate(${this.getHeightWithMargins() / 2},
            ${this.getWidthtWithMargins() / 2})`}>
            {this.chart.map((row, i) => <g key={i}
                fill={row.key}>
                {row.data.map((r, j) => this.getBar(r, j))}
            </g>)}
        </g>
    }
}
