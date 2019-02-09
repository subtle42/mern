
import * as React from 'react'
import { Jumbotron, Button, InputGroup, InputGroupAddon, Input } from 'reactstrap'
import { Link } from 'react-router-dom'

class State {}

export default class LoginPage extends React.Component<any, State> {
    state: State = new State()

    render () {
        return (<div><Jumbotron>
            <h1 className='display-3'>Start earning with DigiTeam!</h1>
            <p className='lead'>Register with your referral code and start posting!</p>
            <p className='lead'>

            <InputGroup>
                <Input />
                <Link to='/register'>
                    <InputGroupAddon addonType='append'>
                        <Button color='primary'>Sign Up</Button>
                    </InputGroupAddon>
                </Link>
            </InputGroup>
            </p>
          </Jumbotron></div>)
    }
}
