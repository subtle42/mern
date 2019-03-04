import * as React from 'react'
import { IWidget, ISource, ISourceColumn, ColumnType } from 'common/models'
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap'
import { store } from 'data/store'

interface Props extends IWidget {}

class State {
    height: number
    width: number
    source: ISource
}

class DropdownState {
    dropdownOpen: boolean = false
    columns: ISourceColumn[] = []
}

interface DropdownProps {
    sourceId: any
    colId: any
    colType: ColumnType
    onColUpdate: (item) => void
}

export class MeasureDropdown extends React.Component<DropdownProps, DropdownState> {
    state: DropdownState = new DropdownState()
    source: ISource

    componentDidMount () {
        this.source = store.getState().sources.list.filter(s => s._id === this.props.sourceId)[0]
        this.setState({
            columns: this.source.columns
        })
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }

    getSelectedColumn = (): ISourceColumn => {
        return this.state.columns.filter(col => col.ref === this.props.colId)[0]
    }

    render () {
        return (
            <ButtonDropdown
                size='sm'
                className='column-btn'
                isOpen={this.state.dropdownOpen}
                style={{ fontSize: 10 }}
                toggle={this.toggle}>
                <DropdownToggle color='secondary' outline caret size='small'>
                    {this.getSelectedColumn() ? this.getSelectedColumn().name : ''}
                </DropdownToggle>
                <DropdownMenu>
                    {this.state.columns
                        .filter(col => col.type === this.props.colType)
                        .filter(col => col.ref !== this.props.colId)
                        .map(col => {
                            return (<DropdownItem key={col.ref} onClick={(e) => this.props.onColUpdate(col)}>
                            {col.name}
                        </DropdownItem>)
                        })}
                </DropdownMenu>
            </ButtonDropdown>
        )
    }
}
