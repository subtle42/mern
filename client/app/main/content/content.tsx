import * as React from 'react'
import NavItem from 'reactstrap/lib/NavItem'
import NavLink from 'reactstrap/lib/NavLink'
import Nav from 'reactstrap/lib/Nav'

import { DeletePageButton } from '../page/delete'
import { PageConfigButton } from '../page/config'
import { EditBookButton } from '../book/edit'
import { WidgetCreateButton } from '../widget/create'
import { EditSourceButton } from '../source/edit'
import { PageContent } from '../page/content'
import { CreatePageButton } from '../page/create'
import { Redirect } from 'react-router'
import { IPage } from '@mern/server/api/page/model'
import { IUser } from '@mern/server/api/user/model'
import { usePages, useSelected, useUser } from '../../_common/hooks'
import { selectPage } from '../../../data/pages/actions'

// interface Props {
//     pages: IPage[],
//     selected: string,
//     user: IUser
// }

export const ContentComponent: React.FunctionComponent<void> = () => {
    const pages = usePages()
    const selected = useSelected('pages')
    const user = useUser()

    if (!user) {
        return <Redirect to='/about'/>
    }

    // Select first page if selected page does NOT exist
    if (pages.length > 0
        && !pages.find(page => page._id === selected)) {
        selectPage(pages[0]._id)
    }

    const isSelected = (page: IPage): boolean => {
        if (!selected) return false
        return selected === page._id
    }

    const getRemoveButton = (page: IPage): JSX.Element|undefined => {
        if (pages.length === 1) return
        return <DeletePageButton pageName={page.name} _id={page._id} />
    }

    const buildTabs = (): JSX.Element[] => {
        if (!pages) return []

        return pages.map((page, index) => {
            return <NavItem key={index}
                style={{ cursor: 'pointer' }}
                onClick={() => selectPage(page._id) }>
                <NavLink active={isSelected(page)}
                    style={{ padding: 8 }}>
                    {page.name}
                    {getRemoveButton(page)}
                </NavLink>
            </NavItem>
        })
    }

    return <div>
        <PageConfigButton _id={selected} />
        <EditSourceButton />
        <EditBookButton />
        <WidgetCreateButton />
        <Nav tabs>
            {buildTabs()}
            <CreatePageButton />
        </Nav>
        <PageContent />
    </div>
}

// export default connect((store: StoreModel): Props => {
//     return {
//         user: store.auth.me,
//         pages: store.pages.list,
//         selected: store.pages.selected
//     }
// })(Content)
