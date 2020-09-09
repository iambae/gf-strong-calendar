import React, { Component } from "react";
import { Alert, Button, Col, Row, FormCheck, Tab, Nav } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { connect } from "react-redux";
import Select from "react-select";
import isAfter from "date-fns/is_after/index.js";
import "../css/Global.css";
import SupportPersonnel from "./SupportPersonnel";
import TherapyIntensity from "./TherapyIntensity";
import PatientTherapy from "./PatientTherapy";
import { PatientActions } from "../_actions/patientAction";
import { ReportActions } from "../_actions/reportAction";
import createDropdown from "../_helpers/createDropdown";

const customStyles = {
    control: (base, state) => ({
        ...base,
        zIndex: "999 !important",
        flexGrow: "2",
        margin: "13px 10px 20px 10px !important",
        borderRadius: "4px",
        boxShadow:
			"0 1px 3px rgba(50, 50, 93, 0.15), 1px 0 3px 0 rgba(0, 0, 0, 0.1) !important",
        border: "0 !important",
        transition: "box-shadow 0.15s ease",
        fontFamily:
			"'Segoe UI', 'Open Sans', 'Helvetica Neue', sans-serif !important",
        fontSize: "1.1em",
    }),
};
class TableReport extends Component {
	state = {
	    patients: null,
	    selectedPatient: null,
	    startDate: null,
	    endDate: null,
	    entireStay: true,
	    showReports: false,
	    showAlert: false,
	    data: null,
	}

	componentDidMount = () => {
	    this.props.dispatch(PatientActions.getAllPatients());
	}

	componentWillReceiveProps = newProps => {
	    const showToast =
			newProps.patientLoading ||
			newProps.patientError ||
			newProps.reportLoading ||
			newProps.reportError;
	    this.setState({ showAlert: showToast });

	    if (newProps.patients) {
	        newProps.patients.filter(p => {
	            return !p.archived;
	        });
	        this.setState({
	            patients: newProps.patients,
	        });
	    }

	    if (newProps.reportData) {
	        this.setState({ showReports: true, data: newProps.reportData });
	    }
	}

	generateReport = () => {
	    // patient was selected now ask for all the patinet report data
	    this.props.dispatch(
	        ReportActions.generatePatientReports(
	            this.state.selectedPatient.key,
	            this.state.startDate,
	            this.state.endDate
	        )
	    );
	}

	onGoBack = () => {
	    this.setState({
	        selectedPatient: null,
	        startDate: null,
	        endDate: null,
	        showReports: false,
	        showAlert: false,
	    });
	}

	onCheckboxChange = () => {
	    this.setState(prevState => ({
	        entireStay: !prevState.entireStay,
	        startDate: null,
	        endDate: null,
	    }));
	}

	setReportRange = ({ startDate, endDate }) => {
	    startDate = startDate || this.state.startDate;
	    endDate = endDate || this.state.endDate;
	    if (isAfter(startDate, endDate)) endDate = startDate;
	    this.setState({ startDate, endDate });
	}

	handleSelectStart = date => {
	    this.setReportRange({ startDate: date });
	}

	handleSelectEnd = date => {
	    this.setReportRange({ endDate: date });
	}

	renderReportTabs = () => {
	    return (
	        <Tab.Container id="left-tabs-example" defaultActiveKey="first">
	            <Row>
	                <Col md={2}>
	                    <Button
	                        className="btn"
	                        variant="secondary"
	                        size="md"
	                        onClick={this.onGoBack}>
							&lt; &nbsp; Patient and Date Selection
	                    </Button>
	                </Col>
	            </Row>
	            <Row>
	                <Col sm={2}>
	                    <Nav variant="pills" className="flex-column">
	                        <Nav.Item>
	                            <Nav.Link eventKey="first">
									Support Personnel
	                            </Nav.Link>
	                        </Nav.Item>
	                        <Nav.Item>
	                            <Nav.Link eventKey="second">
									Therapy Intensity
	                            </Nav.Link>
	                        </Nav.Item>
	                        <Nav.Item>
	                            <Nav.Link eventKey="third">
									Therapy Histogram
	                            </Nav.Link>
	                        </Nav.Item>
	                    </Nav>
	                </Col>
	                <Col sm={10}>
	                    <Tab.Content>
	                        <Tab.Pane eventKey="first">
	                            <SupportPersonnel
	                                selectedPatient={this.state.selectedPatient}
	                                data={this.state.data["support_personnel"]}
	                            />
	                        </Tab.Pane>
	                        <Tab.Pane eventKey="second">
	                            <TherapyIntensity
	                                selectedPatient={this.state.selectedPatient}
	                                data={this.state.data["patient_intensity"]}
	                            />
	                        </Tab.Pane>
	                        <Tab.Pane eventKey="third">
	                            {/* AKA Therapy Histogram */}
	                            <PatientTherapy
	                                selectedPatient={this.state.selectedPatient}
	                                data={this.state.data["patient_therapy"]}
	                            />
	                        </Tab.Pane>
	                    </Tab.Content>
	                </Col>
	            </Row>
	        </Tab.Container>
	    );
	}

