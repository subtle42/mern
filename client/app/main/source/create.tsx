import * as React from "react";
import { Button, Modal, ModalBody, Tooltip, ModalFooter, ModalHeader, NavItem, NavLink, Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import Dropzone, { ImageFile } from "react-dropzone";
import SourceActions from "../../../data/sources/actions";
import widgetActions from "../../../data/widgets/actions";
import store from "../../../data/store";
import { ISource } from 'myModels';
import { CreateWidget } from '../widget/create';
import * as FontAwesome from "react-fontawesome";
import "./style.css";


class State {
    showModal: boolean = false;
    sources: ISource[] = [];
    selected: ISource;
    confirmedSource: boolean = false;
    tooltipOpen: boolean = false;
    chartType:string;
}

interface Props { }

export class SourceCreateButton extends React.Component<Props, State> {
    state: State = new State();

    close = () => {
        widgetActions.create({
            source: this.state.selected,
            type: this.state.chartType
        });
        this.setState(new State());
    }

    open = () => {
        this.setState({
            showModal: true,
            sources: store.getState().sources.list
        });
    }

    cancel = (event?) => {
        if (event) event.stopPropagation();
        this.setState(new State());
    }

    toggle = () => {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    onFileDrop(acceptedFiles: ImageFile[], rejectedFiles: ImageFile[]) {
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

    renderHeader(): JSX.Element {
        return (
            <div className='modal-header'>
                <h5>{this.state.selected ? 'Select Chart' : 'Sources'}</h5>
                {!this.state.selected &&
                    <Dropzone onDrop={this.onFileDrop} style={{ width: 'max-content' }} >
                        <Button color="general" id="TooltipExample">
                            <FontAwesome name="file" />
                        </Button>
                        <Tooltip placement="bottom" isOpen={this.state.tooltipOpen} target="TooltipExample" toggle={this.toggle}>
                            Import File
                                </Tooltip>
                    </Dropzone>
                }
            </div>
        )
    }

    getSourceListPreview(): JSX.Element {
        return <Row>
            <Col xs={6}> <ListGroup>
                {this.state.sources.map((source) => <ListGroupItem
                    className={source == this.state.selected && 'active'}
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

    renderBody(): JSX.Element {
        return (
            <ModalBody>
                {!this.state.confirmedSource && this.getSourceListPreview()}
                {this.state.confirmedSource && <CreateWidget />}
            </ModalBody>
        )
    }

    renderFooter(): JSX.Element {
        return (
            <ModalFooter style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    {this.state.confirmedSource && <Button color="secondary" onClick={() => this.back()}>Back</Button>}
                </div>
                <div>
                    <Button color="primary" disabled={!this.state.selected} style={{ marginRight: 20 }}
                        onClick={() => this.proceed()}
                    > {this.state.confirmedSource ? 'Create' : 'Next'}</Button>
                    <Button color="secondary" onClick={this.cancel}>Cancel</Button>
                </div>
            </ModalFooter>
        )
    }

    proceed() {
        this.state.confirmedSource ? this.close() : this.setState({ confirmedSource: true })
    }

    back() {
        this.setState({ confirmedSource: false });
    }

    setSource(source:ISource):void {
        this.setState({ 
            selected: this.state.selected === source ? undefined : source
        });
    }

    sourceDetails(): JSX.Element {
        if (!this.state.selected) {
            return <div></div>
        }

        return (<div>
            title: {this.state.selected.title} <br />
            rowCound: {this.state.selected.rowCount} <br />
            owner: {this.state.selected.owner} <br />
            size: {this.state.selected.size} <br />
        </div>)
    }

    render() {
        return (<div className="fixed-plugin-left" onClick={this.open}>
            <div>
                <FontAwesome style={{ paddingTop: 6 }} size="2x" name="plus" />
                {this.getModal()}
            </div>
        </div>);
    }
};