import * as React from 'react'
import * as Loadable from 'react-loadable'
import { Button, ModalBody, ModalFooter, Row, Col, ListGroup, ListGroupItem, Progress } from 'reactstrap'
import { ImageFile } from 'react-dropzone'
import SourceActions from 'data/sources/actions'
import { store } from 'data/store'
import { ISource } from 'common/models'
import * as FontAwesome from 'react-fontawesome'
import Loading from '../../_common/loading'

class State {
    sources: ISource[] = []
    selected: ISource = undefined
    tooltipOpen: boolean = false
    isLoading: boolean = false
}

interface Props {
    done: (source: ISource) => void
    editSource: (source: ISource) => void
    cancel: () => void
}

export class SelectSourceContent extends React.Component<Props, State> {
    state: State = new State()

    Dropzone = Loadable({
        loader: () => import('react-dropzone').then(mod => mod.default),
        loading () {
            return <Loading/>
        }
    })

    componentDidMount () {
        store.subscribe(() => {
            const storeSources = store.getState().sources.list
            if (storeSources === this.state.sources) return
            this.setState({
                sources: storeSources
            })
        })

        this.setState({
            sources: store.getState().sources.list
        })
    }

    next = () => {
        this.props.done(this.state.selected)
        let resetState = new State()
        resetState.sources = this.state.sources
        this.setState(resetState)
    }

    cancel = () => {
        let resetState = new State()
        resetState.sources = this.state.sources
        this.setState(resetState)
        this.props.cancel()
    }

    onFileDrop = (acceptedFiles: ImageFile[], rejectedFiles: ImageFile[]) => {
        // Needed to make sure there is no memory leak
        acceptedFiles.forEach(file => window.URL.revokeObjectURL(file.preview))
        rejectedFiles.forEach(file => window.URL.revokeObjectURL(file.preview))

        const reader = new FileReader()
        reader.onloadend = (event) => {
            this.setState({ isLoading: true })
            SourceActions.create(acceptedFiles[0])
            .then(sourceId => {
                this.setState({ isLoading: false })
                this.props.done(this.state.sources.filter(s => s._id === sourceId)[0])
            })
            .catch(() => this.setState({ isLoading: false }))
        }
        reader.readAsArrayBuffer(acceptedFiles[0])
    }

    getModal (): JSX.Element {
        return <div>
            {this.renderHeader()}
            {this.renderBody()}
            {this.renderFooter()}
        </div>
    }

    renderHeader (): JSX.Element {
        return (
            <div className='modal-header'>
                <h5>Sources</h5>
                <this.Dropzone disabled={this.state.isLoading} onDrop={this.onFileDrop} style={{ width: 'max-content' }} >
                    <Button color='general' id='TooltipExample'>
                        <FontAwesome name='file' />
                    </Button>
                    {/* <Tooltip placement="bottom"
                        isOpen={this.state.tooltipOpen}
                        target="TooltipExample" toggle={this.toggle}>
                        Import File
                    </Tooltip> */}
                </this.Dropzone>
            </div>
        )
    }

    renderBody (): JSX.Element {
        if (this.state.isLoading) {
            return <ModalBody>{this.getLoadingBar()}</ModalBody>
        }

        return <ModalBody><Row>
            <Col xs={6}> <ListGroup>
                {this.state.sources.map((source) => <ListGroupItem
                    className={source === this.state.selected && 'active'}
                    href='#'
                    key={source._id}
                    onClick={() => this.setSource(source)}> {source.title}
                    <FontAwesome onClick={event => this.props.editSource(source)}
                        name='edit'
                        style={{ float: 'right', cursor: 'pointer' }}
                    />
                </ListGroupItem>)}
            </ListGroup></Col>
            <Col xs={6}>
                {this.sourceDetails()}
            </Col>
        </Row></ModalBody>
    }

    renderFooter (): JSX.Element {
        return (
            <ModalFooter style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button color='primary' disabled={!this.state.selected || this.state.isLoading}
                    style={{ marginRight: 20 }}
                    onClick={() => this.next()}
                >Next</Button>
                <Button disabled={this.state.isLoading}
                    color='secondary'
                    onClick={this.cancel}
                >Cancel</Button>
            </ModalFooter>
        )
    }

    setSource = (source: ISource): void => {
        this.setState({
            selected: this.state.selected === source ? undefined : source
        })
    }

    getLoadingBar (): JSX.Element {
        return <Progress animated color='info' value={100}></Progress>
    }

    sourceDetails (): JSX.Element {
        if (!this.state.selected) return <div/>

        return (<div>
            Title: {this.state.selected.title} <br />
            Owner: {this.state.selected.owner} <br />
            Row Count: {this.state.selected.rowCount} <br />
            Size: {this.state.selected.size} <br />
        </div>)
    }

    render () {
        return this.getModal()
    }
}
