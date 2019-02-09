import * as React from 'react'
import { Label, Button, Row, Form, Col } from 'reactstrap';
import Input from 'reactstrap/lib/Input';
import FormGroup from 'reactstrap/lib/FormGroup';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import { IUser } from 'common/models';
import { connect } from 'react-redux';
import { StoreModel } from 'data/store';

interface Props {}

export const PostOptions: React.StatelessComponent = (props: Props) => {
    const [isWhitelist, setIsWhitelist] = React.useState(false)

    const updateForm = (event) => {
        setIsWhitelist(event.value)
    }

    return <Form className="container">
        <Row><Col>
            <FormGroup>
                <Label>Is this a PUBLIC post?</Label>
                <Input
                    onChange={updateForm}
                    type='radio'
                    value='true'
                    name='isPublic'>
                        Yes
                </Input>
                <Input
                    onChange={updateForm}
                    type='radio'
                    value='true'
                    name='isPublic'>
                        Yes
                </Input>
            </FormGroup>
        </Col></Row>
    </Form>
}

interface WhiteListProps {
    users: IUser[]
}

export const WhiteList: React.StatelessComponent = (props: WhiteListProps) => {


    return <ListGroup>
        {props.users.map(user => {
            return <ListGroupItem>
                {user.name}<br/>
                {user.email}<br/>
                {user.company}
            </ListGroupItem>
        })}
    </ListGroup>
}

export const WhiteListComponent = connect((store: StoreModel): Props => {
    return {
        list: store.offer.list,
        selectedId: store.offer.selected
    }
})(WhiteList)