import * as React from 'react'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { brush } from 'd3-brush'
import { select, event } from 'd3-selection'
import { BaseChart } from './_base'
import sourceActions from 'data/sources/actions'

export class Scatter extends BaseChart {
    radius: number
    x = scaleLinear()
    y = scaleLinear()
    brush = brush()
        .on('end', () => {
            if (!event.selection) {
                return sourceActions.addMultipleFilters(this.config.sourceId, this.config.dimensions.map(dim => {
                    return {
                        dimension: dim,
                        filter: []
                    }
                }))
            }
            let box: number[][] = [...event.selection]
            const x = box[0][0]
            const y = box[1][1]
            const x1 = box[1][0]
            const y1 = box[0][1]

            let response = []
            response.push([x, x1])
            response.push([y, y1])
            response[0] = response[0].map(d => this.x.invert(d))
            response[1] = response[1].map(d => this.y.invert(d))

            sourceActions.addMultipleFilters(this.config.sourceId, response.map((row, index) => {
                return {
                    dimension: this.config.dimensions[index],
                    filter: row
                }
            }))
        })

    updateChart (data: any[]) {
        const myData = data.slice(0, 1000)
        this.radius = 3.5
        this.x
            .rangeRound([0, this.getWidthtWithMargins()])
            .domain(this.adjustDomain(
                extent(myData, d => d[this.config.dimensions[0]]) as any, this.config.xAxis)
            )
        this.y
            .rangeRound([this.getHeightWithMargins(), 0])
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
            {this.getBrush()}
        </g>
    }
}
