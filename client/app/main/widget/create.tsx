import * as React from "react";
import {Button, Row, Col} from "reactstrap";
import {ChartType, ColumnType} from "myConstants"
import WidgetActions from "../../../data/widgets/actions"
import * as FontAwesome from "react-fontawesome";

interface Props {
    sourceId?:any;
}

class State {
    selected:ChartConf;
}

class ChartConf {
    name:string;
    type:ChartType;
    requires:ChartConfReq[]
}

class ChartConfReq {
    count: number;
    colType:ColumnType
}

const chartConfList:ChartConf[] = [{
    name: "Histogram",
    type: "histogram",
    requires: [{
        count: 1,
        colType: "number"
    }]
}, {
    name: "Pie",
    type: "pie",
    requires: [{
        count: 1,
        colType: "number"
    }, {
        count: 1,
        colType: "group"
    }]
}]


export class CreateWidget extends React.Component<Props, State> {
    state = new State();
    rowSize = 4;
    

    done() {
        let config = {
            sourceId: this.props.sourceId,
            type: this.state.selected.type
        }
    }

    selectConfig(item) {
        this.setState({
            selected:item
        })
    }

    buildRows():JSX.Element[] {
        const availableCharts = chartConfList.filter(x => true);
        let rows:ChartConf[][] = [];
        let position = -1;
        availableCharts.forEach((item, index) => {
            if (index % this.rowSize === 0) {
                position++;
                rows[position] = [];
            }
            rows[position].push(item);
        });


        return rows.map(row => {
            return (<Row>
            {row.map(col => {
                return (<Col xs={12/this.rowSize}><Button
                    onClick={() => this.selectConfig(col)}
                    color={col === this.state.selected ? "primary": "warning"}
                    size="large">
                        <FontAwesome name="puzzle-piece" size="4x" /><br/>
                        {col.name}
                    </Button>
                </Col>)
            })}
            </Row>);
        });
    }

    render() {
        return (
            <div>{this.buildRows()}</div>
        );
    }
}