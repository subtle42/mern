import * as React from 'react'
import { Form, Col, Input, Button, FormGroup, FormFeedback } from 'reactstrap'
import { Redirect } from 'react-router-dom'
import AuthActions from 'data/auth/actions'
import NotifActions from 'data/notifications/actions'
import { FormCtrlGroup, FormControl } from '../_common/validation'
import * as Validators from '../_common/validators'
import * as utils from '../_common/utils'

class State {
    rules: FormCtrlGroup
    loginSuccess?: boolean = false
}

interface Props {}

export class LoginPage extends React.Component<Props, State> {
    state: State = new State()

    componentWillMount () {
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
        utils.handleChange(event, this.state.rules)
        this.setState({
            rules: this.state.rules
        })
    }

    tryLogin = () => {
        const { email, password } = this.state.rules.value
        AuthActions.login(email, password)
        .then(() => this.setState({
            ...(new State()),
            loginSuccess: true
        }))
        .catch(err => NotifActions.notify('danger', err))
    }

    render () {
        if (this.state.loginSuccess) {
            return (<Redirect to='home' />)
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
                          value={this.state.rules.get('email').value}
                          invalid={this.state.rules.get('email').invalid}
                          placeholder='Email'
                          onChange={this.handleChange} />
                        <FormFeedback>{utils.getError(this.state.rules.get('email'))}</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup id='formPassword'>
                    <Col sm={2}>
                        Password
                    </Col>
                    <Col sm={10}>
                        <Input
                            type='text'
                            value={this.state.rules.get('password').value}
                            invalid={this.state.rules.get('password').invalid}
                            name='password'
                            placeholder='Password'
                            onChange={this.handleChange} />
                        <FormFeedback>{utils.getError(this.state.rules.get('password'))}</FormFeedback>
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
