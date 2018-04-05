import * as React from "react";
import axios from "axios"
import {ModalHeader, ModalBody, ModalFooter, Modal, FormGroup, DropdownItem, Button} from "reactstrap";
import BookActions from "../../../data/books/actions";
// import { ModalHeader } from "react-bootstrap";

class State {
    showModal:boolean = false;
    pageName:string = "";
    validationState?: myStyle = undefined;
}

type myStyle = "success" | "warning" | "error";

export default class CreateBookButton extends React.Component<{}, State> {
    state:State = new State();

    close = () => {
        BookActions.create(this.state.pageName)
        .then(book => this.setState(new State()));
    }

    open = () => {
        this.setState({showModal:true});
    }
    
    cancel = (event:React.FormEvent<any>) => {
        event.stopPropagation();
        this.setState(new State());
    }

    handleChange = (event:React.FormEvent<any>) => {
        const target:any = event.target
        const value:string = target.value.trim();
        this.setState({
            [target.name]: target.value,
            validationState: this.getValidationState(value)
        });
    }

    getValidationState = (input:string):myStyle => {
        if (input.length < 3) return "error";
    }

    render() {
        return (
            <DropdownItem onClick={() => this.open()}>
                Add Book
                <Modal size="small" isOpen={this.state.showModal} onClosed={this.close}>
                    <ModalHeader>Create Book</ModalHeader>
                    <ModalBody>
                        <FormGroup
                            controlId="createPageForm"
                            validationState={this.state.validationState}
                        >
                            <ControlLabel>Name:</ControlLabel>
                            <FormControl 
                                type="text"
                                value={this.state.pageName}
                                name="pageName"
                                placeholder="Enter Name"
                                onChange={this.handleChange}
                            />
                            {!this.state.validationState || <HelpBlock>Name must be at least 3 characters.</HelpBlock>}
                            
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button bsStyle="warning" onClick={this.cancel}>Cancel</Button>
                        <Button bsStyle="primary"
                            disabled={!!this.state.validationState || this.state.pageName.length === 0} 
                            onClick={this.close}
                        >Create</Button>
                    </ModalFooter>
                </Modal>
            </DropdownItem>
        );
    }
}

