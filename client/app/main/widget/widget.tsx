import * as React from "react";
import {connect} from "react-redux";
import {Button, Glyphicon} from "react-bootstrap";
import {RemoveWidgetButton} from "./remove";
import {IWidget} from "myModels";
import store from "../../../data/store";

interface Props {
    _id?:any;
}

const MyComponent:React.StatelessComponent<Props> = (props:Props) => {
    return (
        <div className="panel panel-primary" style={{height:"100%"}}>
            <div className="panel-heading" style={{padding:2}}>
                <Button className="pull-left" bsStyle="primary" bsSize="small" ><Glyphicon glyph="cog" /></Button>
                <RemoveWidgetButton _id={props._id} />
                <div className="panel-title"> Widget {props._id}</div>
            </div>
            <div className="panel-body">so sexy</div>
        </div>
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
//                     <Button className="pull-left" bsStyle="primary" bsSize="small" ><Glyphicon glyph="cog" /></Button>
//                     <RemoveWidgetButton _id={this.props._id} />
//                     <div className="panel-title"> Widget {this.props._id}</div>
//                 </div>
//                 <div className="panel-body">so sexy</div>
//             </div>
//         )
//     }
// }