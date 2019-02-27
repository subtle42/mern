import * as React from 'react'
// import { scaleBand, scaleLinear } from 'd3-scale'
// import { max } from 'd3-array'
// import { axisBottom, axisLeft } from 'd3-axis'
// import { select } from 'd3-selection'

interface Props {
    data: any[]
    svgHeight: number
    svgWidth: number
    margin: {[key: string]: number}
}


export const BarSingle: React.StatelessComponent<Props> = (props: Props) => {
    // let width = props.svgWidth - props.margin.left - props.margin.right
    // let height = props.svgHeight - props.margin.top - props.margin.bottom
    // const x = scaleBand()
    //     .rangeRound([0, width])
    //     .domain(props.data.map(d => d._id))
    // const y = scaleLinear()
    //     .rangeRound([height, 0])
    //     .domain([0, max(props.data, d => d.count)])

    return <svg width={props.svgWidth} height={props.svgHeight}>
        <g transform={`translate(${props.margin.left}, ${props.margin.top})`}>
            <g
                // className='axis axis--x'
                // transform={`translate(0, ${height})`}
                // ref={node => select(node).call(axisBottom(x))}
            />
            <g className='axis axis--y'>
                {/* <g ref={node => select(node).call(axisLeft(y).ticks(10, '%'))} /> */}
                {/* <text transform='rotate(-90)' y='6' dy='0.71em' textAnchor='end'>
                Frequency
                </text> */}
            </g>
            {/* {props.data.map(d => (
                <rect
                key={d.letter}
                className='bar'
                x={x(d.letter)}
                y={y(d.frequency)}
                width={x.bandwidth()}
                height={height - y(d.frequency)}
                />
            ))} */}
        </g>
  </svg>
}
