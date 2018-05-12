import * as React from "react";
import {IWidget} from "common/models";
import * as d3 from "d3";
import "./style.css"

interface Props {
    _id?:any;
}

class State {}

export class Histogram extends React.Component<{}, State> {
    node;

    componentDidMount() {
        setTimeout(() => this.drawChart(), 0);
    }

    drawChart() {
        const data = d3.range(1000).map(d3.randomBates(10));
        const formatCount = d3.format(",.0f");
        let svg = d3.select(this.node);
        
        console.log("offsetHeight", this.node.height);
        let margin = {top:10, right:10, left:10, bottom:10};
        // let width = (svg.attr("width") as any ) - margin.left - margin.right,
        let width = this.node.parentElement.offsetWidth - margin.left - margin.right,
        // height = (svg.attr("height") as any ) - margin.top - margin.bottom,
        height = this.node.parentElement.offsetHeight - margin.top - margin.bottom -30*2,
        g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
        const xScale = d3.scaleLinear()
            .rangeRound([0, width]);
    
        const bins = d3.histogram()
            .domain(xScale.domain() as any)
            .thresholds(xScale.ticks(20))
            (data);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(bins, function(d) { return d.length; })])
            .range([height, 0]);
    
        let bar = g.selectAll(".bar")
            .data(bins)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", d => `translate(${xScale(d.x0)}, ${yScale(d.length)})`);
    
        bar.append("rect")
            .attr("x", 1)
            .attr("width", xScale(bins[0].x1) - xScale(bins[0].x0) - 1)
            .attr("height", d => height - yScale(d.length));
    
        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", (xScale(bins[0].x1 - xScale(bins[0].x0)))/2)
            .attr("text-anchor", "middle")
            .text(d => formatCount(d.length));
    
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale))
    }

    render() {
        return <svg ref={node => this.node = node} style={{height:"100%", width: "100%"}}></svg>
    }
}