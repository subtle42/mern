import * as React from "react";
import {IWidget} from "myModels"

interface Props extends IWidget {
}

class State {
    height:number;
    width:number;
}

export class Chart extends React.Component<Props, State> {
    node:SVGGElement;
    width:number;
    height:number;

    getDimensions() {
        // let margin = {top:10, right:10, left:10, bottom:10};
        this.width = this.node.parentElement.offsetWidth - this.props.margins.left - this.props.margins.right,
        this.height = this.node.parentElement.offsetHeight - this.props.margins.top - this.props.margins.bottom -22*2;
    }

    render() {
        this.getDimensions();
        return (
            <svg ref={node => this.node = node} width={this.state.height} height={this.state.height}>
            </svg>
        );
    }
}