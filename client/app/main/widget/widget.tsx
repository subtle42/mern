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
        // <div className="panel panel-primary" style={{height:"100%",flexDirection:"column", display:"flex", margin:0}}>
        // <div className="panel-heading" style={{alignItems:"stretch", padding:2}}>
        // <div className="" style={{height:"100%", alignItems:"stretch",}}><Histogram /></div>
            
        // </div>
    );
}

export const Widget = MyComponent;

// export const Widget = connect((store:any) => {
//     return {
//         _id:"asdf"
//     }
// })(MyComponent);

// export class Widget extends React.Component<Props, State> {
//     state = new State();

//     componentDidMount() {
//         // this.state.source = store.getState()
//         store.subscribe(() => {
//             const mySource = store.getState();
//             if (mySource !== this.state.source) {
//                 this.state.source = store.getState();
//             }
//         })
//     }

//     render() {
//         return (
//             <div className="panel panel-primary" style={{height:"100%"}}>
//                 <div className="panel-heading" style={{padding:2}}>
//                     <Button className="pull-left" color="primary" size="small" ><Glyphicon glyph="cog" /></Button>
//                     <RemoveWidgetButton _id={this.props._id} />
//                     <div className="panel-title"> Widget {this.props._id}</div>
//                 </div>
//                 <div className="panel-body">so sexy</div>
//             </div>
//         )
//     }
// }