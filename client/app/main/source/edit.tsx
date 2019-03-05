import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import Modal from 'reactstrap/lib/Modal'
import { SourceList } from './edit/list'
import { ISource } from 'common/models'
import { SourceDetails } from './edit/sourceDetails'

interface Props {}

export const EditSourceButton: React.StatelessComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [source, setSource] = React.useState(undefined as ISource)

    const getContent = (): JSX.Element => {
        if (!source) {
            return <SourceList
            onEdit={toEdit => setSource(toEdit)}
            onDone={() => setOpen(false)}/>
        }
        if (source) {
            return <SourceDetails
            source={source}
            onDone={() => setSource(undefined)} />
        }
    }

    const getModal = (): JSX.Element => {
        return <Modal size='md'
            isOpen={isOpen}>
            {getContent()}
        </Modal>
    }

    return <div>
        <div className='fixed-plugin'
            style={{ top: 240 }}
            onClick={() => setOpen(true)}>
            <FontAwesome style={{ paddingTop: 6 }} size='2x' name='database' />
        </div>
        {getModal()}
    </div>
}
