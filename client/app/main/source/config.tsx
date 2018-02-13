import * as React from "react";
import {Button, Glyphicon, Modal, Col, Row} from "react-bootstrap";

class State {
    showModal:boolean = false;
}

interface Props {
    className:string;
}


type myStyle = "success" | "warning" | "error";

export class SourceConfigButton extends React.Component<Props, State> {
    state:State = new State();
    
    close = (event) => {
        event.stopPropagation();
        this.setState(new State());
    }

    open = () => {
        this.setState({showModal:true});
    }

    cancel = (event) => {
        if (event) event.stopPropagation();
        this.setState(new State());
    }

    render() {
        return (<Button bsSize="large" className={this.props.className} onClick={this.open}>
            <Glyphicon glyph="hhd" />
            <Modal bsSize="large" show={this.state.showModal} onHide={this.cancel}>
                <Modal.Header>Source Configuration</Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col xs={6}>hi</Col>
                        <Col xs={6}>bye</Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="warning" onClick={this.cancel}>Cancel</Button>
                    <Button bsStyle="primary" onClick={this.close}>Done</Button>
                </Modal.Footer>
            </Modal>
        </Button>);
    }
};