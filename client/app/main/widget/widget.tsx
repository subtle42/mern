import * as React from "react";
import {connect} from "react-redux";
import {RemoveWidgetButton} from "./remove";
import {IWidget, ISource} from "myModels";
import store from "../../../data/store";
import {Histogram} from "../charts/histogram";
import * as FontAwesome from "react-fontawesome";
import {Card, CardBody, CardTitle, Button, CardHeader} from "reactstrap";

interface Props {
    _id?:any;
}

class State {
    widgetConfig:IWidget = undefined;
    source:ISource = undefined;
}

export class Widget extends React.Component<Props, State> {
    state = new State();
    unsubscribe:Function;

    getInitalState() {
        const storeState = store.getState();
        const widget = storeState.widgets.list.filter(w => w._id === this.props._id)[0];
        let source = undefined;
        if (widget) {
            source = storeState.sources.list.filter(s => s._id === widget.sourceId)[0];
        }
        this.setState({
            widgetConfig: widget,
            source: source
        })
    }

    componentDidMount() {
        this.getInitalState();

        this.unsubscribe = store.subscribe(() => {
            let newValue = store.getState().widgets.list.filter(w => w._id === this.props._id)[0];
            if (this.state.widgetConfig !== newValue) {
                this.setState({
                    widgetConfig: newValue
                });
            }

            if (!this.state.widgetConfig) return;

            let newSource = store.getState().sources.list.filter(s => s._id === this.state.widgetConfig.sourceId)[0];
            if (this.state.source !== newSource) {
                this.setState({
                    source: newSource
                });
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        return (<Card style={{height:"100%"}}>
            <CardHeader style={{padding:0, border:0, backgroundColor:"#007bff"}}>
                <Button className="pull-left" color="primary" size="small" >
                    <FontAwesome name="cog" />
                </Button>
                <RemoveWidgetButton _id={this.props._id} />
                <CardTitle style={{color:"white", margin:0}}>{this.state.source && this.state.source.title}</CardTitle>
            </CardHeader>
            <CardBody style={{height:"100%"}}>
                <Histogram />
            </CardBody>
        </Card>);
    }
}