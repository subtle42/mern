import * as React from "react";
import axios from "axios"
import {Modal, ModalBody, ModalFooter, ModalHeader, Input, Button, FormGroup, NavItem} from "reactstrap";
import pageActions from "../../../data/pages/actions";
import {IPage} from "myModels";
import * as FontAwesome from "react-fontawesome";


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

    cancel = () => {
        if (event) event.stopPropagation();
        this.setState(new State());
    }
    
    render() {
        return (
            <div
                onClick={this.open}
                style={{float:"right"}}
            >
                <FontAwesome style={{paddingLeft:5, paddingTop:3}} name="times" />
                <Modal size="sm" isOpen={this.state.showModal} onClosed={this.cancel}>
                    <ModalHeader>Delete Page</ModalHeader>
                    <ModalBody>Are you sure you want to delete <b>{this.props.pageName}</b>?</ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                        onClick={this.close}>
                            Confirm
                        </Button>
                        <Button color="secondary" onClick={this.cancel}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}