	renderPatientSelection = () => {
	    if (!this.state.patients) return null;

	    return (
	        <Row className="inner-row-btn">
	            <div
	                style={{
	                    zIndex: "999",
	                    width: "40vw",
	                    margin: "30px 15px 0 15px",
	                }}>
	                <Select
	                    styles={customStyles}
	                    name="patients"
	                    options={createDropdown(this.state.patients, "patient")}
	                    onChange={ selected => {
	                        this.setState(() => ({ selectedPatient: selected }));
	                    }}
	                    isSearchable
	                    placeholder="Select Patient"
	                />
	            </div>
	            <div className="inner-row-col">
	                <DatePicker
	                    id="datepicker"
	                    className="datepicker"
	                    selected={this.state.startDate}
	                    selectsStart
	                    startDate={this.state.startDate}
	                    endDate={this.state.endDate}
	                    dateFormat="MMMM d, yyyy"
	                    onChange={this.handleSelectStart}
	                    disabled={this.state.entireStay}
	                    placeholderText="From Date"
	                    todayButton={"Today"}
	                />
	            </div>
	            <div className="inner-row-col">
	                <DatePicker
	                    className="datepicker"
	                    selected={this.state.endDate}
	                    selectsEnd
	                    startDate={this.state.startDate}
	                    endDate={this.state.endDate}
	                    dateFormat="MMMM d, yyyy"
	                    onChange={this.handleSelectEnd}
	                    disabled={this.state.entireStay}
	                    placeholderText="To Date"
	                    todayButton={"Today"}
	                />
	            </div>
	            <Col>
	                <FormCheck
	                    label=""
	                    id="entireStay"
	                    checked={this.state.entireStay}
	                    onChange={this.onCheckboxChange}
	                />
	                <label
	                    htmlFor="entireStay"
	                    className="form-label css-label">
						Entire Length of Stay
	                </label>
	            </Col>
	            <div className="inner-row-col">
	                <Button
	                    style={{ marginRight: "20px" }}
	                    onClick={this.generateReport}
	                    disabled={this.state.selectedPatient === null}>
						Generate Reports
	                </Button>
	            </div>
	        </Row>
	    );
	}

	render() {
	    const {
	        patientError,
	        patientLoading,
	        reportError,
	        reportLoading,
	    } = this.props;
	    const handleHide = () => this.setState({ showAlert: false });

	    const alertObj = patientError
	        ? {
	            variant: "danger",
	            title: "Loading Patient information failed!",
			  }
	        : patientLoading || reportLoading
	            ? { variant: "warning", title: "Loading..." }
	            : reportError
	                ? { variant: "danger", title: "Report generation failed!" }
	                : null;

	    let alert = null;
	    if (alertObj) {
	        return (
	            <Alert
	                show={this.state.showAlert}
	                className="fixed-top"
	                variant={alertObj.variant}
	                dismissible
	                onClose={handleHide}>
	                {alertObj.title}
	            </Alert>
	        );
	    }

	    return (
	        <React.Fragment>
	            {alert}
	            {/* a patient was selected and the reports are ready to be displayed */}
	            {this.state.selectedPatient && this.state.showReports
	                ? this.renderReportTabs()
	                : this.renderPatientSelection()}
	        </React.Fragment>
	    );
	}
}

const mapStateToProps = state => ({
    patientLoading: state.patients.loading,
    patients: state.patients.items,
    patientError: state.patients.error,
    reportLoading: state.reports.loading,
    reportData: state.reports.report,
    reportError: state.reports.error,
});

const TablePatientReport = connect(mapStateToProps)(TableReport);
export { TablePatientReport as TableReport };
