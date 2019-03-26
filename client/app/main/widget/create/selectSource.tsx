import * as React from 'react'
import Button from 'reactstrap/lib/Button'
import ModalBody from 'reactstrap/lib/ModalBody'
import Progress from 'reactstrap/lib/Progress'
import Row from 'reactstrap/lib/Row'
import ListGroup from 'reactstrap/lib/ListGroup'
import Col from 'reactstrap/lib/Col'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import ModalFooter from 'reactstrap/lib/ModalFooter'
// import * as Loadable from 'react-loadable'
import * as FontAwesome from 'react-fontawesome'
import { useDropzone } from 'react-dropzone'

import SourceActions from 'data/sources/actions'
import NotifActions from 'data/notifications/actions'
import { store } from 'data/store'
import { ISource } from 'common/models'
import { Loading } from '../../../_common/loading'
import { useSources } from '../../../_common/hooks'

interface Props {
    selectedId?: string
    done: (source: ISource) => void
    cancel: () => void
}

export const SelectSource: React.FunctionComponent<Props> = (props: Props) => {    
    const getSelected = (): ISource => {
        return props.selectedId ?
            store.getState().sources.list.find(s => s._id === props.selectedId)
            : undefined
    }

    const [isLoading, setLoading] = React.useState(false)
    const [selected, setSelected] = React.useState(getSelected())
    const sources = useSources()

    // const Dropzone = Loadable({
    //     loader: () => import('react-dropzone').then(mod => mod.default),
    //     loading () {
    //         return <Loading/>
    //     }
    // })

    const sourceDetails = (): JSX.Element => {
        if (!selected) return <div/>

        return <div>
            Title: {selected.title} <br />
            Owner: {selected.owner} <br />
            Row Count: {selected.rowCount} <br />
            Size: {selected.size} <br />
        </div>
    }

    const onFileDrop = (acceptedFiles: File[]) => {
        const reader = new FileReader()
        reader.onloadend = (event) => {
            setLoading(true)
            SourceActions.create(acceptedFiles[0])
            .then(sourceId => props.done(store.getState().sources.list
                .find(x => x._id === sourceId))
            )
            .catch(err => {
                NotifActions.error(err.message)
                setLoading(false)
            })
        }
        reader.readAsArrayBuffer(acceptedFiles[0])
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onFileDrop })

    const renderHeader = (): JSX.Element => {
        return <div className='modal-header'>
            <h5>Sources</h5>
            <div {...getRootProps()} hidden={isLoading}>
                <input {...getInputProps()} />
                <Button color='general'
                    id='TooltipExample'>
                    <FontAwesome name='file'/> Click to upload
                </Button>
            </div>
        </div>
    }

    const largeFileDragAndDrop = (): JSX.Element => {
        return <ModalBody>
            <Row>
                <Col xs={{ size: 6, offset: 3 }}>
                    <div {...getRootProps()}>
                    <ListGroup >
                        <input {...getInputProps()} />
                        <ListGroupItem color={isDragActive ? 'primary' : ''}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <h4>Drag and drop file here</h4>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <FontAwesome name='file' size='5x' />
                            </div>
                        </ListGroupItem>
                    </ListGroup>
                    </div>
                </Col>
            </Row>
        </ModalBody>
    }

    const renderBody = (): JSX.Element => {
        if (isLoading) {
            return <ModalBody>
                <Progress animated color='info' value={100}></Progress>
            </ModalBody>
        }

        if (sources.length === 0) {
            return largeFileDragAndDrop()
        }

        return <ModalBody><Row>
            <Col xs={6}><ListGroup>
                {sources.map(source => <ListGroupItem
                    action
                    className={source === selected && 'active'}
                    key={source._id}
                    onClick={() => setSelected(source)}>
                    {source.title}
                </ListGroupItem>)}
            </ListGroup></Col>
            <Col xs={6}>
                {sourceDetails()}
            </Col>
        </Row></ModalBody>
    }

    const renderFooter = (): JSX.Element => {
        return <ModalFooter style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color='primary'
                disabled={!selected || isLoading}
                onClick={() => props.done(selected)}>
                Next
            </Button>
            <Button color='secondary'
                disabled={isLoading}
                onClick={() => props.cancel()}>
                Cancel
            </Button>
        </ModalFooter>
    }

    return <div>
        {renderHeader()}
        {renderBody()}
        {renderFooter()}
    </div>
}
