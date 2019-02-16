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
    back: () => void
    // isValid?: (valid: boolean) => void
}

class State {
    isPublic: boolean = true
    selectedUsers: IUser[] = []
    users: IUser[] = []
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
        const target: any = event.target
        authActions.search(target.value)
        .then(users => this.setState({ users }))
        .catch(err => console.error(err))
    }

    selectUser = (event) => {
        const target: any = event.target
        console.log(this.state)
        const clickedUser: IUser = this.state.users[target.value]

        const myUser = this.state.selectedUsers.filter(user => user.email === clickedUser.email)[0]
        if (myUser) {
            this.setState({
                selectedUsers: this.state.selectedUsers.filter(user => {
                    return user.email !== clickedUser.email
                })
            })
        } else {
            this.state.selectedUsers.push(clickedUser)
            this.setState({
                selectedUsers: this.state.selectedUsers
            })
        }
    }

    getWhiteListForm = () => {
        if (!this.state.isPublic) {
            return <div>
              <Row><Col>
                  <FormGroup>
                      <Input name='searchInput'
                    placeholder='Search...'
                    onChange={this.searchUsers}
                    value={this.state.search} />
                  </FormGroup>
              </Col></Row>
              <Row><Col>
                  <FormGroup>
                      <p>{this.state.selectedUsers.map(user => user.email)}</p>
                  </FormGroup>
            </Col></Row>
              <Row><Col>
                  <FormGroup>
                <ListGroup>
                    {this.state.users.map((user, index) => {
                        return <ListGroupItem key={index} action
                            value={index}
                            onClick={this.selectUser}>
                            {user.name} - {user.email}
                        </ListGroupItem>
                    })}
                </ListGroup>
              </FormGroup>
            </Col></Row>
            </div>
        }
    }

    nextPage = () => {
        this.props.next({
            isPublic: this.state.isPublic,
            whiteList: this.state.selectedUsers.map(user => user._id)
        } as IOffer)
    }

    backPage = () => {
        this.props.back()
    }

    render () {
        return <Form>
            <Row><Col>
                <FormGroup>
                    <Label>Is this a PUBLIC post?</Label>
                    <ListGroup>
                        <ListGroupItem
                            active={true}>
                            Yes
                        </ListGroupItem>
                        <ListGroupItem
                            active={!true}>
                            No
                        </ListGroupItem>
                    </ListGroup>
                </FormGroup>
            </Col></Row>
                {this.getWhiteListForm()}
            <Row><Col>
              <Button color='secondary'
                  onClick={this.backPage}>
                  Back
              </Button>
                <Button color='primary'
                    onClick={this.nextPage}>
                    Next
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
