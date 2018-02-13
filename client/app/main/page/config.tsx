import * as React from "react";
import axios from "axios"
import {Modal, ControlLabel, FormControl, Button, Glyphicon, HelpBlock, FormGroup, NavItem} from "react-bootstrap";
import PageActions from "../../../data/pages/actions";
import store from "../../../data/store";
import {IPage} from "myModels";
import { ReactElement } from "react";
import "./page.css";


class State {
    page?:IPage;
    showModal:boolean = false;
    validationState?: myStyle = undefined;
}

interface Props {
    _id?:string;
}


type myStyle = "success" | "warning" | "error";

export class PageConfigButton extends React.Component<Props, State> {
    state:State = new State();

    close = (event) => {
        event.stopPropagation();
        PageActions.update(this.state.page)
        .then(() => this.setState(new State()));
    }

    open = () => {
        const myPage:IPage = store.getState()
        .pages.list.filter(page => page._id === this.props._id)[0];
        this.setState({
            showModal:true,
            page: myPage
        });
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

    getModal():JSX.Element {
        if (!this.state.page) return;
        return (<Modal bsSize="large" show={this.state.showModal} onHide={this.cancel}>
            <Modal.Header>Page Config</Modal.Header>
            <Modal.Body>
                <FormGroup
                    controlId="createPageForm"
                    validationState={this.state.validationState}
                >
                    <ControlLabel>Name:</ControlLabel>
                    <FormControl 
                        type="text"
                        value={this.state.page.name}
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
                    onClick={this.close}
                >Create</Button>
            </Modal.Footer>
        </Modal>)
    }

    render() {
        return (
            <div className="fixed-plugin" onClick={this.open}>
                <div>
                    <Glyphicon className="sideMenuIcon" glyph="cog"/>
                    {this.getModal()}
                </div>
            </div>
        );
    }
}