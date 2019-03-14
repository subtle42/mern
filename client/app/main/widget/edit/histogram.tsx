import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import FormGroup from 'reactstrap/lib/FormGroup'

import { buildInput } from '../../../_common/forms'
import { buildAxisTemplate } from './_common'

export const histogramForm = (rules, setRules): JSX.Element => {
    return <Form>
        <Row>
            <Col>
                <FormGroup>
                    {buildInput('ticks', 'number', rules, setRules, undefined, {
                        min: 1,
                        max: 50
                    })}
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col>
                <FormGroup>
                    {buildAxisTemplate('xAxis', rules, setRules)}
                </FormGroup>
            </Col>
        </Row>
        <Row>
            <Col>
                <FormGroup>
                    {buildAxisTemplate('yAxis', rules, setRules)}
                </FormGroup>
            </Col>
        </Row>
    </Form>
}
