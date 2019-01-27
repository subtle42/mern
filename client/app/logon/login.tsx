import * as React from 'react'
import { Form, Col, Input, Button, FormGroup, FormFeedback } from 'reactstrap'
import { Redirect } from 'react-router-dom'
import AuthActions from 'data/auth/actions'
import NotifActions from 'data/notifications/actions'
import { FormCtrlGroup, FormControl } from '../_common/validation'
import * as Validators from '../_common/validators'

class State {
    rules: FormCtrlGroup
    loginSuccess?: boolean = false
}

export default class LoginPage extends React.Component<any, State> {
    state: State = new State()

    componentWillMount() {
        const rules = new FormCtrlGroup({
            email: new FormControl('', [
                Validators.isRequired,
                Validators.maxLength(100)
            ]),
            password: new FormControl('', [
                Validators.isRequired,
                Validators.maxLength(100)
            ])
        })
        this.setState({ rules })
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.state.rules.controls[target.name].value = target.value;
        this.setState({
            rules: this.state.rules
        })
    }

    tryLogin = () => {
        const { email, password } = this.state.rules.value;
        AuthActions.login(email, password)
        .then(() => this.setState({
            ...(new State()),
            loginSuccess: true
        }))
        .catch(err => NotifActions.notify('danger', err))
    }

    getError = (field: string): string => {
        return this.state.rules.controls[field].error
            ? this.state.rules.controls[field].error.message
            : ''
    }

    render () {
        if (this.state.loginSuccess) {
            return (<Redirect to='offer' />)
        }

        return (
            <Form>
                <FormGroup><Col xs={{ size: 6, offset: 3 }}>
                <FormGroup id='formEmail'>
                    <Col sm={2}>
                        Email
                    </Col>
                    <Col sm={10}>
                      <Input
                          type='email'
                          name='email'
                          value={this.state.rules.controls.email.value}
                          invalid={this.state.rules.controls.email.invalid}
                          placeholder='Email'
                          onChange={this.handleChange} />
                        <FormFeedback>{this.getError('email')}</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup id='formPassword'>
                    <Col sm={2}>
                        Password
                    </Col>
                    <Col sm={10}>
                        <Input
                            type='text'
                            value={this.state.rules.controls.password.value}
                            invalid={this.state.rules.controls.password.invalid}
                            name='password'
                            placeholder='Password'
                            onChange={this.handleChange} />
                        <FormFeedback>{this.getError('password')}</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup>
                <Col sm={{ size: 10, offset: 2 }}>
                    <Button disabled={!this.state.rules.valid}
                        className='pull-right'
                        type='button'
                        onClick={() => this.tryLogin()}>
                        Sign in
                    </Button>
                </Col>
                </FormGroup>
                </Col></FormGroup>
            </Form>
        )
    }
}
