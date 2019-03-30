import * as React from 'react'
import { Redirect } from 'react-router-dom'
import Form from 'reactstrap/lib/Form'
import FormGroup from 'reactstrap/lib/FormGroup'
import Col from 'reactstrap/lib/Col'
import Input from 'reactstrap/lib/Input'
import FormFeedback from 'reactstrap/lib/FormFeedback'
import Button from 'reactstrap/lib/Button'

import AuthActions from 'data/auth/actions'
import NotifActions from 'data/notifications/actions'
import { FormCtrlGroup, FormControl } from '../_common/validation'
import * as Validators from '../_common/validators'
import * as utils from '../_common/utils'

interface Props {}

export const LoginPage: React.StatelessComponent<Props> = (props: Props) => {
    const [loginSuccess, setLoginSuccess] = React.useState(false)
    const [rules, setRules] = React.useState(new FormCtrlGroup({
        email: new FormControl('', [
            Validators.isRequired,
            Validators.maxLength(100)
        ]),
        password: new FormControl('', [
            Validators.isRequired,
            Validators.maxLength(100)
        ])
    }))

    const tryLogin = () => {
        const { email, password } = rules.value
        AuthActions.login(email, password)
        .then(() => setLoginSuccess(true))
        .catch(err => NotifActions.notify('danger', err))
    }

    if (loginSuccess) {
        return (<Redirect to='main' />)
    }

    return <Form>
        <FormGroup><Col xs={{ size: 6, offset: 3 }}>
        <FormGroup>
            <Col sm={2}>
                Email
            </Col>
            <Col sm={10}>
                <Input
                    type='email'
                    name='email'
                    value={rules.get('email').value}
                    invalid={rules.get('email').invalid}
                    placeholder='Email'
                    onChange={utils.handleChange(rules, setRules)} />
                <FormFeedback>{utils.getError(rules.get('email'))}</FormFeedback>
            </Col>
        </FormGroup>
        <FormGroup>
            <Col sm={2}>
                Password
            </Col>
            <Col sm={10}>
                <Input
                    type='text'
                    value={rules.get('password').value}
                    invalid={rules.get('password').invalid}
                    name='password'
                    placeholder='Password'
                    onChange={utils.handleChange(rules, setRules)} />
                <FormFeedback>{utils.getError(rules.get('password'))}</FormFeedback>
            </Col>
        </FormGroup>
        <FormGroup>
        <Col sm={{ size: 10, offset: 2 }}>
            <Button disabled={!rules.valid}
                className='pull-right'
                type='button'
                onClick={() => tryLogin()}>
                Sign in
            </Button>
        </Col>
        </FormGroup>
        </Col></FormGroup>
    </Form>
}
