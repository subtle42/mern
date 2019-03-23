import * as React from 'react'
import { Button, Row, Col, ModalHeader, ModalFooter, ModalBody } from 'reactstrap'
import { ColumnType } from 'common/constants'
import * as FontAwesome from 'react-fontawesome'

interface Props {
    back: () => void
    cancel: () => void
    done: (chartType: string) => void
}

class ChartConf {
    name: string
    type: string
    requires: {
        count: number,
        colType: ColumnType
    }[]
}

const chartConfList: ChartConf[] = [{
    name: 'Histogram',
    type: 'histogram',
    requires: [{
        count: 1,
        colType: 'number'
    }]
}, {
    name: 'Bar',
    type: 'barGroup',
    requires: [{
        count: 1,
        colType: 'number'
    }, {
        count: 1,
        colType: 'group'
    }]
}, {
    name: 'Scatter',
    type: 'scatter',
    requires: [{
        count: 2,
        colType: 'number'
    }]
}, {
    name: 'Line',
    type: 'line',
    requires: [{
        count: 1,
        colType: 'datetime'
    }, {
        count: 1,
        colType: 'number'
    }]
}]

export const SelectChartType: React.FunctionComponent<Props> = (props: Props) => {
    const [selected, setSelected] = React.useState(undefined as ChartConf)
    const rowSize = 4

    const buildRows = (): JSX.Element[] => {
        const availableCharts = chartConfList.filter(x => x)
        let rows: ChartConf[][] = []
        let position = -1
        availableCharts.forEach((item, index) => {
            if (index % rowSize === 0) {
                position++
                rows[position] = []
            }
            rows[position].push(item)
        })

        return rows.map((row, rowIndex) => {
            return <Row key={rowIndex}>
            {row.map((col, colIndex) => {
                return <Col key={colIndex} xs={12 / rowSize}>
                    <Button
                        onClick={() => setSelected(col)}
                        color={col === selected ? 'primary' : 'warning'}
                        size='large'>
                        <FontAwesome name='puzzle-piece' size='4x' />
                        <br/>
                        {col.name}
                    </Button>
                </Col>
            })}
            </Row>
        })
    }

    const renderFooter = (): JSX.Element => {
        return <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <Button color='secondary'
                    onClick={() => props.back()}>
                    Back
                </Button>
            </div>
            <div>
                <Button color='primary'
                    disabled={!selected}
                    style={{ marginRight: 10 }}
                    onClick={() => props.done(selected.type)}>
                    Create
                </Button>
                <Button color='secondary'
                    onClick={() => props.cancel()}>
                    Cancel
                </Button>
            </div>
        </ModalFooter>
    }

    return <div>
        <ModalHeader>Select Chart Type</ModalHeader>
        <ModalBody>{buildRows()}</ModalBody>
        {renderFooter()}
    </div>
}
