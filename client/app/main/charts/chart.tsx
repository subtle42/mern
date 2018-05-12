import * as React from "react";
import {IWidget, ISource, ISourceColumn, ColumnType} from "common/models"
import {ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from "reactstrap"
import store from "data/store";

interface Props extends IWidget {}

class State {
    height:number;
    width:number;
    source:ISource
}

class DropdownState {
    dropdownOpen:boolean = false;
    columns:ISourceColumn[] = [];
}

interface DropdownProps {
    sourceId:any;
    colId:any;
    colType:ColumnType;
    onColUpdate:(item)=>void;
}

export class MeasureDropdown extends React.Component<DropdownProps, DropdownState> {
    state:DropdownState = new DropdownState();
    source:ISource;

    componentDidMount() {
        this.source = store.getState().sources.list.filter(s => s._id === this.props.sourceId)[0];
        this.setState({
            columns: this.source.columns
        });
    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    getSelectedColumn = ():ISourceColumn => {
        return this.state.columns.filter(col => col.ref === this.props.colId)[0];
    }

    render() {
        console.log(this.props)

        return (
            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle color="secondary" outline caret size="small">
                    {this.getSelectedColumn() ? this.getSelectedColumn().name : ""}
                </DropdownToggle>
                <DropdownMenu>
                    {this.state.columns
                        .filter(col => col.type === this.props.colType)
                        .filter(col => col.ref !== this.props.colId)
                        .map(col => {
                        return (<DropdownItem key={col.ref} onClick={(e) => this.props.onColUpdate(col)}>
                            {col.name}
                        </DropdownItem>);
                    })}
                </DropdownMenu>
            </ButtonDropdown>
        );
    }
}

export class Chart extends React.Component<Props, State> {
    state:State = new State();
    node:SVGGElement;
    width:number;
    height:number;

    componentDidMount() {
        // setTimeout(() => this.getDimensions(), 0);
        const mySource = store.getState().sources.list.filter(source => source._id === this.props.sourceId)[0];
        this.setState({
            source: mySource
        })
    }

    getDimensions() {
        // let margin = {top:10, right:10, left:10, bottom:10};
        this.width = this.node.parentElement.offsetWidth - this.props.margins.left - this.props.margins.right,
        this.height = this.node.parentElement.offsetHeight - this.props.margins.top - this.props.margins.bottom -22*2;
    }

    render() {
        if (!this.props.measures) {
            return <div></div>
        }
        // this.getDimensions();
        return (
            <div>
                {/* <MeasureDropdown sourceId={this.props.sourceId} colId={this.props.measures[0].ref} colType="number"/> */}
                <svg ref={node => this.node = node} width={300} height={300}>
                </svg>
            </div>
            
        );
    }
}