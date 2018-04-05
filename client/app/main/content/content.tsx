import * as React from "react";
import {Nav, NavItem, Button} from "reactstrap";
import {CreatePageButton} from "../page/create"
import {DeletePageButton} from "../page/delete";
import {connect} from "react-redux"
import pageActions from "../../../data/pages/actions";
import {IPage} from "myModels";
import {PageConfigButton} from "../page/config";
import {SourceConfigButton} from "../source/config";
import {SourceCreateButton} from "../source/create";
import {Widget} from "../widget/widget";
import {PageContent} from "../page/content"


interface Props {
    pages:IPage[],
    selected:IPage
}

const Content:React.StatelessComponent<Props> = (props:Props) => {
    const isSelected = (page:IPage):boolean => {
        if (!props.selected) return false;
        return props.selected._id === page._id;
    }

    const buildTabs = ():JSX.Element[] => {
        if (!props.pages) return [];

        return props.pages.map((page, index) => {
            return <NavItem
                onClick={() => pageActions.select(page) }
                active={isSelected(page)}
                key={index}>
                    {page.name}
                <DeletePageButton pageName={page.name} _id={page._id} />
            </NavItem>
        });
    }

    return (
        <div>
        <PageConfigButton _id={props.selected ? props.selected._id : null} />
        <SourceConfigButton className="pull-right" />
        <SourceCreateButton />
        <Nav tabs>
            {buildTabs()}
            <CreatePageButton />
        </Nav>
        <PageContent />
        {/* <Widget  /> */}
        </div>
    );
}

export const MainConent = connect((store:any) => {
    return {
        pages: store.pages.list,
        selected: store.pages.selected
    }
})(Content)