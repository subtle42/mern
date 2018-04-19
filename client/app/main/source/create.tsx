import * as React from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, NavItem, NavLink, Row, Col, ListGroup, ListGroupItem} from "reactstrap";
import Dropzone, {ImageFile} from "react-dropzone";
import SourceActions from "../../../data/sources/actions";
import widgetActions from "../../../data/widgets/actions";
import store from "../../../data/store";
import {ISource} from 'myModels';
import {CreateWidget} from '../widget/create';
import * as FontAwesome from "react-fontawesome";
import "./style.css";


class State {
    showModal:boolean = false;
    sources:ISource[] = [];
    selected:ISource;
    confirmedSource:boolean = false;
    chartType:string;
}

interface Props {}

export class SourceCreateButton extends React.Component<Props, State> {
    state:State = new State();
    
    close = () => {
        widgetActions.create({
            source: this.state.selected,
            type: this.state.chartType
        });
        this.setState(new State());
    }

    open = () => {
        this.setState({
            showModal:true,
            sources: store.getState().sources.list
        });
    }

    cancel = (event?) => {
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

    setChartType = (type:string) => {
        this.setState({
            chartType:type
        });
    }

    getModal():JSX.Element {
        return (<Modal size="lg" isOpen={this.state.showModal}>
            {this.renderHeader()}
            {this.renderBody()}
            {this.renderFooter()}
        </Modal>);
    }

    renderHeader():JSX.Element {
        return (
            <ModalHeader> {this.state.selected ? 'Select Chart' :'Sources' }  
                <Dropzone style={{height: 24, width: 24}} onDrop={this.onFileDrop}>
                    <Button color="general">
                        <FontAwesome name="file" />
                    </Button>
                </Dropzone>
            </ModalHeader>
        )
    }

    getSourceListPreview():JSX.Element {
        return <Row>
            <Col xs={6}> <ListGroup>
                {this.state.sources.map((source) => <ListGroupItem 
                    className={source == this.state.selected ? 'active' : '' } 
                    href="#" 
                    key={source._id} 
                    onClick={() => this.setSource(source)}> {source.title}
                    </ListGroupItem>)}
                </ListGroup></Col>
            <Col xs={6}> 
                {this.sourceDetails()}
            </Col>
        </Row>
    }

    renderBody():JSX.Element {
        return (
            <ModalBody>
                {!this.state.confirmedSource && this.getSourceListPreview()}
                {this.state.confirmedSource && <CreateWidget />}
            </ModalBody>
        )
    }

    renderFooter():JSX.Element {
        return (
            <ModalFooter>
                {this.state.confirmedSource && <Button color="secondary" onClick={() => this.back()} style={{float:"left"}}>Back</Button>}
                <Button color="primary" disabled={!this.state.selected}
                    onClick={() =>this.proceed()}
                > {this.state.confirmedSource ? 'Create' : 'Next' }</Button>
                <Button color="secondary" onClick={this.cancel}>Cancel</Button>
            </ModalFooter>
        )
    }

    proceed() {
        this.state.confirmedSource ? this.close() : this.setState({confirmedSource: true})
    }

    back() {
        this.setState({confirmedSource: false});
    }

    setSource(source){
        this.setState({selected: source});
    }

    sourceDetails():JSX.Element{
        if(!this.state.selected ) {
            return <div></div>
        } 

        return (<div>
            title: {this.state.selected.title} <br/>
            rowCound: {this.state.selected.rowCount} <br/>
            owner: {this.state.selected.owner} <br/>
            size: {this.state.selected.size} <br/>
        </div>)
    }

    render() {
        return (<div className="fixed-plugin-left" onClick={this.open}>
            <div>
                <FontAwesome style={{paddingTop:6}} size="2x" name="plus" />
                {this.getModal()}
            </div>
        </div>);
    }
};