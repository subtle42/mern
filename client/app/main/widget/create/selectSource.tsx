import * as React from 'react'
import Button from 'reactstrap/lib/Button'
import ModalBody from 'reactstrap/lib/ModalBody'
import Progress from 'reactstrap/lib/Progress'
import Row from 'reactstrap/lib/Row'
import ListGroup from 'reactstrap/lib/ListGroup'
import Col from 'reactstrap/lib/Col'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import * as Loadable from 'react-loadable'
import { ImageFile } from 'react-dropzone'
import * as FontAwesome from 'react-fontawesome'

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

export const SelectSource: React.StatelessComponent<Props> = (props: Props) => {
    const getSelected = (): ISource => {
        return props.selectedId ?
            store.getState().sources.list.find(s => s._id === props.selectedId)
            : undefined
    }

    const [isLoading, setLoading] = React.useState(false)
    const [selected, setSelected] = React.useState(getSelected())
    const sources = useSources()

    const Dropzone = Loadable({
        loader: () => import('react-dropzone').then(mod => mod.default),
        loading () {
            return <Loading/>
        }
    })

    const sourceDetails = (): JSX.Element => {
        if (!selected) return <div/>

        return <div>
            Title: {selected.title} <br />
            Owner: {selected.owner} <br />
            Row Count: {selected.rowCount} <br />
            Size: {selected.size} <br />
        </div>
    }

    const onFileDrop = (acceptedFiles: ImageFile[], rejectedFiles: ImageFile[]) => {
        // Needed to make sure there is no memory leak
        acceptedFiles.forEach(file => window.URL.revokeObjectURL(file.preview))
        rejectedFiles.forEach(file => window.URL.revokeObjectURL(file.preview))

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

    const renderHeader = (): JSX.Element => {
        return <div className='modal-header'>
            <h5>Sources</h5>
            <Dropzone disabled={isLoading}
                onDrop={onFileDrop}
                style={{ width: 'max-content' }}>
                <Button color='general' id='TooltipExample'>
                    <FontAwesome name='file' />
                </Button>
            </Dropzone>
        </div>
    }

    const renderBody = (): JSX.Element => {
        if (isLoading) {
            return <ModalBody>
                <Progress animated color='info' value={100}></Progress>
            </ModalBody>
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
