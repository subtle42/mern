import * as React from 'react'
// import * as ReactGridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { Widget } from '../widget/widget'
import PageActions from 'data/pages/actions'
import widgetActions from 'data/widgets/actions'
import * as Loadable from 'react-loadable'
import { Loading } from '../../_common/loading'
import { store } from 'data/store'
import { usePage } from '../../_common/hooks'

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
    const page = usePage(store.getState().pages.selected)
    const width = useWindowWidth()

    // Not using the onLayoutChange due to it trigger on layout load
    const defaultLayoutConfig = {
        draggableHandle: '.card-title',
        onDragStop: (layout: ReactGridLayout.Layout[]) => {
            PageActions.update(Object.assign({}, page, { layout }))
        },
        onResizeStop: (layout: ReactGridLayout.Layout[],
            oldItem: ReactGridLayout.Layout,
            newItem: ReactGridLayout.Layout,
            placeholder: ReactGridLayout.Layout,
            event, element) => {
            widgetActions.setSize(oldItem.i, element.parentElement.offsetWidth, element.parentElement.offsetHeight - 85)
            PageActions.update(Object.assign({}, page, { layout }))
        },
        onResize: (layout: ReactGridLayout.Layout[],
            oldItem: ReactGridLayout.Layout,
            newItem: ReactGridLayout.Layout,
            placeholder: ReactGridLayout.Layout,
            event, element) => {
            widgetActions.setSize(oldItem.i, element.parentElement.offsetWidth, element.parentElement.offsetHeight - 85)
        }
    }

    const ReactGridLayout = Loadable({
        loader: () => import('react-grid-layout'),
        loading () {
            return <Loading />
        }
    })

    const asdf = Object.assign({}, defaultLayoutConfig, page)

    const buildGrid = (): JSX.Element => {
        if (!page) return <div />

        return <ReactGridLayout className='layout'
            width={width}
            {...asdf}>
            {page.layout.map((layoutItem) => {
                return <div key={layoutItem.i} >
                    <Widget _id={layoutItem.i} />
                </div>
            })}
        </ReactGridLayout>
    }

    return buildGrid()
}
