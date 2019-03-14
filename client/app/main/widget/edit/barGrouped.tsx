import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import FormGroup from 'reactstrap/lib/FormGroup'

import { buildInput } from '../../../_common/forms'
import { buildAxisTemplate, buildLegendTemplate } from './_common'

export const barGroupForm = (rules, setRules): JSX.Element => {
    return <Form>
        <Row>
            <Col>
                <FormGroup>
                    {buildLegendTemplate(rules, setRules)}
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
