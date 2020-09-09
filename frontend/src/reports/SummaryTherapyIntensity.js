import React, { Component } from "react";
import { Button, Table } from "react-bootstrap";
import "../css/Global.css";
import "./SupportPersonnel.css";
import "react-datepicker/dist/react-datepicker.css";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
// import printUtility from "../_helpers/printUtility";

class SummaryTherapyIntensity extends Component {
	state = {
	    // printButton: null,
	    table: null,
	    data: this.props.data,
	}

	// printRef = React.createRef()

	componentDidMount = () => {
	    if (this.props.data) {
	        const tableReport = this.getTable(this.props.data);
	        // const printBtn = this.getPrintBtn();
	        this.setState({ table: tableReport /*, printButton: printBtn */ });
	    }
	}

	// getPrintBtn = () => {
	//     return (
	//         <Button
	//             onClick={this._printUtil.bind(this, {
	//                 title: "Therapy Intensity Summary",
	//                 ref: this.printRef,
	//             })}>
	// 			Print Report
	//         </Button>
	//     );
	// }

	convertDataToResult = data => {
	    return data;
	}

	getTable = rawData => {
	    const result = this.convertDataToResult(rawData);

	    // create table
	    return (
	        <Table striped bordered hover variant="light" id="summary-therapy-intensity-report">	            
	            <thead>
	                <tr>
	                    <th rowSpan={2}>Category</th>
	                    <th colSpan={2}>PT</th>
	                    <th colSpan={2}>PT RA</th>
	                    <th colSpan={2}>OT</th>
	                    <th colSpan={2}>OT RA</th>
	                    <th colSpan={2}>SLP</th>
	                    <th colSpan={2}>SLPA</th>
	                    <th colSpan={2}>Total Therapy</th>
	                </tr>
	                <tr>
	                    <th>Median min</th>
	                    <th>Average min</th>
	                    <th>Median min</th>
	                    <th>Average min</th>
	                    <th>Median min</th>
	                    <th>Average min</th>
	                    <th>Median min</th>
	                    <th>Average min</th>
	                    <th>Median min</th>
	                    <th>Average min</th>
	                    <th>Median min</th>
	                    <th>Average min</th>
	                    <th>Median min</th>
	                    <th>Average min</th>
	                </tr>
	            </thead>
	            <tbody>
	                {result.categories.map((row, index) => {
	                    return (
	                        <tr key={index}>
	                            <td>{"Category" + (index + 1)}</td>
	                            <td>
	                                {Math.round(row.intensity.PT.median_min)}
	                            </td>
	                            <td>
	                                {Math.round(row.intensity.PT.average_min)}
	                            </td>
	                            <td>
	                                {Math.round(
	                                    row.intensity["PT RA"].median_min
	                                )}
	                            </td>
	                            <td>
	                                {Math.round(
	                                    row.intensity["PT RA"].average_min
	                                )}
	                            </td>
	                            <td>
	                                {Math.round(row.intensity.OT.median_min)}
	                            </td>
	                            <td>
	                                {Math.round(row.intensity.OT.average_min)}
	                            </td>
	                            <td>
	                                {Math.round(
	                                    row.intensity["OT RA"].median_min
	                                )}
	                            </td>
	                            <td>
	                                {Math.round(
	                                    row.intensity["OT RA"].average_min
	                                )}
	                            </td>
	                            <td>
	                                {Math.round(row.intensity.SLP.median_min)}
	                            </td>
	                            <td>
	                                {Math.round(row.intensity.SLP.average_min)}
	                            </td>
	                            <td>
	                                {Math.round(row.intensity.SLPA.median_min)}
	                            </td>
	                            <td>
	                                {Math.round(row.intensity.SLPA.average_min)}
	                            </td>
	                            <td>
	                                {Math.round(row.total_intensity.median_min)}
	                            </td>
	                            <td>
	                                {Math.round(
	                                    row.total_intensity.average_min
	                                )}
	                            </td>
	                        </tr>
	                    );
	                })}
	            </tbody>
	        </Table>
	    );
	}

	// _printUtil = ({ title, ref }) => {
	//     return printUtility(title, ref);
	// }

	render() {
	    return (
	        <React.Fragment>
	            <div>
	                <div className="report-header">
	                    <h4>Therapy Intensity Summary</h4>
	                </div>
	            </div>
	            <div className="report-table-container">
	                <div /* ref={this.printRef} */> {this.state.table} </div>
	            </div>
	            { <div className="inner-row-btn">
	                <div className="inner-row-col">
	                    <ReactHTMLTableToExcel
	                        id="test-table-xls-button"
	                        className="btn btn-primary btn-md"
	                        table="summary-therapy-intensity-report"
	                        filename="Therapy Intensity Summary"
	                        sheet="report"
	                        buttonText="Export as Excel" />
	                </div>
	            </div> }
	        </React.Fragment>
	    );
	}
}

export default SummaryTherapyIntensity;
