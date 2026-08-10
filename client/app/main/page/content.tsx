import 'react-grid-layout/css/styles.css'

import * as React from 'react'
import ReactGridLayout from 'react-grid-layout'
import {Widget} from '../widget/widget'
import { usePage } from '../../_common/hooks'
import { store } from '../../../data/store'
import { updatePage } from '../../../data/pages/actions'
import { setWidgetSize } from '../../../data/widgets/actions'

interface Props {}

const useWindowWidth = (): number => {
    const [width, setWidth] = React.useState(window.innerWidth)

    React.useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    })

    return width
}

export const PageContent: React.FunctionComponent<Props> = (props: Props) => {
    const page = usePage(store.getState().pages.selected || '')
    const width = useWindowWidth()

    // Not using the onLayoutChange due to it trigger on layout load
    const defaultLayoutConfig = {
        draggableHandle: '.card-title',
        onDragStop: (layout: ReactGridLayout.Layout[]) => {
            updatePage(Object.assign({}, page, { layout }))
        },
        onResizeStop: (layout: ReactGridLayout.Layout[],
            oldItem: ReactGridLayout.Layout,
            newItem: ReactGridLayout.Layout,
            placeholder: ReactGridLayout.Layout,
            event, element) => {
            setWidgetSize(oldItem.i, element.parentElement.offsetWidth, element.parentElement.offsetHeight - 81)
            updatePage(Object.assign({}, page, { layout }))
        },
        onResize: (layout: ReactGridLayout.Layout[],
            oldItem: ReactGridLayout.Layout,
            newItem: ReactGridLayout.Layout,
            placeholder: ReactGridLayout.Layout,
            event, element) => {
            setWidgetSize(oldItem.i, element.parentElement.offsetWidth, element.parentElement.offsetHeight - 81)
        }
    }

    // const ReactGridLayout = Loadable({
    //     loader: () => import('react-grid-layout'),
    // })

    // const Widget = Loadable({
    //     loader: () => import('../widget/widget')
    //         .then(mod => mod.Widget),
    // }) as any

    const asdf = Object.assign({}, defaultLayoutConfig, page) as any

    const buildGrid = (): JSX.Element => {
        if (!page) return <div />

        return <ReactGridLayout className='layout'
            width={width}
            {...asdf}>
            {page.layout.map((layoutItem) => {
                return <div
                    style={{ zIndex: 100 - layoutItem.y - layoutItem.x }}
                    key={layoutItem.i} >
                    <Widget _id={layoutItem.i} />
                </div>
            })}
        </ReactGridLayout>
    }

    return buildGrid()
}
