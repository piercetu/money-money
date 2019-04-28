import React, { Component } from 'react';
import { 
    Button, Icon, Grid 
} from 'semantic-ui-react';
import * as d3 from 'd3';
import axios from 'axios';

import './style/Home.css';
// import './resources/stock.jpg'

import { connect } from 'react-redux';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ticker: ''
        };
    }

    handleChange = e => {
        let { name, value } = e.target;
        this.setState({ [name]: String(value).trim().toUpperCase() });
    }

    handleSubmit = () => {
        let { ticker } = this.state;

        axios.post('https://gainful-app.herokuapp.com/lasso/predict/', { ticker })
            .then(res => {
                if (res.data.success) {
                    let { data } = res.data;
                    let keys = Object(res.data.data).keys;
                    let dataArr = [];
                    let lastValue = 0;

                    Object.keys(data).map((v,i) => {
                        let date = new Date(v);
                        let value = data[v];

                        if (date.getDay() !== 0 && date.getDay() !== 6)
                            dataArr.push({
                                date, value
                            });
                    });

                    this.drawChart(dataArr);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    drawChart = data => {
        var svgWidth = 600, svgHeight = 400;
        var margin = { top: 20, right: 20, bottom: 30, left: 50 };
        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        var svg = d3.select('svg');

        svg.selectAll("*").remove();
        svg.attr("width", svgWidth)
        svg.attr("height", svgHeight);

        var g = svg.append("g")
                    .attr("transform", 
                    "translate(" + margin.left + "," + margin.top + ")"
                    );
        
        var x = d3.scaleTime().rangeRound([0, width]);
        var y = d3.scaleLinear().rangeRound([height, 0]);
        
        var line = d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.value))
                    x.domain(d3.extent(data, d => d.date ));
                    y.domain(d3.extent(data, d => d.value ));
        
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .select(".domain")
            .remove();
        
        g.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Price ($)");
        
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "orange")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    }

    render() {
        return (
            <React.Fragment>
                <Grid columns={1} className="center aligned">
                {/* <div name="bg"><img src={require("./resources/stock.jpg")} alt='' /></div> */}
                    <Grid.Row style={{ position: 'absolute', top: 0, left: 0 }}>
                        <Grid.Column>
                            <div class="ui input"><input type="text" name="ticker" value={this.state.ticker} onChange={this.handleChange} placeholder="Enter Ticker Symbol"/></div>
                            <Button animated onClick={this.handleSubmit}>
                                <Button.Content visible>Predict</Button.Content>
                                <Button.Content hidden>
                                    <Icon name='random' />
                                </Button.Content>
                            </Button>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <div class="graph"><svg style={{ border: '1px solid white' }} /></div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </React.Fragment>
        );
    }
}

export default connect(null,null)(Home);