import * as React from "react";
import {Button, Modal, Input, Label, Row, Col, ListGroup, ListGroupItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, FormGroup, ModalHeader, ModalBody, ModalFooter} from "reactstrap";
import store from "../../../data/store";
import {ISource, ISourceColumn, ColumnType} from "common/models";
import * as FontAwesome from "react-fontawesome";
import sourceActions from "data/sources/actions"

class State {
    toEdit:ISource
}

interface Props {
    _id:any;
    done:() => void;
}

interface dropOption {
    label:string;
    value:ColumnType;
}

const dropDownOptions:dropOption[] = [{
    label: "Number",
    value: "number"
}, {
    label: "Group",
    value: "group"
}, {
    label: "Text",
    value: "text"
}]

interface DropProps extends ISourceColumn {
    color:string;
    colRef:string;
    selectType:(ref:string, type:ColumnType) => void;
}

class ColumnTypeDropdown extends React.Component<DropProps, {}> {
    state = {
        dropdownOpen: false
    };

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    render() {
        return <Dropdown size="sm" style={{float:"right"}} isOpen={this.state.dropdownOpen} toggle={this.toggle}>
            <DropdownToggle outline color={this.props.color !== "" ? this.props.color : "secondary"} caret>
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

export class EditSourceContent extends React.Component<Props, State> {
    state = new State();

    componentDidMount() {
        const tmp = store.getState().sources.list.filter(source => source._id === this.props._id)[0];
        this.setState({
            toEdit: tmp
        });
    }

    setColumnType(ref:string, newType:ColumnType) {
        let toEditCol = this.state.toEdit.columns.filter(col => col.ref === ref)[0];
        toEditCol.type = newType;
        this.setState({
            toEdit: this.state.toEdit
        });
    }

    renderColumns(columns:ISourceColumn[]):JSX.Element {
        return <ListGroup style={{height:300, overflowY:"auto"}}>
            {this.state.toEdit.columns.map(sourceCol => {
                return <ListGroupItem
                    color={this.getColumnColor(sourceCol)}
                    key={sourceCol.ref}>
                    {sourceCol.name}
                    <ColumnTypeDropdown selectType={(ref, type) => this.setColumnType(ref, type)} colRef={sourceCol.ref} {...sourceCol} color={this.getColumnColor(sourceCol)} />
                </ListGroupItem>
            })}
        </ListGroup>
    }

    getColumnColor(col:ISourceColumn):string {
        if (col.type === "number") {
            return "info";
        }
        else if (col.type === "group") {
            return "success";
        }
        return "";
    }

    handleChange = (event:any):void => {
        const target:any = event.target
        this.state.toEdit[target.name] = target.value;
        this.setState({
            toEdit: this.state.toEdit
        });
    }

    handleCheckbox = (event:any):void => {
        const target:any = event.target
        this.state.toEdit[target.name] = parseInt(target.value) ? false : true;
        this.setState({
            toEdit: this.state.toEdit
        });
    }

    getHeader():JSX.Element {
        return <ModalHeader>Edit Source</ModalHeader>
    }

    getBody():JSX.Element {
        return <ModalBody>
            <Form>
                <FormGroup row>
                    <Label xs={2}>Title:</Label>
                    <Col xs={10}>
                        <Input name="title"
                        onChange={this.handleChange}
                        value={this.state.toEdit.title} />
                    </Col>
                </FormGroup>
                <FormGroup row>
                    <Label for="isPublicInput" xs={2}>
                        Is Public:
                    </Label>
                    <Col xs={10}>
                        <Input type="checkbox"
                        onChange={this.handleCheckbox}
                        style={{marginLeft:0}}
                        id="isPublicInput"
                        name="isPublic"
                        value={this.state.toEdit.isPublic ? 1 : 0} />
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

    getFooter():JSX.Element {
        return <ModalFooter>
            <Button color="primary" onClick={this.save}>Save</Button>
            <Button color="secondary" onClick={this.cancel}>Cancel</Button>
        </ModalFooter>
    }

    getModal = ():JSX.Element => {
        if (!this.state.toEdit) return <div/>
        return <div>
            {this.getHeader()}
            {this.getBody()}
            {this.getFooter()}
        </div>
    }

    save = (event):void => {
        sourceActions.update(this.state.toEdit)
        .then(() => this.props.done())
    }

    cancel = ():void => {
        this.props.done()
    }

    render() {
        return this.getModal()
    }
}