import * as React from "react";
import * as ReactGridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import {connect} from "react-redux";
import {IPage, IWidget} from "myModels";
import {Widget} from "../widget/widget";
import {extend} from "lodash";
import PageActions from "../../../data/pages/actions";

interface Props {
    page:IPage;
}

const ContentComponent:React.StatelessComponent<Props> = (props:Props) => {
    const defaultLayoutConfig = {
        // draggableHandle: "panel-title"
        onLayoutChange: (layout:ReactGridLayout.Layout[]) => {
            PageActions.update(extend({}, props.page, {layout}));
        }
    };
    const asdf = extend({}, defaultLayoutConfig, props.page)

    const buildGrid = ():JSX.Element => {
        if (!props.page) return <div />

        return (
            <ReactGridLayout className="layout" width={1200} {...asdf} style={{position: 'fixed'}}>
                {props.page.layout.map((layoutItem) => {
                    return <div style={{backgroundColor:"red"}} key={layoutItem.i} >hello</div>
                })}
            </ReactGridLayout>
        );
    }

    return buildGrid();
};


export const PageContent = connect((store:any) => {
    return {
        // Need to serve back the page from the list because it is the one that gets updated
        page: store.pages.selected ? store.pages.list.filter(x => x._id === store.pages.selected._id)[0] : undefined,
    }
})(ContentComponent);