import React, { Component } from "react";
import { Button, Table } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Global.css";
import "./SupportPersonnel.css";
import printUtility from "../_helpers/printUtility";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

class SummaryPatient extends Component {
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
	        this.setState({ table: tableReport/* , printButton: printBtn */ });
	    }
	}

	// getPrintBtn = () => {
	//     return (
	//         <Button
	//             onClick={this._printUtil.bind(this, {
	//                 title: "Patient Summary",
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
	    let totalPatients = result.categories.reduce((acc, curr) => {
	        return acc + Number(curr.raw);
	    }, 0);

	    return (
	        <Table striped bordered hover variant="light" id="summary-patient-report">
	            <thead>
	                <tr>
	                    <th>Category</th>
	                    <th>Raw</th>
	                    <th>Percent</th>
	                </tr>
	            </thead>
	            <tbody>
	                {result.categories.map((row, index) => {
	                    return (
	                        <tr key={index}>
	                            <td>{"Category" + (index + 1)}</td>
	                            <td>{row.raw}</td>
	                            <td>{Math.round(row.percent)}</td>
	                        </tr>
	                    );
	                })}
	                {
	                    <tr key="total">
	                        <td>{"Total"}</td>
	                        <td>{totalPatients}</td>
	                        <td>{totalPatients === 0 ? "0" : "100"}</td>
	                    </tr>
	                }
	            </tbody>
	        </Table>
	    );
	}

	// _printUtil = ({ title, ref }) => {
	//     return printUtility(title, ref);
	// }

	componentWillUnmount() {
	    this.setState(() => ({
	        table: null,
	    }));
	}

	render() {
	    return (
	        <React.Fragment>
	            <div>
	                <div className="report-header">
	                    <h4>Patient Summary</h4>
	                </div>
	            </div>
	            <div className="report-table-container">
	                <div /*ref={this.printRef}*/> {this.state.table} </div>
	            </div>
	            <div className="inner-row-btn">
	                <div className="inner-row-col">
	                    <ReactHTMLTableToExcel
	                        id="test-table-xls-button"
	                        className="btn btn-primary btn-md"
	                        table="summary-patient-report"
	                        filename="Patient Summary"
	                        sheet="report"
	                        buttonText="Export as Excel" />
	                </div>
	            </div>
	        </React.Fragment>
	    );
	}
}

export default SummaryPatient;
