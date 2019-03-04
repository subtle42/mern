import * as React from 'react'
import { Nav, NavItem, NavLink } from 'reactstrap'
import { DeletePageButton } from '../page/delete'
import { connect } from 'react-redux'
import pageActions from 'data/pages/actions'
import { IPage } from 'common/models'
import { PageConfigButton } from '../page/config'
import { SourceCreateButton } from '../source/modal'
import { PageContent } from '../page/content'
import { StoreModel } from 'data/store'
import { Loading } from '../../_common/loading'

import * as Loadable from 'react-loadable'

interface Props {
    pages: IPage[],
    selected: string
}

const Content: React.StatelessComponent<Props> = (props: Props) => {
    const isSelected = (page: IPage): boolean => {
        if (!props.selected) return false
        return props.selected === page._id
    }

    const CreatePageButton = Loadable({
        loader: () => import('../page/create').then(mod => mod.CreatePageButton),
        loading () {
            return <Loading/>
        }
    })

    const buildTabs = (): JSX.Element[] => {
        if (!props.pages) return []

        return props.pages.map((page, index) => {
            return <NavItem key={index}
                onClick={() => pageActions.select(page._id) }>
                <NavLink active={isSelected(page)}>
                    {page.name}
                    <DeletePageButton pageName={page.name} _id={page._id} />
                </NavLink>
            </NavItem>
        })
    }

    return (
        <div>
        <PageConfigButton _id={props.selected || null} />
        <SourceCreateButton />
        <Nav tabs>
            {buildTabs()}
            <CreatePageButton />
        </Nav>
        <PageContent />
        {/* <Widget  /> */}
        </div>
    )
}

export default connect((store: StoreModel): Props => {
    return {
        pages: store.pages.list,
        selected: store.pages.selected
    }
})(Content)
