import * as React from 'react'
import { Form, Col, Input, Button, FormGroup, FormFeedback, Label } from 'reactstrap'
import { Redirect } from 'react-router-dom'
import AuthActions from 'data/auth/actions'
import { FormCtrlGroup, FormControl, FormCtrlArray } from '../_common/validation'
import * as Validators from '../_common/validators'
import * as utils from '../_common/utils'

class State {
    rules: FormCtrlGroup
    registerSuccess?: boolean
}

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
                Validators.minLength(4),
                Validators.maxLength(100)
            ]),
            role: new FormControl('user', [
                Validators.isRequired,
            ]),
            password: new FormControl('', [
                Validators.isRequired,
                Validators.minLength(4),
                Validators.maxLength(100)
            ]),
            referralCode: new FormControl('', [
                Validators.minLength(6)
            ])
        })
        this.setState({ rules })
    }

    createUser = () => {
        AuthActions.create(this.state.rules.value as any)
        .then(() => this.setState({ registerSuccess: true }))
    }

    handleChange = (event: React.FormEvent<any>) => {
        utils.handleChange(event, this.state.rules)
        console.log(this.state.rules)
        this.setState({
            rules: this.state.rules
        })
    }

    getError = (ctrl: FormControl | FormCtrlArray | FormCtrlGroup): string => {
        return ctrl.error
            ? ctrl.error.message
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
                    <Label for='name'>
                        User Name
                    </Label>
                    <Input
                        type='text'
                        name='name'
                        value={this.state.rules.get('name').value}
                        invalid={this.state.rules.get('name').invalid}
                        placeholder='User Name'
                        onChange={this.handleChange} />
                    <FormFeedback>{this.getError(this.state.rules.get('name'))}</FormFeedback>
        
                </FormGroup>
                <FormGroup id='formEmail'>
                    <Label for='email'>
                        Email
                    </Label>
                    <Input
                        type='email'
                        name='email'
                        value={this.state.rules.get('email').value}
                        invalid={this.state.rules.get('email').invalid}
                        placeholder='Email'
                        onChange={this.handleChange} />
                    <FormFeedback>{this.getError(this.state.rules.get('email'))}</FormFeedback>
    
                </FormGroup>
                <FormGroup id='formPassword'>
                    <Label for='password'>
                        Password
                    </Label>
                    <Input
                        type='text'
                        name='password'
                        placeholder='Password'
                        value={this.state.rules.get('password').value}
                        invalid={this.state.rules.get('password').invalid}
                        onChange={this.handleChange} />
                    <FormFeedback>{this.getError(this.state.rules.get('password'))}</FormFeedback>
                </FormGroup>
                <FormGroup id='formRole'>
                    <Label for='role'>
                        Role
                    </Label>
                        <Input
                            type='select'
                            name='role'
                            placeholder='Select Role'
                            value={this.state.rules.get('role').value}
                            invalid={this.state.rules.get('role').invalid}
                            onChange={this.handleChange} > 
                            <option value='user'>User</option>
                            <option value='admin'>Admin</option>
                            </Input>
                        <FormFeedback>{this.getError(this.state.rules.get('role'))}</FormFeedback>
                </FormGroup>
                <FormGroup id='formReferral'>
                    <Label  for='referralCode'>
                        Referral Code (optional)
                    </Label>
                    <Input
                        type='text'
                        name='referralCode'
                        placeholder='Referral Code (optional)'
                        value={this.state.rules.get('referralCode').value}
                        invalid={this.state.rules.get('referralCode').invalid}
                        onChange={this.handleChange} />
                    <FormFeedback>{this.getError(this.state.rules.get('referralCode'))}</FormFeedback>
                </FormGroup>
                <Button disabled={!this.state.rules.valid}
                    size="lg" 
                    block
                    className='pull-right'
                    type='button'
                    onClick={() => this.createUser()}>
                    Submit
                </Button>


                </Col></FormGroup>
            </Form>
        )
    }
}
