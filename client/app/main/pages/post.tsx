import * as React from 'react'
import {Row, Container, Col} from 'reactstrap'
import {OfferForm} from '../offers/create/offer'
import { CreatePost } from '../offers/create'

export const OfferPage: React.StatelessComponent = () => {
    return <Container>
        <Row>
            <Col xs={{offset:1, size:10}}>
                <CreatePost />
            </Col>
        </Row>
    </Container>
}

