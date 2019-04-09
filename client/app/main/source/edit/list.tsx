import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import ModalHeader from 'reactstrap/lib/ModalHeader'
import ModalBody from 'reactstrap/lib/ModalBody'
import ModalFooter from 'reactstrap/lib/ModalFooter'
import ListGroupItem from 'reactstrap/lib/ListGroupItem'
import Button from 'reactstrap/lib/Button'
import ListGroup from 'reactstrap/lib/ListGroup'

import { ISource } from 'common/models'
import { useSources, useUser } from '../../../_common/hooks'
import { ConfirmModal } from '../../../_common/confirmation'
import SourceActions from 'data/sources/actions'
import NotifActions from 'data/notifications/actions'
import Row from 'reactstrap/lib/Row'
import Col from 'reactstrap/lib/Col'
import Input from 'reactstrap/lib/Input'
import FormGroup from 'reactstrap/lib/FormGroup'

interface Props {
    onDone: () => void
    onEdit: (source: ISource) => void
}

export const SourceList: React.FunctionComponent<Props> = (props: Props) => {
    const sources = useSources()
    const user = useUser()
    // const [listedSources, setListedSources] = React.useState(sources)
    const [searchName, setSearchName] = React.useState('')

    const remove = (source: ISource) => {
        SourceActions.delete(source._id)
        .then(() => NotifActions.success(`Removed source: ${source.title}`))
        .catch(err => NotifActions.error(err.message))
    }

    const getDeleteButton = (source: ISource): JSX.Element => {
        const isDisabled = source.owner !== user._id
        return <ConfirmModal header='Delete Source'
            message={`Are you sure you want to delete: ${source.title}?`}>
            <Button outline
                disabled={isDisabled}
                onClick={() => remove(source)}
                color='danger'
                size='sm'>
                <FontAwesome name='trash'/>
            </Button>
        </ConfirmModal>
    }

    const getEditButton = (source: ISource): JSX.Element => {
        const userId = user._id
        const isDisabled = source.owner !== userId || source.editors.indexOf(userId) !== -1
        return <Button outline
            disabled={isDisabled}
            style={{ marginRight: 10 }}
            onClick={() => props.onEdit(source)}
            color='secondary'
            size='sm'>
            <FontAwesome name='edit'/>
        </Button>
    }

    const getList = (): JSX.Element => {
        return <ListGroup style={{ maxHeight: 500, overflowY: 'auto' }}>
            {sources.filter(runSourceFilter)
                .map((source, index) => <ListGroupItem key={index} action>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {source.title}
                    <div>
                        {getEditButton(source)}
                        {getDeleteButton(source)}
                    </div>
                </div>
            </ListGroupItem>)}
        </ListGroup>
    }

    const runSourceFilter = (source: ISource): boolean => {
        return source.title.toLowerCase()
            .indexOf(searchName.toLocaleLowerCase()) !== -1
    }

    return <div>
        <ModalHeader>Sources</ModalHeader>
        <ModalBody>
            <Row>
                <Col>
                    <FormGroup>
                        <Input placeholder='Search...'
                            value={searchName}
                            onChange={event => setSearchName(event.target.value)}></Input>
                    </FormGroup>
                </Col>
            </Row>
            <Row>
                <Col>
                    <FormGroup>
                        {getList()}
                    </FormGroup>
                </Col>
            </Row>
        </ModalBody>
        <ModalFooter>
            <Button color='primary'
                onClick={() => props.onDone()}>
                Done
            </Button>
        </ModalFooter>
    </div>
}
