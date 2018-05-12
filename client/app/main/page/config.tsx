import * as React from "react";
import axios from "axios"
import {FormText, Label, ModalBody, ModalFooter, ModalHeader, Row, Col, Input, Modal, Button, FormGroup, NavItem} from "reactstrap";
import PageActions from "data/pages/actions";
import store from "data/store";
import {IPage} from "common/models";
import { ReactElement } from "react";
import * as FontAwesome from "react-fontawesome";
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
            page: Object.assign({}, myPage)//extend({}, myPage)
        });
    }

    cancel = () => {
        if (event) event.stopPropagation();
        this.setState(new State());
    }

    handleChange = (event:React.FormEvent<any>) => {
        const target:any = event.target
        const value:string = target.value.trim();
        console.log(this.state)
        let myPage = Object.assign({}, this.state.page, {
            [target.name]: target.value
        });
        console.log(myPage)
        this.setState({
            page: myPage,
            validationState: this.getValidationState(value)
        });
    }

    handleCheckbox = (event:React.FormEvent<any>) => {
        event.nativeEvent.preventDefault();
        // event.stopPropagation();
        // const target:any = event.target;
        // let tmp:IPage = {...this.state.page};
        // tmp[target.name] = !this.state.page[target.name];
        // this.setState({
        //     page: tmp
        // });
        // console.log(this.state.page[target.name]);
    }

    handleArray = (event:React.FormEvent<any>) => {
        const target:any = event.target;
        const [targetName, targetIndex] = target.name.split("-");
        let myArray = this.state.page[targetName];


        myArray[targetIndex] = parseInt(target.value);
        console.log(this.state.page)
        let myPage = Object.assign({}, this.state.page, {
            [targetName]: myArray
        });
        this.setState({
            page: myPage
        });
    }

    isValidNumber = (event:React.FormEvent<any>):boolean => {
        const target:any = event.target;
        const value:number = parseInt(target.value);
        const min:number = parseInt(target.min);
        const max:number = parseInt(target.max);
        if (value === NaN) return false;
        if (value < min) return false;
        if (value > max) return false;
        return true;
    }

    getValidationState = (input:string):myStyle => {
        if (input.length < 3) return "error";
    }

    toggleCheckBox = (name:string, event:React.FormEvent<any>) => {
        event.stopPropagation();
        event.preventDefault();
        let tmp:IPage = {...this.state.page};
        tmp[name] = !this.state.page[name];
        this.setState({
            page: tmp
        });
    }

    getModal():JSX.Element {
        if (!this.state.page) return;
        return (<Modal size="lg" isOpen={this.state.showModal} onClosed={this.cancel}>
            <ModalHeader>Page Config</ModalHeader>
            <ModalBody>
                <Row>
                    <Col xs={6}>
                        <FormGroup>
                        <Label>Name:</Label>
                        <Input 
                            type="text"
                            value={this.state.page.name}
                            name="pageName"
                            placeholder="Enter Name"
                            onChange={this.handleChange}
                        />
                        {!this.state.validationState || <FormText>Name must be at least 3 characters.</FormText>}
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <Label>Column Count</Label>
                        <Input
                                type="number"
                                min={1}
                                max={20}
                                value={this.state.page.cols}
                                onChange={this.handleChange}
                                name="cols"
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={3}>
                        <Label>Margins</Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={this.state.page.margin[0]}
                            onChange={this.handleArray}
                            name="margin-0"
                        />
                    </Col>
                    <Col xs={3}>
                        <Label>Margins</Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={this.state.page.margin[1]}
                            onChange={this.handleArray}
                            name="margin-1"
                        />
                    </Col>
                    <Col xs={3}>
                        <Label>Padding</Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={this.state.page.containerPadding[0]}
                            onChange={this.handleArray}
                            name="containerPadding-0"
                        />
                    </Col>
                    <Col xs={3}>
                        <Label>Padding</Label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={this.state.page.containerPadding[1]}
                            onChange={this.handleArray}
                            name="containerPadding-1"
                        />
                    </Col>
                </Row>
                <Row style={{paddingTop:20}}>
                    <Col xs={6}>
                        <FormGroup row>
                            <Label xs={6}>Is Draggable</Label>
                            <Col xs={6}>
                                <Button color={this.state.page.isDraggable ? "success" : "danger"}
                                    onClick={(event) => this.toggleCheckBox("isDraggable", event)}
                                >
                                    {this.state.page.isDraggable.toString().toLocaleUpperCase()}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup row>
                            <Label xs={6}>Is Resizable</Label>
                            <Col xs={6}>
                                <Button color={this.state.page.isResizable ? "success" : "danger"}
                                    onClick={(event) => this.toggleCheckBox("isResizable", event)}
                                >
                                    {this.state.page.isResizable.toString().toLocaleUpperCase()}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Col>
                </Row>
                <Row style={{paddingTop:20}}>
                    <Col xs={6}>
                        <FormGroup row>
                            <Label xs={6}>Is Rearrangeable</Label>
                            <Col xs={6}>
                                <Button color={this.state.page.isRearrangeable ? "success" : "danger"}
                                    onClick={(event) => this.toggleCheckBox("isRearrangeable", event)}
                                >
                                    {this.state.page.isRearrangeable.toString().toLocaleUpperCase()}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Col>
                    <Col xs={6}>
                        <FormGroup row>
                            <Label xs={6}>Prevent Collisions</Label>
                            <Col xs={6}>
                                <Button color={this.state.page.preventCollision ? "success" : "danger"}
                                    onClick={(event) => this.toggleCheckBox("preventCollision", event)}
                                >
                                    {this.state.page.preventCollision.toString().toLocaleUpperCase()}
                                </Button>
                            </Col>
                        </FormGroup>
                    </Col>
                </Row>
            </ModalBody>
            <ModalFooter>
                <Button color="primary"
                    onClick={this.close}
                >Save</Button>
                <Button color="secondary" onClick={this.cancel}>Cancel</Button>
            </ModalFooter>
        </Modal>)
    }

    render() {
        return (
            <div className="fixed-plugin" onClick={this.open}>
                <div>
                    <FontAwesome style={{paddingTop:6}} size="2x" name="cog" />
                    {this.getModal()}
                </div>
            </div>
        );
    }
}