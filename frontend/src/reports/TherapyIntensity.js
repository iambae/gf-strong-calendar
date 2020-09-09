import React, { Component } from "react";
import { Button, Row, Table } from "react-bootstrap";
import "../css/Global.css";
// import printUtility from "../_helpers/printUtility";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

class TherapyIntensity extends Component {
	state = {
	    selectedPatient: this.props.selectedPatient,
	    table: null,
	    // printButton: null,
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
	//                 title:
	// 					"Patient Therapy Intensity - " +
	// 					this.state.selectedPatient.label,
	//                 ref: this.printRef,
	//             })}>
	// 			Print Report
	//         </Button>
	//     );
	// }

	convertDataToResult = data => {
	    return data;
	}

	// Rounds number to 2 decimal places, if needed
	roundNum = num => {
	    return Math.round((num + 0.00001) * 100) / 100;
	}

	getTable = rawData => {
	    const result = this.convertDataToResult(rawData);

	    // create table
	    return (
	        <Table striped bordered hover responsive="lg" variant="light" id="patient-therapy-report">
	            <thead>
	                <tr>
	                    <th>Record ID</th>
	                    <th>Category</th>
	                    <th>Admission</th>
	                    <th>Discharge</th>
	                    <th>Total OT</th>
	                    <th>Total Speech</th>
	                    <th>Total REC</th>
	                    <th>Total Hours</th>
	                    <th>Average OT</th>
	                    <th>Average Speech</th>
	                    <th>Average REC</th>
	                    <th>Average Hours</th>
	                </tr>
	            </thead>
	            <tbody>
	                {result.patient_records.map((row, index) => {
	                    return (
	                        <tr key={index}>
	                            <td>{row.record_id}</td>
	                            <td>{row.category}</td>
	                            <td>{row.admission_date}</td>
	                            <td>{row.discharge_date}</td>
	                            <td>{this.roundNum(row.total_ot_hours)}</td>
	                            <td>{this.roundNum(row.total_speech_hours)}</td>
	                            <td>{this.roundNum(row.total_rec_hours)}</td>
	                            <td>{this.roundNum(row.total_hours)}</td>
	                            <td>{this.roundNum(row.average_ot_hours)}</td>
	                            <td>{this.roundNum(row.average_speech_hours)}</td>
	                            <td>{this.roundNum(row.average_rec_hours)}</td>
	                            <td>{this.roundNum(row.average_total_hours)}</td>
	                        </tr>
	                    );
	                })}
	                {result.total ? (
	                    <tr>
	                        <td colSpan={4}>Total</td>
	                        <td>{this.roundNum(result.total.total_ot_hours)}</td>
	                        <td>{this.roundNum(result.total.total_speech_hours)}</td>
	                        <td>{this.roundNum(result.total.total_rec_hours)}</td>
	                        <td>{this.roundNum(result.total.total_hours)}</td>
	                        <td>{this.roundNum(result.total.average_ot_hours)}</td>
	                        <td>{this.roundNum(result.total.average_speech_hours)}</td>
	                        <td>{this.roundNum(result.total.average_rec_hours)}</td>
	                        <td>{this.roundNum(result.total.average_total_hours)}</td>
	                    </tr>
	                ) : null}
	            </tbody>
	        </Table>
	    );
	}

	// _printUtil = ({ title, ref }) => {
	//     return printUtility(title, ref, 0.4);
	// }

	render() {
	    return (
	        <React.Fragment>
	            <div>
	                <div className="report-header">
	                    <h4>
	                        {"Patient Therapy Intensity - " +
								this.state.selectedPatient.label}
	                    </h4>
	                </div>
	            </div>
	            <Row>
	                {" "}
	                <div className="report-table" />{" "}
	            </Row>
	            <div className="report-table-container">
	                <div /* ref={this.printRef} */> {this.state.table} </div>
	            </div>
	            <div className="inner-row-btn">
	                <div className="inner-row-col">
	                    <ReactHTMLTableToExcel
	                        id="test-table-xls-button"
	                        className="btn btn-primary btn-md"
	                        table="patient-therapy-report"
	                        filename={"Patient Therapy Intensity - " + this.state.selectedPatient.label}
	                        sheet="report"
	                        buttonText="Export as Excel" />
	                </div>
	            </div>
	        </React.Fragment>
	    );
	}
}

export default TherapyIntensity;
