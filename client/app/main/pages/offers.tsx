import * as React from 'react'
import {Row, Container, Col} from 'reactstrap'
import OfferList from '../offers/list'
import {OfferDetails} from '../offers/details'

export const OffersPage: React.StatelessComponent = () => {
    return <Container>
        <Row>
            <Col xs={{offset:1, size:10}}>
                <OfferDetails />
            </Col>
        </Row>
        <Row>
            <Col xs={{offset:2, size:8}}>
                <OfferList />
            </Col>
        </Row>
    </Container>
}

