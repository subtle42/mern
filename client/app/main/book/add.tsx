import * as React from "react";
import axios from "axios"
import {FormText, Input, Label, ModalHeader, ModalBody, ModalFooter, Modal, FormGroup, DropdownItem, Button } from "reactstrap";
import BookActions from "data/books/actions";
import store from "data/store"

class State {
    showModal:boolean = false;
    bookName:string = "";
    validationState?: myStyle = undefined;
}

type myStyle = "success" | "warning" | "error";

export default class CreateBookButton extends React.Component<{}, State> {
    state:State = new State();

    close = () => {
        BookActions.create(this.state.bookName)
        .then(book => this.setState(new State()));
    }

    toggle = () => {
        this.setState({showModal:!this.state.showModal});
    }
    
    cancel = (event:React.FormEvent<any>) => {
        event.stopPropagation();
        this.setState(new State());
    }

    save = (event:React.FormEvent<any>) => {
        event.stopPropagation();
        BookActions.create(this.state.bookName)
        .then(bookId => store.getState().books.list.filter(book => book._id === bookId)[0])
        .then(newBook => BookActions.select(newBook))
        .then(() => this.toggle())
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
            <DropdownItem onClick={this.toggle}>
                Add Book
                <Modal size="sm" isOpen={this.state.showModal}>
                    <ModalHeader>Create Book</ModalHeader>
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
                            onClick={this.save}
                        >Create</Button>
                        <Button color="secondary" onClick={this.cancel}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </DropdownItem>
        );
    }
}

