import * as React from 'react'
import { Button, Row, Col, ModalHeader, ModalFooter, ModalBody } from 'reactstrap'
import { ColumnType } from 'common/constants'
import * as FontAwesome from 'react-fontawesome'
import { useSource } from '../../../_common/hooks'
import Badge from 'reactstrap/lib/Badge'

interface Props {
    sourceId: string
    back: () => void
    cancel: () => void
    done: (chartType: string[]) => void
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
    const [selected, setSelected] = React.useState([] as ChartConf[])
    const source = useSource(props.sourceId)
    const rowSize = 4

    const getAvailableChartTypes = (): ChartConf[] => {
        return chartConfList.filter(config => {
            let shouldPass = true
            config.requires.forEach(req => {
                if (source.columns.filter(col => col.type === req.colType).length < req.count) {
                    shouldPass = false
                }
            })
            return shouldPass
        })
    }

    const getCountBadge = (col: ChartConf): JSX.Element => {
        const count = selected.filter(x => x.type === col.type).length
        if (count === 0) return
        return <Badge color='light'
            style={{ position: 'absolute', top: 5, right: 21 }}>
            {count}
        </Badge>
    }

    const buildRows = (): JSX.Element[] => {
        const rows: ChartConf[][] = []
        let position = -1
        getAvailableChartTypes().forEach((item, index) => {
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
                        style={{ width: '100%' }}
                        onContextMenu={e => {
                            e.preventDefault()
                            const index = selected.findIndex(x => x.type === col.type)
                            if (index === -1) return
                            const tmp = [...selected]
                            tmp.splice(index, 1)
                            setSelected(tmp)
                        }}
                        onClick={() => {
                            const temp = [...selected]
                            temp.push(col)
                            setSelected(temp)
                        }}
                        color={selected.find(x => x.type === col.type) ? 'primary' : 'warning'}
                        size='large'>
                        {getCountBadge(col)}
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
                    onClick={() => props.done(selected.map(x => x.type))}>
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
