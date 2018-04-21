import * as React from "react";
import {connect} from "react-redux";
import {RemoveWidgetButton} from "./remove";
import {IWidget} from "myModels";
import store from "../../../data/store";
import {Histogram} from "../charts/histogram";
import * as FontAwesome from "react-fontawesome";
import {Card, CardBody, CardTitle, Button, CardHeader} from "reactstrap";

interface Props {
    _id?:any;
}

class State {
    widgetConfig:IWidget;
}

export class Widget extends React.Component<Props, State> {
    state = new State();
    unsubscribe:Function;

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            let newValue = store.getState().widgets.list.filter(w => w._id === this.props._id)[0]
            if (this.state.widgetConfig !== newValue) {
                this.setState({
                    widgetConfig: newValue
                });
            }
        })
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
                <CardTitle style={{color:"white", margin:0}}> Widget {this.props._id}</CardTitle>
            </CardHeader>
            <CardBody style={{height:"100%"}}>
                <Histogram />
            </CardBody>
        </Card>);
    }
}

const MyComponent:React.StatelessComponent<Props> = (props:Props) => {
    return (
        <Card style={{height:"100%"}}>
            <CardHeader style={{padding:0, border:0, backgroundColor:"#007bff"}}>
                <Button className="pull-left" color="primary" size="small" >
                    <FontAwesome name="cog" />
                </Button>
                <RemoveWidgetButton _id={props._id} />
                <CardTitle style={{color:"white", margin:0}}> Widget {props._id}</CardTitle>
            </CardHeader>
            <CardBody style={{height:"100%"}}>
                <Histogram />
            </CardBody>
        </Card>
    );
}