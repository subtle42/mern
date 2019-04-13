import * as React from 'react'
import { Modal } from 'reactstrap'
import widgetActions from 'data/widgets/actions'
import NotifActions from 'data/notifications/actions'
import { ISource } from 'common/models'
import { usePages } from '../../_common/hooks'
import { SelectSource } from './create/selectSource'
import { SelectChartType } from './create/selectType'
import * as FontAwesome from 'react-fontawesome'
import './style.css'

interface Props {}

export const WidgetCreateButton: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [source, setSource] = React.useState(undefined as ISource)
    const [mode, setMode] = React.useState('selectSource')
    const pages = usePages()

    const close = (chartTypes: string[]) => {
        widgetActions.createMultiple(source._id, chartTypes)
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
            cancel={() => setOpen(false)} />
        }

        if (mode === 'selectWidget') {
            return <SelectChartType
            sourceId={source._id}
            back={() => setMode('selectSource')}
            cancel={() => setOpen(false)}
            done={chartTypes => close(chartTypes)} />
        }

        return <div/>
    }

    return <div>
        <div hidden={pages.length === 0} className='fixed-plugin-left' onClick={open}>
            <FontAwesome style={{ paddingTop: 6 }} size='2x' name='plus' />
        </div>
        <Modal size='lg' isOpen={isOpen}>
            {getModalTemplate()}
        </Modal>
    </div>
}
