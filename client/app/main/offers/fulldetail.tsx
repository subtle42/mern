import * as React from 'react'
import { IOffer } from 'common/models'
import { Form, Row, Col, FormGroup, Label} from 'reactstrap'

interface Props {
    selected: IOffer
}

export const FullDetailOffer: React.StatelessComponent = (props: Props) => {

    return <Form>
        <Row>
            <Col md={2}><Label>Who:</Label></Col>
            <Col md={10}>
                {props.selected.clientName}
            </Col>
        </Row>

        <Row>
            <Col md={2}><Label>What:</Label></Col>
            <Col md={10}>
                {props.selected.offerType}
            </Col>
        </Row>

        <Row>
            <Col md={2}><Label>When:</Label></Col>
            <Col md={10}></Col>
        </Row>

        <Row>
            <Col md={2}><Label>Where:</Label></Col>
            <Col md={10}>
                <Row><Col>{props.selected.propertyAddress.street1}</Col></Row>
                <Row>
                  <Col sm={6}>{props.selected.propertyAddress.street1}</Col>
                  <Col sm={4}>{props.selected.propertyAddress.city}</Col>
                  <Col sm={2}>{props.selected.propertyAddress.zip}</Col>
                </Row>
            </Col>
        </Row>

        <Row>
            <Col md={2}><Label>Comments:</Label></Col>
            <Col md={10}>{props.selected.comments}</Col>
        </Row>
    </Form>
}
