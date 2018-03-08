import * as React from "react";
import * as ReactGridLayout from "react-grid-layout";
import {connect} from "react-redux";
import {IPage, IWidget} from "myModels";
import {Widget} from "../widget/widget";

interface Props {
    page:IPage;
}

const ContentComponent:React.StatelessComponent<Props> = (props:Props) => {
    var layout = [
        { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
        { i: 'b', x: 1, y: 0, w: 3, h: 2, maxW: 5, maxH: 4 },
        { i: 'c', x: 4, y: 0, w: 1, h: 2, },
    ]
    return (
        <ReactGridLayout className="layout" width={1200} {...props.page} style={{position: 'fixed'}}>
            {props.page.layout.map((asdf, index) => {
                return <Widget key={asdf._id} _id={asdf._id}  />
            })}
        </ReactGridLayout>
    )
};


export const PageContent = connect((store:any) => {
    return {
        page: store.pages.selected,
    }
})(ContentComponent);