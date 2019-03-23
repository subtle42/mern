import * as React from 'react'
import { scaleLinear, scaleTime } from 'd3-scale'
import { line } from 'd3-shape'
import { timeParse } from 'd3-time-format'
import { extent } from 'd3-array'
import { BaseChart } from './_base'

export class Line extends BaseChart {
    line = line()
    timeParser = timeParse('%Y-%m-%dT%H:%M:%S.%LZ')
    x = scaleTime()
    y = scaleLinear()

    updateChart (data: any[]) {
        data = data.map(row => {
            row = { ...row }
            row._id = this.timeParser(row._id)
            return row
        })

        this.x
            .range([0, this.getWidthtWithMargins()])
            .domain(this.adjustDomain(
                extent(data, d => d._id) as any, this.config.xAxis)
            )
        this.y
            .range([this.getHeightWithMargins(), 0])
            .domain(this.adjustDomain(
                extent(data, d => d[this.config.measures[0].ref]) as any, this.config.yAxis)
            )
        this.line
            .x(d => this.x(d['_id']))
            .y(d => this.y(d[this.config.measures[0].ref]))

        return data
    }

    renderChart () {
        return <g transform={`translate(${this.config.margins.left}, ${this.config.margins.top})`}>
            <path className='line'
                d={this.line(this.state.chart)}
                style={{
                    fill: 'none',
                    stroke: 'steelblue',
                    strokeWidth: 1
                }}></path>
            {this.getYAxis()}
            {this.getXAxis()}
            {this.getBrush()}
        </g>
    }
}
