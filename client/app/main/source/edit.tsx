import * as React from "react";
import {InputGroup, Button, Modal, Input, Label, Row, Col, ListGroup, ListGroupItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, FormGroup, ModalHeader, ModalBody, ModalFooter, InputGroupAddon} from "reactstrap"
import store from "../../../data/store";
import {ISource, ISourceColumn, ColumnType} from "common/models"
import * as FontAwesome from "react-fontawesome";
import sourceActions from "data/sources/actions"


interface dropOption {
    label: string
    value: ColumnType
}

const dropDownOptions: dropOption[] = [{
    label: 'Number',
    value: 'number'
}, {
    label: 'Group',
    value: 'group'
}, {
    label: 'Text',
    value: 'text'
}]

interface DropProps extends ISourceColumn {
    color: string
    colRef: string
    selectType: (ref: string, type: ColumnType) => void
}

class ColumnTypeDropdown extends React.Component<DropProps, {}> {
    state = {
        dropdownOpen: false
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }

    render () {
        return <Dropdown size='sm' style={{ float: 'right' }} isOpen={this.state.dropdownOpen} toggle={this.toggle}>
            <DropdownToggle outline color={this.props.color !== '' ? this.props.color : 'secondary'} caret>
                {dropDownOptions.filter(option => option.value === this.props.type)[0].label}
            </DropdownToggle>
            <DropdownMenu>
                {dropDownOptions
                .filter(option => option.value !== this.props.type)
                .map((option, index) => {
                    return (<DropdownItem
                        key={index}
                        onClick={() => this.props.selectType(this.props.colRef, option.value)}>
                            {option.label}
                    </DropdownItem>)
                })}
            </DropdownMenu>
        </Dropdown>
    }
}

interface ColumnNameFieldProps extends ISourceColumn {
    update: (name: string) => void
}

class ColumnNameState {
    isEditing: boolean = false
    changedName: string = ''
}

class ColumnNameField extends React.Component<ColumnNameFieldProps, ColumnNameState> {
    state = new ColumnNameState()

    setEditMode = (): void => {
        this.setState({
            changedName: this.props.name,
            isEditing: true
        })
    }

    done = (): void => {
        this.props.update(this.state.changedName)
        this.setState(new ColumnNameState())
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.setState({
            changedName: target.value
        })
    }

    render () {
        return <div>
            <span hidden={this.state.isEditing}>
                {this.props.name}
                <FontAwesome name='edit'
                    style={{ paddingLeft: 10, cursor: 'pointer' }}
                    onClick={() => this.setEditMode()} />
            </span>
            <InputGroup hidden={!this.state.isEditing}>
                <InputGroupAddon addonType='prepend'>
                    <Button color='primary' onClick={() => this.done()}>Done</Button>
                </InputGroupAddon>
                <Input onChange={this.handleChange} value={this.state.changedName} />
            </InputGroup>
        </div>
    }
}

class State {
    toEdit: ISource
}

interface Props {
    _id: any
    done: () => void
}

export class EditSourceContent extends React.Component<Props, State> {
    state = new State()

    componentDidMount () {
        const tmp = store.getState().sources.list.filter(source => source._id === this.props._id)[0]
        this.setState({
            toEdit: tmp
        })
    }

    setColumnType (ref: string, newType: ColumnType) {
        let toEditCol = this.state.toEdit.columns.filter(col => col.ref === ref)[0]
        toEditCol.type = newType
        this.setState({
            toEdit: this.state.toEdit
        })
    }

    setColumnName (ref: string, newName: string) {
        let toEditCol = this.state.toEdit.columns.filter(col => col.ref === ref)[0]
        toEditCol.name = newName
        this.setState({
            toEdit: this.state.toEdit
        })
    }

    renderColumns (columns: ISourceColumn[]): JSX.Element {
        return <ListGroup style={{ height: 300, overflowY: 'auto' }}>
            {this.state.toEdit.columns.map(sourceCol => {
                return <ListGroupItem
                    color={this.getColumnColor(sourceCol)}
                    key={sourceCol.ref}>
                    <Row>
                        <Col xs={10}>
                            <ColumnNameField {...sourceCol}
                            update={(newName) => this.setColumnName(sourceCol.ref, newName)} />
                        </Col>
                        <Col xs={2}>
                            <ColumnTypeDropdown
                            selectType={(ref, type) => this.setColumnType(ref, type)}
                            colRef={sourceCol.ref} {...sourceCol}
                            color={this.getColumnColor(sourceCol)} />
                        </Col>
                    </Row>
                </ListGroupItem>
            })}
        </ListGroup>
    }

    getColumnColor (col: ISourceColumn): string {
        if (col.type === 'number') {
            return 'info'
        } else if (col.type === 'group') {
            return 'success'
        }
        return ''
    }

    handleChange = (event: any): void => {
        const target: any = event.target
        this.state.toEdit[target.name] = target.value
        this.setState({
            toEdit: this.state.toEdit
        })
    }

    handleCheckbox = (event: any): void => {
        const target: any = event.target
        this.state.toEdit[target.name] = target.value === 'true' ? false : true
        this.setState({
            toEdit: this.state.toEdit
        })
    }

    getHeader (): JSX.Element {
        return <ModalHeader>Edit Source</ModalHeader>
    }

    getBody (): JSX.Element {
        return <ModalBody>
            <Form>
                <FormGroup row>
                    <Label xs={2}>Title:</Label>
                    <Col xs={10}>
                        <Input name='title'
                        onChange={this.handleChange}
                        value={this.state.toEdit.title} />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for='isPublicInput' xs={2}>
                        Is Public:
                    </Label>
                    <Col xs={10}>
                        <Input type='checkbox'
                        onChange={this.handleCheckbox}
                        style={{ marginLeft: 0 }}
                        id='isPublicInput'
                        name='isPublic'
                        value={this.state.toEdit.isPublic.toString()}
                        checked={this.state.toEdit.isPublic} />
                    </Col>
                </FormGroup>
                <Row>
                    <Col xs={12}>
                        {this.renderColumns(this.state.toEdit.columns)}
                    </Col>
                </Row>
            </Form>
        </ModalBody>
    }

    getFooter (): JSX.Element {
        return <ModalFooter>
            <Button color='primary' onClick={this.save}>Save</Button>
            <Button color='secondary' onClick={this.cancel}>Cancel</Button>
        </ModalFooter>
    }

    getModal = (): JSX.Element => {
        if (!this.state.toEdit) return <div/>
        return <div>
            {this.getHeader()}
            {this.getBody()}
            {this.getFooter()}
        </div>
    }

    save = (event): void => {
        sourceActions.update(this.state.toEdit)
        .then(() => this.props.done())
    }

    cancel = (): void => {
        this.props.done()
    }

    render () {
        return this.getModal()
    }
}
