import * as React from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { BaseChart } from './_base'
import { max } from 'd3-array'
import sourceActions from 'data/sources/actions'
import { store } from 'data/store'

export class BarGrouped extends BaseChart {
    x = scaleBand()
        .paddingInner(.1)
    xInner = scaleBand()
        .padding(0.05)
    y = scaleLinear()

    updateChart (data) {
        const options: string[] = data.map(d => d._id)
        this.x
            .domain(options)
            .rangeRound([0, this.getWidthtWithMargins()])
        this.xInner
            .domain(this.config.measures.map(m => m.ref))
            .rangeRound([0, this.x.bandwidth()])
        const yDomain = [0, max(data, d => max(this.config.measures, key => d[key.ref])) as any]
        this.y
            .domain(this.adjustDomain(yDomain, this.config.yAxis))
            .rangeRound([this.getHeightWithMargins(), 0])

        const mappedData = {}
        options.forEach(key => {
            mappedData[key] = data.filter(d => d._id === key)
        })
        return mappedData
    }

    renderBar (row, measure: string, index: number): JSX.Element {
        return <rect key={index}
            fill='steelblue'
            x={this.xInner(measure)}
            y={this.y(row[measure])}
            height={this.y(0) - this.y(row[measure])}
            width={this.xInner.bandwidth()}>
        </rect>
    }

    renderBarGroup (key: string): JSX.Element {
        let count = 0
        return this.state.chart[key].map((rows, j) => {
            return this.config.measures.map(m => {
                count++
                return this.renderBar(rows, m.ref, count)
            })
        })
    }

    updateFilter (key: string, e: React.FormEvent<any>) {
        e.stopPropagation()
        const mySourceFilter = store.getState().sources.filters[this.config.sourceId]
        let myFilterDimension = []
        if (mySourceFilter) {
            myFilterDimension = mySourceFilter[this.config.dimensions[0]] || []
        }
        if (myFilterDimension.find(x => x === key)) {
            myFilterDimension = myFilterDimension.filter(x => x !== key)
        } else {
            myFilterDimension.push(key)
        }
        sourceActions.addFilter(this.config.sourceId, this.config.dimensions[0], myFilterDimension)
    }

    renderChart () {
        return <g transform={`translate(${this.config.margins.left}, ${this.config.margins.top})`}>
            {Object.keys(this.state.chart).map((key, i) => <g key={i}
                style={{ cursor: 'pointer' }}
                onClick={(e) => this.updateFilter(key, e)}
                transform={`translate(${this.x(key)}, 0)`}>
                {this.renderBarGroup(key)}
            </g>)}
            {this.getYAxis()}
            {this.getXAxis()}
        </g>
    }
}
