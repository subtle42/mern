import * as React from 'react'
import Form from 'reactstrap/lib/Form'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import { FormCtrlGroup, FormControl } from 'client/app/_common/validation'
import Input from 'reactstrap/lib/Input';
import FormFeedback from 'reactstrap/lib/FormFeedback';

interface Props {}

export const EditButton: React.StatelessComponent = (props: Props) => {
    const [rules, setRules] = React.useState(new FormCtrlGroup({
        margins: new FormCtrlGroup({
            top: new FormControl(0),
            left: new FormControl(0),
            bottom: new FormControl(0),
            right: new FormControl(0)
        })
    }))

    const getErrorMsg = (msg: FormControl) => {}

    return <Form>
        <Row>
            <Col>
                <Input
                    type='text'
                    name='margins.top'/>
                <FormFeedback></FormFeedback>
            </Col>
        </Row>
    </Form>
}
