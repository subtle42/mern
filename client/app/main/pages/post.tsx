import * as React from 'react'
import {Row, Container, Col} from 'reactstrap'
import OfferForm from '../offers/offer'

export const OfferPage: React.StatelessComponent = () => {
    return <Container>
        <Row>
            <Col xs={{offset:1, size:10}}>
                <OfferForm />
            </Col>
        </Row>
    </Container>
}

