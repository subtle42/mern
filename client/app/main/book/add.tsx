import * as React from "react";
import axios from "axios"
import {FormControl, MenuItem, Modal, FormGroup, ControlLabel, HelpBlock, Button} from "react-bootstrap";

class State {
    showModal:boolean = false;
    pageName:string = "";
    validationState?: myStyle = undefined;
}

type myStyle = "success" | "warning" | "error";

export default class CreateBookButton extends React.Component<{}, State> {
    state:State = new State();

    close = () => {
        // pageActions.create(this.state.pageName)
        // .then(() => this.setState({
        //     showModal:false,
        //     pageName: ""
        // }));
        this.setState({showModal:false})
    }

    open = () => {
        this.setState({showModal:true});
    }
    
    cancel = (event:React.FormEvent<Button>) => {
        event.stopPropagation();
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
            <MenuItem onClick={() => this.open()}>
                Add Book
                <Modal bsSize="small" show={this.state.showModal} onHide={this.close}>
                    <Modal.Header>Create Book</Modal.Header>
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
                            {/* <FormControl.Feedback /> */}
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
            </MenuItem>
        );
    }
}

