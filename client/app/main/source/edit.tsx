import * as React from 'react'
import * as FontAwesome from 'react-fontawesome'
import Modal from 'reactstrap/lib/Modal'
import SwipeableViews from 'react-swipeable-views'
import { SourceList } from './edit/list'
import { ISource } from 'common/models'
import { SourceDetails } from './edit/sourceDetails'

interface Props {}

export const EditSourceButton: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [source, setSource] = React.useState(undefined as ISource)

    const getSourceDetails = (): JSX.Element => {
        if (!source) return <div />
        return <SourceDetails
            source={source}
            onDone={() => setSource(undefined)} />
    }

    const getContent = (): JSX.Element => {
        const index = !source ? 0 : 1

        return <SwipeableViews index={index}>
            <SourceList
                onEdit={toEdit => setSource(toEdit)}
                onDone={() => setOpen(false)}/>
            {getSourceDetails()}
        </SwipeableViews>
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
