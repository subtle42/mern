import * as React from "react";
import axios from "axios"
import {Form, Col, ControlLabel, FormControl, Button, HelpBlock, FormGroup, NavItem} from "react-bootstrap";
import AuthActions from "../../../data/auth/actions";

var store:any;
var actions:any;

class State {
    email:string = "";
    password:string = "";
    userName:string = "";
    emailErr?:myStyle
    passwordErr?:myStyle
    userNameErr?:myStyle
}


type myStyle = "success" | "warning" | "error";

export default class LoginPage extends React.Component<{}, State> {
    state:State = new State();

    createUser = () => {
        AuthActions.create({
            email: this.state.email,
            password: this.state.password,
            name: this.state.userName
        })
        .then(() => this.setState(new State()));
    }

    handleChange = (event:React.FormEvent<FormControl>) => {
        const target:any = event.target
        const value:string = target.value.trim();
        this.setState({
            [target.name]: target.value
        });
        this.getValidationState();
    }

    getValidationState = ():void => {
        if (this.state.email.indexOf("@") === -1) {
            this.setState({emailErr: "error"})
        }
        if (this.state.password.length < 4) {
            this.setState({passwordErr: "error"})            
        } 
        if (this.state.userName.length < 4) {
            this.setState({userNameErr: "error"})
        }
        this.setState({
            emailErr: null,
            passwordErr: null,
            userNameErr: null
        });
    }

    isDisabled = ():boolean => {
        return !!this.state.emailErr || !!this.state.passwordErr || !!this.state.userNameErr;
    }

    render() {
        return (
            <Form horizontal>
                <FormGroup><Col xsOffset={3} xs={6}>
                <FormGroup controlId="formName">
                    <Col componentClass={ControlLabel} sm={2}>
                        User Name
                    </Col>
                    <Col sm={10}>
                        <FormControl
                            type="text"
                            name="userName"
                            placeholder="User Name"
                            onChange={this.handleChange}    
                        />
                    </Col>
                </FormGroup>
                <FormGroup controlId="formEmail">
                    <Col componentClass={ControlLabel} sm={2}>
                        Email
                    </Col>
                    <Col sm={10}>
                        <FormControl
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={this.handleChange}    
                        />
                    </Col>
                </FormGroup>
                <FormGroup controlId="formPassword">
                    <Col componentClass={ControlLabel} sm={2}>
                        Password
                    </Col>
                    <Col sm={10}>
                        <FormControl
                            type="text"
                            name="password"
                            placeholder="Password"
                            onChange={this.handleChange}    
                        />
                    </Col>
                </FormGroup>
                <FormGroup>
                <Col smOffset={2} sm={10}>
                    <Button disabled={this.isDisabled()}
                        className="pull-right"
                        type="button"
                        onClick={() => this.createUser()}
                    >
                        Submit
                    </Button>
                </Col>
                </FormGroup>
                </Col></FormGroup>
            </Form>
        );
    }

    handleSelect():number {
        return 1;
    }
}