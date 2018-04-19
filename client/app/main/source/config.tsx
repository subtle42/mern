import * as React from "react";
import {Button, Modal, Col, Row, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

class State {
    showModal:boolean = false;
}

interface Props {
    className:string;
}


type myStyle = "success" | "warning" | "error";

export class SourceConfigButton extends React.Component<Props, State> {
    state:State = new State();
    
    close = () => {
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
        return (<Button size="lg" className={this.props.className} onClick={this.open}>
            <i className="material-icons">file_upload</i>
            <Modal size="large" isOpen={this.state.showModal} onClosed={this.close}>
                <ModalHeader>Source Configuration</ModalHeader>
                <ModalBody>
                    <Row>
                        <Col xs={6}>hi</Col>
                        <Col xs={6}>bye</Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <Button color="warning" onClick={this.cancel}>Cancel</Button>
                    <Button color="primary" onClick={this.close}>Done</Button>
                </ModalFooter>
            </Modal>
        </Button>);
    }
};