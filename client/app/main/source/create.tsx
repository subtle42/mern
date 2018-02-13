import * as React from "react";
import {Button, Glyphicon, Modal, Tabs, Tab, Well, Row, Col} from "react-bootstrap";
import "./style.css";

class State {
    showModal:boolean = false;
}

interface Props {
    className?:string;
}


type myStyle = "success" | "warning" | "error";

export class SourceCreateButton extends React.Component<Props, State> {
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

    getModal():JSX.Element {
        return (
            <Modal bsSize="large" show={this.state.showModal} onHide={this.cancel}>
            <Modal.Header>Add Content</Modal.Header>
            <Modal.Body>
                <Tabs defaultActiveKey={2} id="create-source-tabs">
                    <Tab eventKey={1} title="Add Source">
                        {this.getAddSourcePage()}
                    </Tab>
                    <Tab eventKey={2} title="Add Chart"></Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button bsStyle="warning" onClick={this.cancel}>Cancel</Button>
                <Button bsStyle="primary"
                    onClick={this.close}
                >Create</Button>
            </Modal.Footer>
        </Modal>
        );
    }

    getAddSourcePage():JSX.Element {
        return (
            <Row>
                <Col xs={8} xsOffset={2} >
                    <Well style={{marginTop:"33px"}}>
                        <h3 style={{display: 'flex', justifyContent: 'center'}}>
                            Drag and Drop a file.
                        </h3>
                        <Glyphicon glyph="file" style={{fontSize:90, justifyContent: 'center', display: 'flex'}} />
                        <br/><Button>Select File</Button>
                    </Well>
                </Col>
            </Row>
        );
    }

    render() {
        return (<div className="fixed-plugin-left" onClick={this.open}>
            <div>
                <Glyphicon className="sideMenuIcon" glyph="plus"/>
                {this.getModal()}
            </div>
        </div>);
    }
};