import 'react-grid-layout/css/styles.css'

import * as React from 'react'
import ReactGridLayout, { Layout, GridLayoutProps, useGridLayout, useContainerWidth } from 'react-grid-layout'
import { calcGridCellDimensions } from 'react-grid-layout/core'
import {Widget, WidgetFn} from '../widget/widget'
import { usePage } from '../../_common/hooks'
import { store } from '../../../data/store'
import { updatePage } from '../../../data/pages/actions'
import { queryWidget, setWidgetSize } from '../../../data/widgets/actions'

interface Props {}

export const PageContent: React.FunctionComponent<Props> = (props: Props) => {
    const page = usePage(store.getState().pages.selected || '')
    const { width, containerRef, mounted } = useContainerWidth();
    const {cellWidth, cellHeight} = calcGridCellDimensions({
        cols:4,
        rowHeight:150,
        width: width,
        margin: [10,10],
        containerPadding: [10, 10]
    })

    const buildGrid = (): JSX.Element => {
        if (!page) return <div />

        return <ReactGridLayout className='layout'
            {...page}
            gridConfig={{
                cols: 4,
                rowHeight: 150,
                margin: [10,10],
                containerPadding: [10, 10]
            }}
            width={width}
            dragConfig={{handle: '.card-title'}}
            onDragStop={(layout) => updatePage(Object.assign({}, page, { layout }))}
            onResizeStop={(layout, oldItem, newItem, placeholder, ev, element) => {
                if (!oldItem) throw Error('no old item')
                if (!element) throw Error('no element')
                setWidgetSize(oldItem.i, (cellWidth*newItem.w)-10, cellHeight*newItem.h-81)
                updatePage(Object.assign({}, page, { layout }))
            }}
            onResize={(layout, oldItem, newItem, placeholder, ev, element) => {
                if (!oldItem) throw Error('no old item')
                if (!element) throw Error('no element')
                setWidgetSize(oldItem.i, element.parentElement.offsetWidth-10, element.parentElement.offsetHeight - 91)
            }}
        >
            {page.layout.map((layoutItem) => {
                return <div
                    style={{ zIndex: 100 - layoutItem.y - layoutItem.x }}
                    key={layoutItem.i} >
                        {/* <WidgetFn _id={layoutItem.i} /> */}
                    <Widget _id={layoutItem.i} />
                </div>
            })}
        </ReactGridLayout>
    }

    return <div ref={containerRef}>
        {mounted && buildGrid()}
    </div>
}
