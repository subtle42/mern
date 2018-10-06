import * as React from 'react'
import { Form, Col, Input, Button, FormGroup, FormFeedback } from 'reactstrap'
import { Redirect } from 'react-router-dom'
import AuthActions from 'data/auth/actions'
import { FormCtrlGroup, FormControl } from '../_common/validation'
import * as Validators from '../_common/validators'

class State {
    rules: FormCtrlGroup
    registerSuccess?: boolean
}

type myStyle = 'success' | 'warning' | 'error'

export default class LoginPage extends React.Component<{}, State> {
    state: State = new State()

    componentWillMount() {
        const rules = new FormCtrlGroup({
            email: new FormControl('', [
                Validators.isRequired,
                Validators.isEmail,
                Validators.maxLength(100)
            ]),
            name: new FormControl('', [
                Validators.isRequired,
                Validators.minLength(5),
                Validators.maxLength(100)
            ]),
            password: new FormControl('', [
                Validators.isRequired,
                Validators.minLength(4),
                Validators.maxLength(100)
            ])
        })
        this.setState({ rules })
    }

    createUser = () => {
        AuthActions.create(this.state.rules.value as any)
        .then(() => this.setState({ registerSuccess: true }))
    }

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.state.rules.controls[target.name].value = target.value
        this.setState({
            rules: this.state.rules
        })
    }

    getError = (field: string): string => {
        return this.state.rules.controls[field].error
            ? this.state.rules.controls[field].error.message
            : ''
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
                            name='name'
                            value={this.state.rules.controls.name.value}
                            invalid={this.state.rules.controls.name.invalid}
                            placeholder='User Name'
                            onChange={this.handleChange} />
                        <FormFeedback>{this.getError('name')}</FormFeedback>
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
                            name='password'
                            placeholder='Password'
                            value={this.state.rules.controls.password.value}
                            invalid={this.state.rules.controls.password.invalid}
                            onChange={this.handleChange} />
                        <FormFeedback>{this.getError('password')}</FormFeedback>
                    </Col>
                </FormGroup>
                <FormGroup>
                <Col sm={{ size: 10, offset: 2 }}>
                    {this.state.rules.invalid}
                    <Button disabled={!this.state.rules.valid}
                        className='pull-right'
                        type='button'
                        onClick={() => this.createUser()}>
                        Submit
                    </Button>
                </Col>
                </FormGroup>
                </Col></FormGroup>
            </Form>
        )
    }
}
