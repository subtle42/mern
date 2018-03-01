import * as React from "react";
// import { WidthProvider, Responsive } from "react-grid-layout";
import {Button, Glyphicon} from "react-bootstrap";
import {RemoveWidgetButton} from "./remove";
import {IWidget} from "myModels";
import store from "../../../data/store";

interface Props extends IWidget{}

class State {
    source:any;
}

export class Widget extends React.Component<Props, State> {
    state = new State();
    static defaultProps = {
        className: "layout",
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 100
    }

    componentDidMount() {
        // this.state.source = store.getState()
        store.subscribe(() => {
            const mySource = store.getState();
            if (mySource !== this.state.source) {
                this.state.source = store.getState();
            }
        })
    }

    test() {
    }

    render() {
        return (
            <div className="panel panel-primary">
                <div className="panel-heading" style={{padding:2}}>
                    <Button className="pull-left" bsStyle="primary" bsSize="small" ><Glyphicon glyph="cog" /></Button>
                    <RemoveWidgetButton _id="hello" />
                    <div className="panel-title">imma header</div>
                </div>
                <div className="panel-body" style={{height:"100%"}}>so sexy</div>
            </div>
        )
    }
}