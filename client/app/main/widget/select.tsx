import * as React from 'react'
import { Button, Row, Col, ModalHeader, ModalFooter, ModalBody } from 'reactstrap'
import { ChartType, ColumnType } from 'common/constants'
import * as FontAwesome from 'react-fontawesome'

interface Props {
    back: () => void
    cancel: () => void
    done: (chartType: string) => void
}

class State {
    selected: ChartConf
}

class ChartConf {
    name: string
    type: ChartType
    requires: ChartConfReq[]
}

class ChartConfReq {
    count: number
    colType: ColumnType
}

const chartConfList: ChartConf[] = [{
    name: 'Histogram',
    type: 'histogram',
    requires: [{
        count: 1,
        colType: 'number'
    }]
}, {
    name: 'Pie',
    type: 'pie',
    requires: [{
        count: 1,
        colType: 'number'
    }, {
        count: 1,
        colType: 'group'
    }]
}, {
    name: 'Bar',
    type: 'barSingle',
    requires: [{
        count: 1,
        colType: 'number'
    }, {
        count: 1,
        colType: 'group'
    }]
}]

export class SelectWidget extends React.Component<Props, State> {
    state = new State()
    rowSize = 4

    selectConfig (item: ChartConf) {
        this.setState({
            selected: item
        })
    }

    buildRows (): JSX.Element[] {
        const availableCharts = chartConfList.filter(x => true)
        let rows: ChartConf[][] = []
        let position = -1
        availableCharts.forEach((item, index) => {
            if (index % this.rowSize === 0) {
                position++
                rows[position] = []
            }
            rows[position].push(item)
        })

        return rows.map((row, rowIndex) => {
            return (<Row key={rowIndex}>
            {row.map((col, colIndex) => {
                return (<Col key={colIndex} xs={12 / this.rowSize}>
                    <Button
                        onClick={() => this.selectConfig(col)}
                        color={col === this.state.selected ? 'primary' : 'warning'}
                        size='large'>
                        <FontAwesome name='puzzle-piece' size='4x' />
                        <br/>
                        {col.name}
                    </Button>
                </Col>)
            })}
            </Row>)
        })
    }

    renderFooter (): JSX.Element {
        return <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <Button
                    color='secondary'
                    onClick={() => this.props.back()}
                >Back</Button>
            </div>
            <div>
                <Button color='primary' disabled={!this.state.selected}
                    style={{ marginRight: 20 }}
                    onClick={() => this.props.done(this.state.selected.type)}>
                    Create
                </Button>
                <Button color='secondary'
                    onClick={() => this.props.cancel()}>
                    Cancel
                </Button>
            </div>
        </ModalFooter>
    }

    renderModal (): JSX.Element {
        return <div>
            <ModalHeader>Select Chart Type</ModalHeader>
            <ModalBody>{this.buildRows()}</ModalBody>
            {this.renderFooter()}
        </div>
    }

    render () {
        return this.renderModal()
    }
}
