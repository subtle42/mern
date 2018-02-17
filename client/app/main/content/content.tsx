import * as React from "react";
import {Nav, NavItem, Button} from "react-bootstrap";
import {CreatePageButton} from "../page/create/create"
import {DeletePageButton} from "../page/delete/delete";
import {connect} from "react-redux"
import pageActions from "../../../data/pages/actions";
import {IPage} from "myModels";
import {PageConfigButton} from "../page/config";
import {SourceConfigButton} from "../source/config";
import {SourceCreateButton} from "../source/create";
import {Widget} from "../widget/widget";



interface TestProps {
    pages:IPage[],
    selected:IPage
}

const Content:React.StatelessComponent<TestProps> = (props:TestProps) => {
    const isSelected = (page:IPage):boolean => {
        return props.selected === page;
    }

    return (
        <div>
        <PageConfigButton _id={props.selected ? props.selected._id : null} />
        <SourceConfigButton className="pull-right" />
        <SourceCreateButton />
        <Nav activeKey="1" bsStyle="tabs">
            {props.pages.map((page, index) => {
                return <NavItem
                    onClick={() => pageActions.select(page) }
                    active={isSelected(page)}
                    key={index}>
                        {page.name}
                    <DeletePageButton pageName={page.name} _id={page._id} />
                </NavItem>
            })}
            <CreatePageButton />
        </Nav>
        <Widget  />
        </div>
    );
}

export const MainConent = connect((store:any) => {
    return {
        pages: store.pages.list,
        selected: store.pages.selected
    }
})(Content)