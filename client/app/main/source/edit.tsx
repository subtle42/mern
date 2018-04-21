import * as React from "react";
import {Row, Col, ListGroup, ListGroupItem, Dropdown, DropdownToggle, DropdownMenu, DropdownItem} from "reactstrap";
import store from "../../../data/store";
import {ISource, ISourceColumn, ColumnType} from "myModels";

class State {
    toEdit:ISource;
}

interface Props {
    _id:any;
}

const dropDownOptions = [{
    label: "Number",
    value: "number"
}, {
    label: "Group",
    value: "group"
}, {
    label: "Text",
    value: "text"
}]

interface DropProps {
    colType:ColumnType;
    color:string;
}

class ColumnTypeDropdown extends React.Component<DropProps, {}> {
    state = {
        dropdownOpen: false
    };

    toggle = () => {
        console.log(this.state)
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    render() {
        return <Dropdown style={{float:"right"}} isOpen={this.state.dropdownOpen} toggle={this.toggle}>
            <DropdownToggle outline color={this.props.color !== "" ? this.props.color : "secondary"} caret>
                {dropDownOptions.filter(option => option.value === this.props.colType)[0].label}
            </DropdownToggle>
            <DropdownMenu>
                {dropDownOptions.map((option, index) => {
                    return <DropdownItem key={index}>{option.label}</DropdownItem>
                })}
            </DropdownMenu>
        </Dropdown>
    }
}

export class EditSource extends React.Component<Props, State> {
    state = new State();

    componentDidMount() {
        const tmp = store.getState().sources.list.filter(source => source._id === this.props._id)[0];
        this.setState({
            toEdit: tmp
        });
    }

    renderColumns(columns:ISourceColumn[]):JSX.Element {
        return <ListGroup style={{height:300, overflowY:"auto"}}>
            {this.state.toEdit.columns.map(sourceCol => {
                return <ListGroupItem
                    color={this.getColumnColor(sourceCol)}
                    key={sourceCol.ref}>
                    {sourceCol.name}
                    <ColumnTypeDropdown colType={sourceCol.type} color={this.getColumnColor(sourceCol)} />
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

    render() {
        if (!this.state.toEdit) return <div></div>;
        return <div>
            <Row>
                <Col xs={12}>
                    {this.state.toEdit.title}
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    {this.renderColumns(this.state.toEdit.columns)}
                </Col>
            </Row>
        </div>
    }
}