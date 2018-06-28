import * as React from "react";
import axios from "axios"
import {Form, Col, Label, Input, Button, FormText, FormGroup, NavItem} from "reactstrap";
import {Redirect} from "react-router-dom";
import AuthActions from "data/auth/actions";


class State {
    email?:string = "";
    password?:string = "";
    validationState?: myStyle;
    err?:string;
    loginSuccess?:boolean = false;
}


type myStyle = "success" | "warning" | "error";

export default class LoginPage extends React.Component<{}, State> {
    state:State = new State();


    handleChange = (event:React.FormEvent<any>) => {
        const target:any = event.target;
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
        .catch(err => console.error(err.response.data.message))
    }

    isDisabled = ():boolean => {
        return this.state.email.length <= 3 || (this.state.password.length <= 3);
    }

    render() {
        if (this.state.loginSuccess) {
            return (<Redirect to="home" />)
        }
        return (
            <Form>
                <FormGroup><Col xs={{size:6, offset:3}}>
                <FormGroup id="formEmail">
                    <Col sm={2}>
                        Email
                    </Col>
                    <Col sm={10}>
                        <Input
                            type="email"
                            name="email"
                            value={this.state.email}
                            placeholder="Email"
                            onChange={this.handleChange}    
                        />
                    </Col>
                </FormGroup>
                <FormGroup id="formPassword">
                    <Col sm={2}>
                        Password
                    </Col>
                    <Col sm={10}>
                        <Input
                            type="text"
                            value={this.state.password}
                            name="password"
                            placeholder="Password"
                            onChange={this.handleChange}    
                        />
                    </Col>
                </FormGroup>
                <FormGroup>
                <Col sm={{size:10, offset:2}}>
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