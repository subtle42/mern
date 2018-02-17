import * as React from "react";
import axios from "axios"
import {Form, Col, ControlLabel, FormControl, Button, HelpBlock, FormGroup, NavItem} from "react-bootstrap";
import {Redirect} from "react-router-dom";
import AuthActions from "../../data/auth/actions";


class State {
    email:string = "";
    password:string = "";
    validationState?: myStyle;
    err:string;
    loginSuccess:boolean = false;
}


type myStyle = "success" | "warning" | "error";

export default class LoginPage extends React.Component<{}, State> {
    state:State = new State();


    handleChange = (event:React.FormEvent<FormControl>) => {
        const target:any = event.target
        const value:string = target.value.trim();
        this.setState({
            [target.name]: target.value
        });
    }

    getValidationState = (input:string):myStyle => {
        if (input.length < 3) return "error";
    }

    tryLogin = () => {
        AuthActions.login(this.state.email, this.state.password)
        .then(() => this.setState({
            ...(new State()),
            loginSuccess: true
        }))
        .catch(err => {
            console.log(err.response.data.message)
        })
    }

    isDisabled = ():boolean => {
        return this.state.email.length <= 3 || (this.state.password.length <= 3);
    }

    render() {
        if (this.state.loginSuccess) {
            return (<Redirect to="home" />)
        }
        return (
            <Form horizontal>
                <FormGroup><Col xsOffset={3} xs={6}>
                <FormGroup controlId="formEmail">
                    <Col componentClass={ControlLabel} sm={2}>
                        Email
                    </Col>
                    <Col sm={10}>
                        <FormControl
                            type="email"
                            name="email"
                            value={this.state.email}
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
                            value={this.state.password}
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
                        onClick={() => this.tryLogin()}
                    >
                        Sign in
                    </Button>
                </Col>
                </FormGroup>
                </Col></FormGroup>
            </Form>
        );
    }
}