import * as React from 'react'
import axios from 'axios'
import { Form, Col, Label, Input, Button, FormGroup, NavItem } from 'reactstrap'
import { Redirect } from 'react-router-dom'
import AuthActions from 'data/auth/actions'

let store: any
let actions: any

class State {
    email?: string = ''
    password?: string = ''
    userName?: string = ''
    emailErr?: myStyle
    passwordErr?: myStyle
    userNameErr?: myStyle
    registerSuccess?: boolean
}

type myStyle = 'success' | 'warning' | 'error'

export default class LoginPage extends React.Component<{}, State> {
    state: State = new State()

    createUser = () => {
        AuthActions.create({
            email: this.state.email.trim(),
            password: this.state.password,
            name: this.state.userName.trim()
        })
        .then(() => this.setState({ registerSuccess: true }))
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.setState({
            [target.name]: target.value
        })
    }

    getValidationState = (): void => {
        if (this.state.email.indexOf('@') === -1) {
            this.setState({ emailErr: 'error' })
        }
        if (this.state.password.length < 4) {
            this.setState({ passwordErr: 'error' })
        }
        if (this.state.userName.length < 4) {
            this.setState({ userNameErr: 'error' })
        }
        this.setState({
            emailErr: null,
            passwordErr: null,
            userNameErr: null
        })
    }

    isDisabled = (): boolean => {
        return !!this.state.emailErr || !!this.state.passwordErr || !!this.state.userNameErr
    }

    render () {
        if (this.state.registerSuccess) {
            return <Redirect to='/login' />
        }
        return (
            <Form>
                <FormGroup><Col xs={{ size: 6, offset: 3 }}>
                <FormGroup id='formName'>
                    <Col sm={2}>
                        User Name
                    </Col>
                    <Col sm={10}>
                        <Input
                            type='text'
                            name='userName'
                            placeholder='User Name'
                            onChange={this.handleChange}
                        />
                    </Col>
                </FormGroup>
                <FormGroup id='formEmail'>
                    <Col sm={2}>
                        Email
                    </Col>
                    <Col sm={10}>
                        <Input
                            type='email'
                            name='email'
                            placeholder='Email'
                            onChange={this.handleChange}
                        />
                    </Col>
                </FormGroup>
                <FormGroup id='formPassword'>
                    <Col sm={2}>
                        Password
                    </Col>
                    <Col sm={10}>
                        <Input
                            type='text'
                            name='password'
                            placeholder='Password'
                            onChange={this.handleChange}
                        />
                    </Col>
                </FormGroup>
                <FormGroup>
                <Col sm={{ size: 10, offset: 2 }}>
                    <Button disabled={this.isDisabled()}
                        className='pull-right'
                        type='button'
                        onClick={() => this.createUser()}
                    >
                        Submit
                    </Button>
                </Col>
                </FormGroup>
                </Col></FormGroup>
            </Form>
        )
    }

    handleSelect (): number {
        return 1
    }
}
