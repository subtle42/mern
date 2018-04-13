import * as React from "react";
import {Button, Glyphicon, Modal, Tabs, Tab, Well, Row, Col, ListGroup, ListGroupItem} from "react-bootstrap";
import Dropzone, {ImageFile} from "react-dropzone";
import SourceActions from "../../../data/sources/actions";
import widgetActions from "../../../data/widgets/actions";
import store from "../../../data/store";
import {ISource} from 'myModels';
import {CreateWidget} from '../widget/create';
import "./style.css";


class State {
    showModal:boolean = false;
    sources:ISource[] = [];
    selected:ISource;
    confirmedSource:boolean = false;
}

interface Props {
    className?:string;
}

export class SourceCreateButton extends React.Component<Props, State> {
    state:State = new State();
    
    close = (event) => {
        event.stopPropagation();
        this.createWidget();
        this.setState(new State());
    }

    open = () => {
        this.setState({
            showModal:true,
            sources: store.getState().sources.list
        });
    }

    cancel = (event) => {
        if (event) event.stopPropagation();
        this.setState(new State());
    }

    onFileDrop(acceptedFiles:ImageFile[], rejectedFiles:ImageFile[]) {
        // Needed to make sure there is no memory leak
        acceptedFiles.forEach(file => window.URL.revokeObjectURL(file.preview));
        rejectedFiles.forEach(file => window.URL.revokeObjectURL(file.preview));

        const reader = new FileReader();
        reader.onloadend = (event) => {
            SourceActions.create(acceptedFiles[0])
            .then(sourceId => alert("done"));
        };
        reader.readAsArrayBuffer(acceptedFiles[0]);
    }

    getModal():JSX.Element {
        const sources = store.getState().sources.list;

        return (<Modal bsSize="large" show={this.state.showModal} onHide={this.cancel}>
            {this.renderHeader()}
            {this.renderBody()}
            {this.renderFooter()}
        </Modal>);
    }

    renderHeader():JSX.Element {
        return (
            <Modal.Header> {this.state.selected ? 'Select Chart' :'Sources' }  
                    <Dropzone style={{height: 24, width: 24}} onDrop={this.onFileDrop}>
                <Button>
                        <Glyphicon glyph="plus" style={{fontSize:12, justifyContent: 'center', display: 'flex'}}/>
                </Button>
                    </Dropzone>
            </Modal.Header>
        )
    }

    renderBody():JSX.Element {
        return (
            <Modal.Body>
                {!this.state.selected ? (
                <Row>
                <Col xs={6}> <ListGroup>
                    {this.state.sources.map((source) => <ListGroupItem 
                        className={source == this.state.selected ? 'active' : '' } 
                        href="#" 
                        key={source._id} 
                        onClick={(e) => this.setSource(e, source)}> {source.title}
                        </ListGroupItem>)}
                    </ListGroup></Col>
                <Col xs={6}> 
                    {this.sourceDetails()}
                </Col>
            </Row>
                ): (
                    <CreateWidget />
                )}

            </Modal.Body>
        )
        
    }

    renderFooter():JSX.Element {
        return (
            <Modal.Footer>
                <Button bsStyle="warning" onClick={this.cancel}>Cancel</Button>
                <Button bsStyle="primary"
                    onClick={(event) =>this.proceed(event)}
                > {this.state.selected ? 'Create' : 'Next' }</Button>
            </Modal.Footer>
        )
    }
    proceed(event) {
        this.state.confirmedSource ? this.close(event) : this.setState({confirmedSource: true})
    }

    setSource(event, source){
        this.setState({selected: source});
    }

    getSelectSourcePage():JSX.Element {
        return (<Row>
            <Col xs={6}>
                <ListGroup>
                    <ListGroupItem href="#">Item 1</ListGroupItem>
                    <ListGroupItem href="#">Item 2</ListGroupItem>
                </ListGroup>
            </Col>
            <Col xs={6}>
                
            </Col>
        </Row>);
    }

    sourceDetails():JSX.Element{
        if(!this.state.selected ) {
            return <div></div>
        } 

        return (
            <Well>
            title: {this.state.selected.title} <br/>
            rowCound: {this.state.selected.rowCount} <br/>
            owner: {this.state.selected.owner} <br/>
            size: {this.state.selected.size} <br/>
        </Well>
        )

    }

    createWidget(){
        widgetActions.create()
    }

    getAddSourcePage():JSX.Element {
        return (<Row>
            <Col xs={8} xsOffset={2} >
            <Dropzone style={{width:"100%", height:250}} accept="" onDrop={this.onFileDrop}>
                <Well style={{marginTop:"33px"}}>
                    <h3 style={{display: 'flex', justifyContent: 'center'}}>
                        Drag and Drop a file.
                    </h3>
                    <Glyphicon glyph="file" style={{fontSize:90, justifyContent: 'center', display: 'flex'}} />
                    <br/>
                    <Button>Select File</Button>
                </Well>
            </Dropzone>
            </Col>
        </Row>);
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