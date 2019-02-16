import * as React from 'react'
import { IOffer } from 'common/models'
import { ListGroup, ListGroupItem, Form, FormGroup, Row, Col, Label } from 'reactstrap'

interface Props {
    next: (offer: IOffer) => void
    back: () => void
}

class State {
    isOpen: boolean = true
}

export class Failover extends React.Component<Props, State> {
    state = new State()

    handleChange = (event: React.FormEvent<any>) => {
        const target: any = event.target
        this.setState({
          isOpen: target.innerText === 'Yes'
        })
    }

    render () {
        return <Form>
            <Row><Col>
                <FormGroup>
                  <Label>Should this post becom Public if no one accepts?</Label>
                    <ListGroup>
                      <ListGroupItem
                          onClick={this.handleChange}
                          active={this.state.isOpen}>
                          Yes
                      </ListGroupItem>
                      <ListGroupItem
                          onClick={this.handleChange}
                          active={!this.state.isOpen}>
                          No
                      </ListGroupItem>
                    </ListGroup>
                </FormGroup>
            </Col></Row>
        </Form>
    }
}
