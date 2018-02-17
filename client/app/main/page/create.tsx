import * as React from "react";
import axios from "axios"
import {Modal, ControlLabel, FormControl, Button, Glyphicon, HelpBlock, FormGroup, NavItem} from "react-bootstrap";
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
        .then(() => this.setState(new State()));
    }

    open = () => {
        this.setState({showModal:true});
    }

    cancel = (event) => {
        if (event) event.stopPropagation();
        this.setState(new State());
    }

    handleChange = (event:React.FormEvent<FormControl>) => {
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
                <Glyphicon glyph="plus"/>

                <Modal bsSize="small" show={this.state.showModal} onHide={this.cancel}>
                    <Modal.Header>Create Page</Modal.Header>
                    <Modal.Body>
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
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="warning" onClick={this.cancel}>Cancel</Button>
                        <Button bsStyle="primary"
                            disabled={!!this.state.validationState || this.state.pageName.length === 0} 
                            onClick={this.close}
                        >Create</Button>
                    </Modal.Footer>
                </Modal>
            </NavItem>
        );
    }
}