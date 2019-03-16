import * as React from 'react'
import Card from 'reactstrap/lib/Card'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import CustomInput from 'reactstrap/lib/CustomInput'
import Collapse from 'reactstrap/lib/Collapse'
import FormGroup from 'reactstrap/lib/FormGroup'

import * as utils from '../../../_common/utils'
import { buildInput } from '../../../_common/forms'

export const buildLegendTemplate = (rules, setRules): JSX.Element => {
    return <Row>
        <Col>
            <FormGroup>
                <CustomInput id='other.showLegend'
                    label='Show Legend'
                    name='other.showLegend'
                    type='switch'
                    checked={rules.get('other').get('showLegend').value}
                    onChange={utils.handleToggle(rules, setRules)}>
                </CustomInput>
            </FormGroup>
        </Col>
    </Row>
}

export const buildAxisTemplate = (axis: string, rules, setRules): JSX.Element => {
    return <Card body style={{ padding: 10 }}>
        <Row>
            <Col>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CustomInput id={`${axis}.show`}
                        label={axis}
                        name={`${axis}.show`}
                        type='switch'
                        checked={rules.get(axis).get('show').value}
                        onChange={utils.handleToggle(rules, setRules)}>
                    </CustomInput>
                </div>
            </Col>
        </Row>
        <Collapse isOpen={rules.get(axis).get('show').value}>
            <Row>
                <Col>
                    {buildInput(`${axis}.min`, 'number', rules, setRules, 'Min')}
                </Col>
                <Col>
                    {buildInput(`${axis}.max`, 'number', rules, setRules, 'Max')}
                </Col>
                <Col>
                    {buildInput(`${axis}.ticks`, 'number', rules, setRules, 'Ticks', {
                        min: 1,
                        max: 20
                    })}
                </Col>
            </Row>
        </Collapse>
    </Card>
}
