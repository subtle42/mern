import * as React from 'react'
import { scaleLinear } from 'd3-scale'
import { extent, max, histogram } from 'd3-array'
import { BaseChart } from './_base'

export class Histogram extends BaseChart {
    x = scaleLinear()
    y = scaleLinear()
    step = 0
    // bins = histogram()

    updateChart (data: any[]) {
        data = data.filter(d => d._id !== 'Other')
        let myDomain = [0, 0]
        if (data.length > 0) {
            myDomain = [
                data[0]._id,
                data[data.length - 1]._id
            ]
            this.step = (myDomain[1] - myDomain[0]) / (this.config.other.ticks || 20)
            myDomain[1] = myDomain[1] + this.step
        }

        this.x
            .domain(this.adjustDomain(myDomain, this.config.xAxis))
            .rangeRound([0, this.getWidthtWithMargins()])
        // this.bins
        //     .domain(this.x.domain() as any)
        //     .thresholds(this.x.ticks(this.config.other.ticks || 20))
        // const myData = data.length !== 0 ? this.bins(mappedData) : []

        const yDomain = [0, max(data, d => d.count)] as [number, number]

        this.y
            .domain(this.adjustDomain(yDomain, this.config.yAxis))
            .rangeRound([this.getHeightWithMargins(), 0])

        return data
    }

    renderChart () {
        return <g transform={`translate(${this.config.margins.left}, ${this.config.margins.top})`}>
            {this.state.chart.map((row, index) => <rect key={index}
                fill='steelblue'
                x={this.x(row._id) + 1}
                y={this.y(row.count)}
                height={this.y(0) - this.y(row.count)}
                width={Math.max(0, this.x(row._id + this.step) - this.x(row._id) - 1)}>
            </rect>)}
            {this.getXAxis()}
            {this.getYAxis()}
            {this.getBrush()}
        </g>
    }
}
