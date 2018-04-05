import * as React from "react";
import axios from "axios"
import {Modal, ModalBody, ModalHeader, ModalFooter, Label, Input, Button, FormText, FormGroup, NavItem} from "reactstrap";
import pageActions from "../../../data/pages/actions";

var actions:any;

class State {
    pageName:string = "";
    showModal:boolean = false;
    validationState?: myStyle = undefined;
}

interface Props {
    _id?:string;
}


type myStyle = "success" | "warning" | "error";

export class CreatePageButton extends React.Component<Props, State> {
    state:State = new State();

    close = (event) => {
        event.stopPropagation();
        pageActions.create(this.state.pageName)
        .then(pageId => {
            this.setState(new State())
            return pageActions.mySelect(pageId)
        });
    }

    open = () => {
        this.setState({showModal:true});
    }

    cancel = () => {
        if (event) event.stopPropagation();
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
            <NavItem onClick={this.open}>
                {/* <Glyphicon glyph="plus"/> */}
                <i className="material-icons">add</i>

                <Modal size="small" isOpen={this.state.showModal} onClosed={this.cancel}>
                    <ModalHeader>Create Page</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label>Name:</Label>
                            <Input 
                                type="text"
                                value={this.state.pageName}
                                name="pageName"
                                placeholder="Enter Name"
                                onChange={this.handleChange}
                            />
                            {!this.state.validationState || <FormText>Name must be at least 3 characters.</FormText>}
                            
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="warning" onClick={this.cancel}>Cancel</Button>
                        <Button color="primary"
                            disabled={!!this.state.validationState || this.state.pageName.length === 0} 
                            onClick={this.close}
                        >Create</Button>
                    </ModalFooter>
                </Modal>
            </NavItem>
        );
    }
}