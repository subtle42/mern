import * as React from 'react'
import NavItem from 'reactstrap/lib/NavItem'
import NavLink from 'reactstrap/lib/NavLink'
import Nav from 'reactstrap/lib/Nav'

import { DeletePageButton } from '../page/delete'
import { connect } from 'react-redux'
import pageActions from 'data/pages/actions'
import { IPage, IUser } from 'common/models'
import { PageConfigButton } from '../page/config'
import { EditBookButton } from '../book/edit'
import { WidgetCreateButton } from '../widget/create'
import { EditSourceButton } from '../source/edit'
import { PageContent } from '../page/content'
import { CreatePageButton } from '../page/create'
import { StoreModel } from 'data/store'
import { Redirect } from 'react-router'

interface Props {
    pages: IPage[],
    selected: string,
    user: IUser
}

const Content: React.FunctionComponent<Props> = (props: Props) => {
    if (!props.user) {
        return <Redirect to='/about'/>
    }

    // Select first page if selected page does NOT exist
    if (props.pages.length > 0
        && !props.pages.find(page => page._id === props.selected)) {
        pageActions.select(props.pages[0]._id)
    }

    const isSelected = (page: IPage): boolean => {
        if (!props.selected) return false
        return props.selected === page._id
    }

    const getRemoveButton = (page: IPage): JSX.Element => {
        if (props.pages.length === 1) return
        return <DeletePageButton pageName={page.name} _id={page._id} />
    }

    const buildTabs = (): JSX.Element[] => {
        if (!props.pages) return []

        return props.pages.map((page, index) => {
            return <NavItem key={index}
                style={{ cursor: 'pointer' }}
                onClick={() => pageActions.select(page._id) }>
                <NavLink active={isSelected(page)}
                    style={{ padding: 8 }}>
                    {page.name}
                    {getRemoveButton(page)}
                </NavLink>
            </NavItem>
        })
    }

    return <div>
        <PageConfigButton _id={props.selected || null} />
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

export default connect((store: StoreModel): Props => {
    return {
        user: store.auth.me,
        pages: store.pages.list,
        selected: store.pages.selected
    }
})(Content)
