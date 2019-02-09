import * as React from 'react'
import { Label, Button, Row, Form, Col } from 'reactstrap'
import Input from 'reactstrap/lib/Input'
import FormGroup from 'reactstrap/lib/FormGroup'
import * as utils from '../../../_common/utils'
import ListGroup from 'reactstrap/lib/ListGroup'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import { IUser, IOffer } from 'common/models'
import authActions from 'data/auth/actions';

interface Props {
    next: (offer: IOffer) => void
    // isValid?: (valid: boolean) => void
}

class State {
    isPublic: boolean = true
    emails: string[] = []
    search: string = ''
}

export class PostOptions extends React.Component<Props, State> {
    state: State = new State()

    updateForm = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.setState({
            isPublic: target.value === 'true'
        })
    }

    updateSearch = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.setState({
            search: target.value
        })
    }

    searchUsers = (event: React.FormEvent<any>) => {
        this.updateSearch(event)
        const name = this.state.search
        authActions.search(name)
        .then(users => console.log(users))
        .catch(err => console.error(err))
    }

    getWhiteListForm = () => {
        if (!this.state.isPublic) {
            return <div>
                <Input name='searchInput'
                    placeholder='Search...'
                    onChange={this.searchUsers}
                    value={this.state.search} />
                {/* <WhiteList /> */}
            </div>
        }
    }

    nextPage = () => {
        this.props.next({
            isPublic: this.state.isPublic,
            whiteList: this.state.emails
        } as IOffer)
    }

    render () {
        return <Form className='container'>
            <Row><Col>
                <FormGroup>
                    <Label>Is this a PUBLIC post?</Label>
                    <FormGroup check>
                        <Label check>
                            <Input
                                onChange={this.updateForm}
                                type='radio'
                                checked={this.state.isPublic}
                                value='true'
                                name='isPublic' />
                            Yes
                        </Label>
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input
                                onChange={this.updateForm}
                                type='radio'
                                checked={!this.state.isPublic}
                                value='false'
                                name='isPublic' />
                            No
                        </Label>
                    </FormGroup>
                </FormGroup>
            </Col></Row>
            <Row><Col>
                <FormGroup>
                    {this.getWhiteListForm()}
                </FormGroup>
            </Col></Row>
            <Row><Col>
                <Button className='btn btn-primary'
                    onClick={this.nextPage}>
                    Post Offer
                </Button>
            </Col></Row>
        </Form>
    }
}

interface WhiteListProps {
    // users: IUser[]
}

class WhiteList extends React.Component<WhiteListProps, {}> {
    render () {
        return <ListGroup>
            {/* {this.props.users.map(user => {
                return <ListGroupItem>
                    {user.name}<br/>
                    {user.email}<br/>
                    {user.company}
                </ListGroupItem>
            })} */}
        </ListGroup>
    }
}
