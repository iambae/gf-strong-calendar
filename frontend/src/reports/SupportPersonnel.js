import React, { Component } from "react";
import { Button, Row, Table } from "react-bootstrap";
import "./SupportPersonnel.css";
import "../css/Global.css";
import printUtility from "../_helpers/printUtility";
import ReactHTMLTableToExcel from "react-html-table-to-excel";

class SupportPersonnel extends Component {
    state = {
        selectedPatient: this.props.selectedPatient,
        table: null,
        // printButton: null,
        data: this.props.data,
    }

    printRef = React.createRef()

    componentDidMount = () => {
        if (this.props.data) {
            const tableReport = this.getTable(this.props.data);
            // const printBtn = this.getPrintBtn();
            this.setState({ table: tableReport /* , printButton: printBtn */ });
        }
    }

    // getPrintBtn = () => {
    //     return (
    //         <Button
    //             onClick={this._printUtil.bind(this, {
    //                 title:
    //                     "Support Personnel - " +
    //                     this.state.selectedPatient.label,
    //                 ref: this.printRef,
    //             })}>
    //             Print Report
    //         </Button>
    //     );
    // }

    convertDataToResult = data => {
        return data["staff"];
    }

    getTable = rawData => {
        const result = this.convertDataToResult(rawData);

        // create table
        return (
            <Table striped bordered hover variant="light" id="support-personnel-report">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Therapist Name</th>
                        <th>Therapist Code</th>
                        <th>Therapy Type</th>
                    </tr>
                </thead>
                <tbody>
                    {result.map((res, index) => {
                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{res.name}</td>
                                <td>{res.code}</td>
                                <td>{res.grouping.join(", ")}</td>
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

    componentWillUnmount() {
        this.setState(() => ({
            selectedPatient: null,
            table: null,
        }));
    }

    render() {
        return (
            <React.Fragment>
                <div>
                    <div className="report-header">
                        <h4>
                            {"Support Personnel - " +
                                this.state.selectedPatient.label}
                        </h4>
                    </div>
                </div>
                <Row>
                    {" "}
                    <div className="report-table" />{" "}
                </Row>
                <div className="report-table-container">
                    <div /*ref={this.printRef}*/> {this.state.table} </div>
                </div>
                <div className="inner-row-btn">
                    <div className="inner-row-col">
                        <ReactHTMLTableToExcel
	                        id="test-table-xls-button"
	                        className="btn btn-primary btn-md"
	                        table="support-personnel-report"
	                        filename={"Support Personnel - " + this.state.selectedPatient.label}
	                        sheet="report"
	                        buttonText="Export as Excel" />
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default SupportPersonnel;
