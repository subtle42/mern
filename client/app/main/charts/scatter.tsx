import * as React from 'react'
import { scaleLinear } from 'd3-scale'
import { extent } from 'd3-array'
import { brush } from 'd3-brush'
import { select, event } from 'd3-selection'
import { BaseChart } from './_base'
import sourceActions from 'data/sources/actions'

interface BrushBounds {
    x: number
    x1: number
    y: number
    y1: number
}

export class Scatter extends BaseChart {
    myRef = React.createRef()
    radius: number
    x = scaleLinear()
    y = scaleLinear()
    myBounds: BrushBounds

    brush = brush()
        .on('brush', () => {
            if (!event.selection) return
            const { x,y,x1,y1 } = this.getBrushBounds()
            this.myBounds = this.getBrushBounds()
            select(this.myRef.current as any)
            .selectAll('circle')
                .classed('notSelected', (d, index) => {
                    return !(this.state.chart[index][this.config.dimensions[0]] > x
                        && this.state.chart[index][this.config.dimensions[0]] < x1
                        && this.state.chart[index][this.config.dimensions[1]] > y
                        && this.state.chart[index][this.config.dimensions[1]] < y1
                    )
                })
        })
        .on('end', () => {
            if (!event.selection) {
                // this.myBounds = undefined
                select(this.myRef.current as any)
                .selectAll('circle')
                .classed('notSelected', () => false)
                return sourceActions.addMultipleFilters(this.config.sourceId, this.config.dimensions.map(dim => {
                    return {
                        dimension: dim,
                        filter: []
                    }
                }))
            }
            const { x,y,x1,y1 } = this.getBrushBounds()

            let response = []
            response.push([x, x1])
            response.push([y, y1])

            sourceActions.addMultipleFilters(this.config.sourceId, response.map((row, index) => {
                return {
                    dimension: this.config.dimensions[index],
                    filter: row
                }
            }))
        })

    getBrushBounds (): BrushBounds {
        const box: number[][] = [...event.selection]
        return {
            x: this.x.invert(box[0][0]),
            x1: this.x.invert(box[1][0]),
            y1: this.y.invert(box[0][1]),
            y: this.y.invert(box[1][1])
        }
    }

    updateChart (data: any[]) {
        select(this.myRef.current as any)
        .selectAll('circle')
        .classed('notSelected', () => false)
        if (this.myBounds) {
            select(this.myRef.current as any)
                .selectAll('.brushArea')
                .call(this.brush.move, null)
        }

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

    getCircleClass (row: any[]): string {
        if (!this.myBounds) return ''
        if (!(row[this.config.dimensions[0]] > this.myBounds.x
            && row[this.config.dimensions[0]] < this.myBounds.x1
            && row[this.config.dimensions[1]] > this.myBounds.y
            && row[this.config.dimensions[1]] < this.myBounds.y1
        )) {
            return 'notSelected'
        }
        return ''
    }

    renderChart () {
        return <g ref={this.myRef as any} transform={`translate(${this.config.margins.left}, ${this.config.margins.top})`}>
            {this.state.chart.map((row, index) => <circle key={index}
                r={this.radius}
                className={this.getCircleClass(row)}
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
