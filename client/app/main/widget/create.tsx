import * as React from 'react'
import { Modal } from 'reactstrap'
import { usePages } from '../../_common/hooks'
import { SelectSource } from './create/selectSource'
import { SelectChartType } from './create/selectType'
import FontAwesome from 'react-fontawesome'
import SwipeableViews from 'react-swipeable-views'
import './style.css'
import { ISource } from '@mern/server/api/source/model'
import { myNotifActions } from '../../../data/notifications/actions'
import { createManyWidgets } from '../../../data/widgets/actions'

interface Props {}

export const WidgetCreateButton: React.FunctionComponent<Props> = (props: Props) => {
    const [isOpen, setOpen] = React.useState(false)
    const [source, setSource] = React.useState<ISource|undefined>(undefined)
    const [mode, setMode] = React.useState('selectSource')
    const pages = usePages()

    const close = (chartTypes: string[]) => {
        createManyWidgets(source?._id, chartTypes)
        .then(() => myNotifActions.success('Created widget'))
        .then(() => setOpen(false))
        .catch(err => myNotifActions.error(err.message))
    }

    const open = () => {
        setSource(undefined)
        setOpen(true)
        setMode('selectSource')
    }

    const getIndex = (): number => {
        if (mode === 'selectSource') return 0
        if (mode === 'selectWidget') return 1
        return 0
    }

    const getSelectChartType = (): JSX.Element => {
        if (!source) return <div />
        return <SelectChartType
            sourceId={source._id}
            back={() => setMode('selectSource')}
            cancel={() => setOpen(false)}
            done={chartTypes => close(chartTypes)} />
    }

    const getModalTemplate = (): JSX.Element => {
        return <SwipeableViews index={getIndex()}>
            <SelectSource
                selectedId={source && source._id}
                done={confirmed => {
                    setSource(confirmed)
                    setMode('selectWidget')
                }}
                cancel={() => setOpen(false)} />
            {getSelectChartType()}
        </SwipeableViews>
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
