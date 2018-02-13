import * as React from "react";
import axios from "axios"
import {Modal, ControlLabel, FormControl, Button, Glyphicon, HelpBlock, FormGroup, NavItem} from "react-bootstrap";
import pageActions from "../../../../data/pages/actions";
import {IPage} from "myModels";

class State {
    showModal:boolean = false;
}

class Props {
    pageName:string;
    _id:string;
}

export class DeletePageButton extends React.Component<Props, State> {
    state:State = new State();

    close = (event) => {
        event.stopPropagation();
        pageActions.delete(this.props._id)
        .then(() => this.setState(new State()));
    }

    open = (event) => {
        event.stopPropagation();
        this.setState({showModal:true});
    }

    cancel = (event) => {
        if (event) event.stopPropagation();
        this.setState(new State());
    }
    
    render() {
        return (
            <Button className="close"
                onClick={this.open}
            >x
                <Modal bsSize="small" show={this.state.showModal} onHide={this.cancel}>
                    <Modal.Header>Delete Page</Modal.Header>
                    <Modal.Body>Are you sure you want to delete <b>{this.props.pageName}</b>?</Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="warning" onClick={this.cancel}>
                            Cancel
                        </Button>
                        <Button bsStyle="primary"
                        onClick={this.close}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Button>
        );
    }
}