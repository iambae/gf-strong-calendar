import React, { Component } from "react";
import { Button, Row, Table } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Global.css";
import "./SupportPersonnel.css";
import printUtility from "../_helpers/printUtility";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

class LengthStay extends Component {
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
	//                 title: "Length of Stay Summary",
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
	        <Table striped bordered hover variant="light" id="length-report">
	            <thead>
	                <tr>
	                    <th>Category</th>
	                    <th>Total</th>
	                    <th>Median</th>
	                    <th>Average</th>
	                </tr>
	            </thead>
	            <tbody>
	                {result.categories.map((row, index) => {
	                    return (
	                        <tr key={index}>
	                            <td>{"Category" + (index + 1)}</td>
	                            <td>{row.total}</td>
	                            <td>{Math.round(row.median)}</td>
	                            <td>{Math.round(row.average)}</td>
	                        </tr>
	                    );
	                })}
	            </tbody>
	        </Table>
	    );
	}

	_printUtil = ({ title, ref }) => {
	    return printUtility(title, ref);
	}

	render() {
	    return (
	        <React.Fragment>
	            <div>
	                <div className="report-header">
	                    <h4>Length of Stay Summary</h4>
	                </div>
	            </div>
	            <div className="report-table-container">
	                <div /*ref={this.printRef}*/> {this.state.table} </div>
	            </div>
	            <Row className="inner-row-btn">
	                <div className="inner-row-col">
	                    <ReactHTMLTableToExcel
	                        id="test-table-xls-button"
	                        className="btn btn-primary btn-md"
	                        table="length-report"
	                        filename="Length of Stay Summary"
	                        sheet="report"
	                        buttonText="Export as Excel" />
	                </div>
	            </Row>
	        </React.Fragment>
	    );
	}
}

export default LengthStay;
