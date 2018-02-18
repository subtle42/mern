import * as React from "react";
import {Modal, Button, Glyphicon} from "react-bootstrap";
import WidgetActions from "../../../data/widgets/actions";

class State {
    showModal:boolean = false;
}

class Props {
    _id:string;
}

export class RemoveWidgetButton extends React.Component<Props, State> {
    state:State = new State();

    close = (event) => {
        if (event) event.stopPropagation();
        WidgetActions.delete(this.props._id)
        .then(() => this.setState(new State()));
    }

    open = (event) => {
        if (event) event.stopPropagation();
        this.setState({
            showModal:true
        })
    }

    cancel = (event) => {
        if (event) event.stopPropagation();
        this.setState(new State());        
    }

    getModal():JSX.Element {
        return <Modal bsSize="small" show={this.state.showModal} onHide={this.cancel}>
            <Modal.Header>Delete Widget</Modal.Header>
            <Modal.Body>
                Are you sure you want to delete this widget?
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="warning" onClick={this.cancel}>Cancel</Button>
                <Button bsStyle="primary" onClick={this.close}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    }

    render() {
        return <Button onClick={this.open} className="pull-right" bsStyle="primary" bsSize="small">
            <Glyphicon glyph="remove" />
            {this.getModal()}
        </Button>
    }
}