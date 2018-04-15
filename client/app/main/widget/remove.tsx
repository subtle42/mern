import * as React from "react";
import {Modal, ModalBody, ModalFooter, ModalHeader, Button} from "reactstrap";
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

    cancel = () => {
        if (event) event.stopPropagation();
        this.setState(new State());        
    }

    getModal():JSX.Element {
        return <Modal size="small" isOpen={this.state.showModal} onClosed={this.cancel}>
            <ModalHeader>Delete Widget</ModalHeader>
            <ModalBody>
                Are you sure you want to delete this widget?
            </ModalBody>
            <ModalFooter>
                <Button color="warning" onClick={this.cancel}>Cancel</Button>
                <Button color="primary" onClick={this.close}>Confirm</Button>
            </ModalFooter>
        </Modal>
    }

    render() {
        return <Button onClick={this.open} className="pull-right" color="primary" size="small">
            {/* <Glyphicon glyph="remove" /> */}
            {this.getModal()}
        </Button>
    }
}