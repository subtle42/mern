import * as React from 'react'
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown'
import DropdownToggle from 'reactstrap/lib/DropdownToggle'
import DropdownMenu from 'reactstrap/lib/DropdownMenu'
import DropdownItem from 'reactstrap/lib/DropdownItem'

import { useSource } from '../../../_common/hooks'
import { ColumnType } from 'common/constants'
import '../style.css'
import { ISourceColumn } from 'common/models'

interface DropdownProps {
    sourceId: any
    colId: any
    colType: ColumnType
    hasCount?: boolean
    onColUpdate: (col: ISourceColumn) => void
}

export const ColumnButton: React.FunctionComponent<DropdownProps> = (props: DropdownProps) => {
    const source = useSource(props.sourceId)
    const [isOpen, setOpen] = React.useState(false)
    const optionList: ISourceColumn[] = [...source.columns]
    if (props.hasCount) {
        optionList.push({
            name: 'Count(*)',
            ref: 'count',
            type: 'number'
        })
    }
    const currentColumn = optionList.find(col => col.ref === props.colId)

    return <ButtonDropdown
        size='sm'
        className='extra-small'
        isOpen={isOpen}
        style={{ fontSize: 10, padding: 4 }}
        toggle={() => setOpen(!isOpen)}>
        <DropdownToggle color='secondary' outline caret size='small'>
            {currentColumn ? currentColumn.name : 'Not Found'}
        </DropdownToggle>
        <DropdownMenu>
            {optionList
                .filter(col => col.type === props.colType)
                .filter(col => col.ref !== props.colId)
                .map(col => <DropdownItem key={col.ref}
                    onClick={(e) => props.onColUpdate(col)}>
                    {col.name}
                </DropdownItem>)
            }
        </DropdownMenu>
    </ButtonDropdown>
}
