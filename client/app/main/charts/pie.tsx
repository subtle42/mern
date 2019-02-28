// import * as React from 'react'
// import { IWidget } from 'common/models'
// import { scaleBand, scaleLinear } from 'd3'
// // import { scaleBand, scaleLinear } from 'd3-scale'
// // import { max } from 'd3-array'
// // import { axisBottom, axisLeft } from 'd3-axis'
// // import { select } from 'd3-selection'

// interface Props {
//     id: string
//     width: number
//     height: number
// }

// class State {
//     chart: any[] = []
//     data: any[]
// }

// export class Pie extends React.Component<Props, State> {
//     state = new State()
//     xScale = scaleBand()
//     yScale = scaleLinear()
//     config: IWidget
//     radius = Math.min(width, height) / 2;

//     getPath (data, index: number): JSX.Element {
//         return <path key={index}
//             d={}>
//         </path>
//     }

//     getHeight (): number {
//         return this.props.height - this.config.margins.top - this.config.margins.bottom
//     }

//     getWidth (): number {
//         return this.props.width - this.config.margins.left - this.config.margins.right
//     }

//     render () {
//         if (!this.config) return <div />
//         return <svg
//             width={this.props.width}
//             height={this.props.height}>
//             <g transform={`translate(${this.getWidth() / 2}, ${this.getHeight() / 2})`}>
//                 {this.state.chart.map((bin, index) => this.getBar(bin, index))}
//             </g>
//         </svg>
//     }
// }
