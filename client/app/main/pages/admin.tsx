import * as React from 'react'
import {Row, Container, Col} from 'reactstrap'
import OfferList from '../offers/list'
import {OfferDetails} from '../offers/details'

export const AdminPage: React.StatelessComponent = () => {
    return (<Container>
        <Row>
            <Col xs={{offset:1, size:10}}>
                <h1>Admin Page</h1>
            </Col>
        </Row>
    </Container>)
}