import * as React from "react";
import * as ReactGridLayout from "react-grid-layout";
import {connect} from "react-redux";
import {IPage, IWidget} from "myModels";

interface Props {
    page:IPage;
    widgets:IWidget[]
}

const PageContent:React.StatelessComponent<Props> = (props:Props) => {
    var layout = [
        { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
        { i: 'b', x: 1, y: 0, w: 3, h: 2, maxW: 5, maxH: 4 },
        { i: 'c', x: 4, y: 0, w: 1, h: 2, },
    ]
    return (
        <ReactGridLayout className="layout" width={1200} {...props.page} style={{position: 'fixed'}}>
            {props.page.layout.map((widgetLayout, index) => {
                let widget = props.widgets.filter(w => w._id === widgetLayout._id)[0];
                return <div key={index}>{widget._id}</div>
            })}
            <div key="a">{this.getWidget()}</div>
            <div key="b">{this.getWidget()}</div>
            <div key="c">{this.getWidget()}</div>
        </ReactGridLayout>
    )
};


export default connect((store:any) => {
    return {
        page: store.pages.selected,
        widgets: store.widgets.list
    }
})(PageContent);