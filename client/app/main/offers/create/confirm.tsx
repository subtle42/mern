import * as React from 'react'
import { Form, Col, Row, Button, Label, FormGroup} from 'reactstrap'

interface Props {
    back: () => void
    next: () => void
}

class State {}

export class ConfirmCreate extends React.Component<Props, State> {
    state = new State()

    render () {
        return <Form>
            <Row><Col>
                <FormGroup>
                  <Label>Confirm create offer?</Label>
                </FormGroup>
            </Col></Row>

            <Row><Col>
                <Button color='secondary'
                    onClick={() => this.props.back()}>
                    Back
                </Button>
                <Button color='primary'
                    onClick={() => this.props.next()}>
                    Create
                </Button>
            </Col></Row>
        </Form>
    }
}
