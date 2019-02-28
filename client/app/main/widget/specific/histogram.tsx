import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import FormGroup from 'reactstrap/lib/FormGroup'
import Label from 'reactstrap/lib/Label'
import Input from 'reactstrap/lib/Input'

interface Props {}

export const HistogramConfig: React.StatelessComponent<Props> = (props: Props) => {
    return <Form>
        <Row>
            <Col>
                <FormGroup>
                    <Label>Min</Label>
                    <Input></Input>
                </FormGroup>
            </Col>
        </Row>
    </Form>
}
