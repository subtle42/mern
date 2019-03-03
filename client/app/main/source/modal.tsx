import * as React from 'react'
import { Modal } from 'reactstrap'
import widgetActions from 'data/widgets/actions'
import NotifActions from 'data/notifications/actions'
import { ISource } from 'common/models'
import { EditSourceContent } from './edit'
import { SelectSource } from './select'
import { SelectWidget } from '../widget/select'
import * as FontAwesome from 'react-fontawesome'
import './style.css'

interface Props {}

export const SourceCreateButton: React.StatelessComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [source, setSource] = React.useState(undefined as ISource)
    const [mode, setMode] = React.useState('selectSource')

    const close = (chartType: string) => {
        widgetActions.create({
            source: source,
            type: chartType
        })
        .then(() => NotifActions.success('Created widget'))
        .then(() => setOpen(false))
        .catch(err => NotifActions.error(err.message))
    }

    const open = () => {
        setSource(undefined)
        setOpen(true)
        setMode('selectSource')
    }

    const getModalTemplate = (): JSX.Element => {
        if (mode === 'selectSource') {
            return <SelectSource
            selectedId={source && source._id}
            done={confirmed => {
                setSource(confirmed)
                setMode('selectWidget')
            }}
            editSource={source => {
                setSource(source)
                setMode('editSource')
            }}
            cancel={() => setOpen(false)} />
        }

        if (mode === 'editSource') {
            return <EditSourceContent
            _id={source._id}
            done={() => setMode('selectSource')} />
        }

        if (mode === 'selectWidget') {
            return <SelectWidget
            back={() => setMode('selectSource')}
            cancel={() => setOpen(false)}
            done={chartType => close(chartType)} />
        }

        return <div/>
    }

    return <div className='fixed-plugin-left' onClick={open}>
        <FontAwesome style={{ paddingTop: 6 }} size='2x' name='plus' />
        <Modal size='lg' isOpen={isOpen}>
            {getModalTemplate()}
        </Modal>
    </div>
}
