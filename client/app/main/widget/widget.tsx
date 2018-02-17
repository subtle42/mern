import * as React from "react";
import * as ReactGridLayout from "react-grid-layout";
import { WidthProvider, Responsive } from "react-grid-layout";
import { Z_FIXED } from "zlib";

export class Widget extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    rowHeight: 100
  }
  state

  constructor(props) {
    super(props)

    this.state = {
      items: [0, 1, 2, 3, 4].map((i, key, list) => {
        return {
          i: i.toString(),
          x: i * 2,
          y: 0,
          w: 2,
          h: 2,
          add: i === (list.length - 1)
        };
      }),
      newCounter: 0
    };

    this.onAddItem = this.onAddItem.bind(this);
    this.onBreakpointChange = this.onBreakpointChange.bind(this)
  }


  onAddItem() {
    console.log("adding", "n" + this.state.newCounter);
    let newState = {
      items: this.state.items.concat({
        i: "n" + this.state.newCounter,
        x: (this.state.items.length * 2) % (this.state.cols || 12),
        y: Infinity, // puts it at the bottom
        w: 2,
        h: 2
      }),
      // Increment the counter to ensure key is always unique.
      newCounter: this.state.newCounter + 1
    }
    this.setState(newState);
  }

  // We're using the cols coming back from this to calculate where to add new items.
  onBreakpointChange(breakpoint, cols) {
    this.setState({
      breakpoint: breakpoint,
      cols: cols
    });
  }

  onRemoveItem(i) {
    console.log("removing", i);
    this.setState({
      items: this.state.items.filter((item) => { item.i != i })
    })
  }

  render() {
    var layout = [
      { i: 'a', x: 0, y: 0, w: 1, h: 2, static: true },
      { i: 'b', x: 1, y: 0, w: 3, h: 2, maxW: 5, maxH: 4 },
      { i: 'c', x: 4, y: 0, w: 1, h: 2, },
    ]
    return (
      <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200} style={{position: 'fixed'}}>
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