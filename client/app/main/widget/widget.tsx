import * as React from "react";
import * as ReactGridLayout from "react-grid-layout";

export class Widget extends React.Component {
  render() {
    var layout = [
      {i: 'a', x: 0, y: 0, w: 1, h:2, static: true},
      {i: 'b', x: 1, y: 0, w: 3, h:2, maxW: 5, maxH: 4},
      {i: 'c', x: 4, y: 0, w: 1, h:2,},
    ]
    return (
      <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
        <div key="a" style={style} >a</div>
        <div key="b" style={style} >b</div>
        <div key="c" style={style} >c</div>
      </ReactGridLayout>
    )
  }
}

const style = {
  backgroundColor: 'red'
}