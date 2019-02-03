import * as React from 'react'
import { Form, Col, Input, Button, FormGroup, FormFeedback } from 'reactstrap'
import { Redirect } from 'react-router-dom'
import AuthActions from 'data/auth/actions'
import NotifActions from 'data/notifications/actions'
import { FormCtrlGroup, FormControl } from '../_common/validation'
import * as Validators from '../_common/validators'
import Label from 'reactstrap/lib/Label';

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
            return (<Redirect to='offers' />)
        }

        return (
            <Form>
                <Col sm="12" md={{ size: 6, offset: 3 }} xl={{ size: 4, offset: 4 }}>
                <FormGroup id='formEmail'>
                    <Label for='email'> Email </Label>
                      <Input
                          type='email'
                          name='email'
                          value={this.state.rules.controls.email.value}
                          invalid={this.state.rules.controls.email.invalid}
                          placeholder='Email'
                          onChange={this.handleChange} />
                        <FormFeedback>{this.getError('email')}</FormFeedback>
                </FormGroup>
                <FormGroup id='formPassword'>
                    <Label for='password'> Password </Label>
                        <Input
                            type='password'
                            value={this.state.rules.controls.password.value}
                            invalid={this.state.rules.controls.password.invalid}
                            name='password'
                            placeholder='Password'
                            onChange={this.handleChange} />
                        <FormFeedback>{this.getError('password')}</FormFeedback>
                </FormGroup>
                    <Button disabled={!this.state.rules.valid}
                        color="primary" 
                        size="lg" 
                        block
                        onClick={() => this.tryLogin()}>
                        Sign in
                    </Button>
                </Col>
            </Form>
        )
    }
}
