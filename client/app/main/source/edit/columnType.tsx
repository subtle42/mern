import * as React from 'react'
import { ColumnType } from 'common/constants'
import Dropdown from 'reactstrap/lib/Dropdown'
import DropdownToggle from 'reactstrap/lib/DropdownToggle'
import DropdownMenu from 'reactstrap/lib/DropdownMenu'
import DropdownItem from 'reactstrap/lib/DropdownItem'

interface DropOption {
    label: string
    value: ColumnType
}

const dropDownOptions: DropOption[] = [{
    label: 'Number',
    value: 'number'
}, {
    label: 'Group',
    value: 'group'
}, {
    label: 'Text',
    value: 'text'
}]

interface Props {
    type: string
    selectType: (type: ColumnType) => void
}

export const ColumnTypeDropdown: React.StatelessComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)

    const getColor = (): string => {
        if (props.type === 'number') {
            return 'info'
        } else if (props.type === 'group') {
            return 'success'
        }
        return 'secondary'
    }

    const getLabelText = (): string => {
        return dropDownOptions.find(option => option.value === props.type).label
    }

    return <Dropdown size='sm'
        style={{ float: 'right' }}
        toggle={() => setOpen(!isOpen)}
        isOpen={isOpen}>
        <DropdownToggle outline caret
            color={getColor()}>
            {getLabelText()}
        </DropdownToggle>
        <DropdownMenu>
            {dropDownOptions
            .filter(option => option.value !== props.type)
            .map((option, index) => <DropdownItem
                key={index}
                onClick={() => props.selectType(option.value)}>
                    {option.label}
                </DropdownItem>
            )}
        </DropdownMenu>
    </Dropdown>
}
