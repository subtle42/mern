import * as React from "react";
import axios from "axios"
import {FormText, Input, Label, ModalHeader, ModalBody, ModalFooter, Modal, FormGroup, DropdownItem, Button } from "reactstrap";
import BookActions from "../../../data/books/actions";
import * as FontAwesome from "react-fontawesome";

class State {
    showModal:boolean = false;
    bookName:string = "";
    validationState?: myStyle = undefined;
}

class Props {
    name: string
    _id: string
    canEdit:boolean
}

type myStyle = "success" | "warning" | "error";

export default class EditBookButton extends React.Component<Props, State> {
    state:State = new State();

    close = () => {
        BookActions.create(this.state.bookName)
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
            <DropdownItem style={{ padding: '0.25rem 1.0rem' }}>
                {this.props.name}
                {this.props.canEdit && <FontAwesome onClick={() => this.open()} className="float-right text-muted sidemenuicon" name="edit" />}
                <Modal size="small" isOpen={this.state.showModal} onClosed={this.close}>
                    <ModalHeader>Edit Book</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label>Name:</Label>
                            <Input 
                                type="text"
                                value={this.state.bookName}
                                name="bookName"
                                placeholder="Enter Name"
                                onChange={this.handleChange}
                            />
                            {/* {!this.state.validationState || <FormText>Name must be at least 3 characters.</FormText>} */}
                            
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary"
                            disabled={!!this.state.validationState || this.state.bookName.length === 0} 
                            onClick={this.close}
                        >Create</Button>
                        <Button color="secondary" onClick={this.cancel}>Cancel</Button>     
                    </ModalFooter>
                </Modal>
            </DropdownItem>
        );
    }
}

