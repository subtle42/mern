import * as React from "react";
import {connect} from "react-redux";
import {RemoveWidgetButton} from "./remove";
import {IWidget, ISource, ISourceColumn} from "myModels";
import store from "data/store";
import WidgetActions from "data/widgets/actions"
import {Histogram} from "../charts/histogram";
import {Chart} from "../charts/chart";
import * as FontAwesome from "react-fontawesome";
import {Card, CardBody, CardTitle, Button, CardHeader} from "reactstrap";
import {MeasureDropdown} from "../charts/chart"

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

    getDropdown():JSX.Element {
        if (!this.state.widgetConfig) return;
        return <MeasureDropdown
            sourceId={this.state.widgetConfig.sourceId}
            colId={this.state.widgetConfig.measures[0].ref}
            onColUpdate={this.onColUpdate}
            colType="number"
        />
    }

    onColUpdate = (col:ISourceColumn):void => {
        this.state.widgetConfig.measures[0] = {
            ref: col.ref
        };
        WidgetActions.update(this.state.widgetConfig)
    }

    render() {
        return (<Card style={{height:"100%"}}>
            <CardHeader style={{padding:0, border:0, backgroundColor:"#007bff"}}>
                <Button className="pull-left" color="primary" size="small" >
                    <FontAwesome name="cog" />
                </Button>
                <RemoveWidgetButton _id={this.props._id} />
                <CardTitle style={{color:"white", margin:0}}>{this.state.source ? this.state.source.title : "Loading.."}</CardTitle>
            </CardHeader>
            <CardBody style={{height:"100%"}}>
                {this.getDropdown()}
                <Chart {...this.state.widgetConfig} />
                {/* <Histogram /> */}
            </CardBody>
        </Card>);
    }
}