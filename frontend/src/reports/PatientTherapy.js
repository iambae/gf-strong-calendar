import React, { Component } from "react";
import "../css/Global.css";
import "./SupportPersonnel.css";
import { Row } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";

import CanvasJSReact from "../assets/canvasjs.react";
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class PatientTherapy extends Component {
	state = {
	    selectedPatient: this.props.selectedPatient,
	    table: null,
	    data: this.props.data,
	}

	componentDidMount = () => {
	    if (this.props.data) {
	        const tableReport = this.getTable(this.props.data); // histogram in this case
	        this.setState({ table: tableReport });
	    }
	}

	extractAverageDataPoints = data => {
	    let dataPoints = [];
	    data.therapies.map(therapy => {
	        dataPoints.push({
	            label: therapy.type,
	            y: Math.round(therapy.average_minutes),
	        });
	    });
	    return dataPoints;
	}

	extractTotalDataPoints = data => {
	    let dataPoints = [];
	    data.therapies.map(therapy => {
	        dataPoints.push({
	            label: therapy.type,
	            y: therapy.total_minutes,
	        });
	    });
	    return dataPoints;
	}

	convertDataToResult = data => {
	    return data;
	}

	getTable = rawData => {
	    const result = this.convertDataToResult(rawData);

	    // create histogram
	    const options = {
	        animationEnabled: true,
	        exportEnabled: true,
	        backgroundColor: "transparent",
	        colorSet: "colorSet1",
	        axisX: {
	            title: "Therapy Type",
	            includeZero: true,
	        },
	        axisY: {
	            title: "Minutes",
	            includeZero: true,
	        },
	        toolTip: {
	            shared: true,
	            reversed: true,
	        },
	        legend: {
	            verticalAlign: "center",
	            horizontalAlign: "right",
	            reversed: true,
	            cursor: "pointer",
	            itemclick: this.toggleDataSeries,
	        },
	        data: [
	            {
	                type: "stackedColumn",
	                name: "Average",
	                showInLegend: true,
	                yValueFormatString: "0 mins",
	                dataPoints: this.extractAverageDataPoints(result),
	            },
	            {
	                type: "stackedColumn",
	                name: "Total",
	                showInLegend: true,
	                yValueFormatString: "0 mins",
	                dataPoints: this.extractTotalDataPoints(result),
	            },
	        ],
	    };
	    return (
	        <div>
	            <CanvasJSChart
	                options={options}
	                onRef={ref => (this.chart = ref)}
	            />
	        </div>
	    );
	}

	render() {
	    return (
	        <React.Fragment>
	            <div>
	                <div className="report-header">
	                    <h4>
	                        {"Patient Therapy Histogram - " +
								this.state.selectedPatient.label}
	                    </h4>
	                </div>
	            </div>
	            <Row>
	                {" "}
	                <div className="report-table" />{" "}
	            </Row>
	            <div className="report-table-container">{this.state.table}</div>
	        </React.Fragment>
	    );
	}
}

export default PatientTherapy;
