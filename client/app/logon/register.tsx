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

export const RegisterPage: React.StatelessComponent<Props> = (props: Props) => {
    const [registerSuccess, setRegisterSuccess] = React.useState(false)
    const [rules, setRules] = React.useState(new FormCtrlGroup({
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
        password: new FormControl('', [
            Validators.isRequired,
            Validators.minLength(4),
            Validators.maxLength(100)
        ])
    }))

    const createUser = () => {
        AuthActions.create(rules.value as any)
        .then(() => NotifActions.notify('success', 'Register Successful'))
        .then(() => setRegisterSuccess(true))
        .catch(err => NotifActions.notify('danger', err.message))
    }

    if (registerSuccess) {
        return <Redirect to='/login' />
    }

    return <Form>
        <FormGroup><Col xs={{ size: 6, offset: 3 }}>
        <FormGroup>
            <Col sm={2}>
                User Name
            </Col>
            <Col sm={10}>
                <Input
                    type='text'
                    name='name'
                    value={rules.get('name').value}
                    invalid={rules.get('name').invalid}
                    placeholder='User Name'
                    onChange={utils.handleChange(rules, setRules)} />
                <FormFeedback>{utils.getError(rules.get('name'))}</FormFeedback>
            </Col>
        </FormGroup>
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
                    type='password'
                    name='password'
                    placeholder='Password'
                    value={rules.get('password').value}
                    invalid={rules.get('password').invalid}
                    onChange={utils.handleChange(rules, setRules)} />
                <FormFeedback>{utils.getError(rules.get('password'))}</FormFeedback>
            </Col>
        </FormGroup>
        <FormGroup>
            <Col sm={{ size: 10, offset: 2 }}>
                <Button disabled={!rules.valid}
                    className='pull-right'
                    type='button'
                    onClick={() => createUser()}>
                    Submit
                </Button>
            </Col>
        </FormGroup>
        </Col></FormGroup>
    </Form>
}
