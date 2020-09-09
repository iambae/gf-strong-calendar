import React, { Component } from "react";
import "../css/Global.css";
import "./SupportPersonnel.css";
import { Alert, Button, Col, Row, FormCheck, Tab, Nav } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { connect } from "react-redux";
import isAfter from "date-fns/is_after/index.js";
import moment from "moment";
import SummaryPatient from "./SummaryPatient";
import SummaryDiagnosis from "./SummaryDiagnosis";
import LengthStay from "./LengthStay";
import SummaryTherapyIntensity from "./SummaryTherapyIntensity";
import SessionsAttended from "./SessionsAttended";
import SessionsMissed from "./SessionsMissed";
import { ReportActions } from "../_actions/reportAction";
import Select from "react-select";

const fiscalYearOptions = [
    {
        label: "2016",
        value: 2016,
    },
    {
        label: "2017",
        value: 2017,
    },
    {
        label: "2018",
        value: 2018,
    },
    {
        label: "2019",
        value: 2019,
    },
    {
        label: "2020",
        value: 2020,
    },
];

const customStyles = {
    control: (base, state) => ({
        ...base,
        zIndex: "29",
        marginTop: "25px",
        flexGrow: "2",
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

class SummaryReport extends Component {
	state = {
	    startDate: null,
	    endDate: null,
	    fiscal: false,
	    showReports: false,
	    showAlert: false,
	    data: null,
	    fiscalYear: "Pick a Fiscal Year",
	}

	componentWillReceiveProps = newProps => {
	    const showToast = newProps.error || newProps.loading;
	    this.setState({ showAlert: showToast });

	    if (newProps.report) {
	        this.setState({
	            data: newProps.report,
	            showReports: true,
	        });
	    }
	}

	generateReport = () => {
	    this.props.dispatch(
	        ReportActions.generateSummaryReport(
	            moment(this.state.startDate).format("YYYY-MM-DD"),
	            moment(this.state.endDate).format("YYYY-MM-DD")
	        )
	    );
	}

	/* The following 3 functions handle start and end dates correctly. */

	setSummaryInterval = ({ startDate, endDate }) => {
	    startDate = startDate || this.state.startDate;
	    endDate = endDate || this.state.endDate;
	    if (isAfter(startDate, endDate)) endDate = startDate;
	    this.setState({ startDate, endDate });
	}

	handleSelectStart = startDate => {
	    this.setSummaryInterval({ startDate });
	}

	handleSelectEnd = endDate => {
	    this.setSummaryInterval({ endDate });
	}

	handleSelectFiscalYear = year => {
	    const fiscalYear = year.value;
	    let startDate = this.getFiscalYearStart(year.value);
	    let endDate = this.getFiscalYearEnd(year.value);
	    this.setState({
	        startDate,
	        endDate,
	        fiscalYear,
	    });
	}

	// Get the fiscal year starting date for the given year (e.g. 2018 => Apr 1, 2017)
	getFiscalYearStart = year => {
	    let date = new Date();
	    date.setFullYear(year - 1, 3, 1); // April is month 3 (0-indexed)
	    date.setHours(0, 0, 0, 0);
	    return date;
	}

	// Get the fiscal year ending date for the given year (e.g. 2018 => Mar 31, 2018)
	getFiscalYearEnd = year => {
	    let date = new Date();
	    date.setFullYear(year, 2, 31); // March is month 2 (0-indexed)
	    date.setHours(23, 59, 59, 999);
	    return date;
	}

	onGoBack = () => {
	    this.setState({
	        startDate: null,
	        endDate: null,
	        fiscal: false,
	        showReports: false,
	        showAlert: false,
	        data: null,
	    });
	}

	// Extracts the relevant data for the Summary Patients Report
	extractDataForPatients = data => {
	    let categories = [];
	    data.categories.map(category => {
	        categories.push({
	            raw: category.patients.raw,
	            percent: category.patients.percent,
	        });
	    });

	    return { categories: categories };
	}

	// Extracts the relevant data for the Summary Length of Stay Report
	extractDataForLengthofStay = data => {
	    let categories = [];
	    data.categories.map(category => {
	        categories.push({
	            total: category.length_of_stay.total,
	            average: category.length_of_stay.average,
	            median: category.length_of_stay.median,
	        });
	    });

	    return { categories: categories };
	}

	// Extracts the relevant data for the Summary Diagnosis Report
	extractDataForDiagnosis = data => {
	    let categories = [];
	    data.categories.map(category => {
	        categories.push({
	            stroke: category.diagnosis.stroke,
	            tbi: category.diagnosis.tbi,
	            other: category.diagnosis.other,
	        });
	    });

	    return { categories: categories };
	}

	// Extracts the relevant data for the Intensity Report
	extractDataForIntensity = data => {
	    let categories = [];
	    data.categories.map(category => {
	        categories.push({
	            intensity: category.intensity,
	            total_intensity: category.total_intensity,
	        });
	    });
	    return { categories: categories };
	}

	// Extracts the relevant data for the Sessions Attended / Missed Reports
	extractDataForSessions = data => {
	    let categories = [];
	    data.categories.map(category => {
	        categories.push(category.appointments);
	    });

	    return { categories: categories };
	}

	renderDateSelection = () => {
	    return (
	        <Row className="inner-row-btn">
	            <div className="inner-row-col">
	                <DatePicker
	                    className="datepicker"
	                    selected={this.state.startDate}
	                    dateFormat="MMMM d, yyyy"
	                    selectsStart
	                    startDate={this.state.startDate}
	                    endDate={this.state.endDate}
	                    onChange={this.handleSelectStart}
	                    disabled={this.state.fiscal}
	                    placeholderText="From Date"
	                    todayButton={"Today"}
	                />
	            </div>
	            <div className="inner-row-col">
	                <DatePicker
	                    className="datepicker"
	                    selected={this.state.endDate}
	                    dateFormat="MMMM d, yyyy"
	                    selectsEnd
	                    startDate={this.state.startDate}
	                    endDate={this.state.endDate}
	                    onChange={this.handleSelectEnd}
	                    disabled={this.state.fiscal}
	                    placeholderText="To Date"
	                    todayButton={"Today"}
	                />
	            </div>
	            <div style={{ border: "0px solid" }} className="inner-row-col">
	                <Select
	                    className="select select-field"
	                    styles={customStyles}
	                    placeholder="Pick a Fiscal Year"
	                    name="fiscalYear"
	                    value={{ label: this.state.fiscalYear }}
	                    options={fiscalYearOptions}
	                    onChange={this.handleSelectFiscalYear}
	                    theme={theme => ({
	                        ...theme,
	                        colors: {
	                            ...theme.colors,
	                            primary25: "silver",
	                            primary: "silver",
	                        },
	                    })}
	                />
	            </div>

	            <div style={{ margin: "20px 0 0 20px" }}>
	                <Button onClick={this.generateReport}>
						Generate Reports
	                </Button>
	            </div>
	        </Row>
	    );
	}

	renderReportTabs = () => {
	    return (
	        <React.Fragment>
	            <Row>
	                <Col md={2}>
	                    <Button
	                        className="btn"
	                        variant="secondary"
	                        size="md"
	                        onClick={this.onGoBack}>
							&lt; &nbsp; Back to Date Selection
	                    </Button>
	                </Col>
	            </Row>
	            <Tab.Container id="left-tabs" defaultActiveKey="first">
	                <Row>
	                    <Col sm={3}>
	                        <Nav variant="pills" className="flex-column">
	                            <Nav.Item>
	                                <Nav.Link eventKey="first">
										Patients
	                                </Nav.Link>
	                            </Nav.Item>
	                            <Nav.Item>
	                                <Nav.Link eventKey="second">
										Diagnosis
	                                </Nav.Link>
	                            </Nav.Item>
	                            <Nav.Item>
	                                <Nav.Link eventKey="third">
										Length of Stay
	                                </Nav.Link>
	                            </Nav.Item>
	                            <Nav.Item>
	                                <Nav.Link eventKey="fourth">
										Therapy Intensity
	                                </Nav.Link>
	                            </Nav.Item>
	                            <Nav.Item>
	                                <Nav.Link eventKey="fifth">
										Sessions Attended
	                                </Nav.Link>
	                            </Nav.Item>
	                            <Nav.Item>
	                                <Nav.Link eventKey="sixth">
										Sessions Missed
	                                </Nav.Link>
	                            </Nav.Item>
	                        </Nav>
	                    </Col>
	                    <Col sm={9}>
	                        <Tab.Content>
	                            <Tab.Pane eventKey="first">
	                                <SummaryPatient
	                                    data={this.extractDataForPatients(
	                                        this.state.data
	                                    )}
	                                />
	                            </Tab.Pane>
	                            <Tab.Pane eventKey="second">
	                                <SummaryDiagnosis
	                                    data={this.extractDataForDiagnosis(
	                                        this.state.data
	                                    )}
	                                />
	                            </Tab.Pane>
	                            <Tab.Pane eventKey="third">
	                                <LengthStay
	                                    data={this.extractDataForLengthofStay(
	                                        this.state.data
	                                    )}
	                                />
	                            </Tab.Pane>
	                            <Tab.Pane eventKey="fourth">
	                                <SummaryTherapyIntensity
	                                    data={this.extractDataForIntensity(
	                                        this.state.data
	                                    )}
	                                />
	                            </Tab.Pane>
	                            <Tab.Pane eventKey="fifth">
	                                <SessionsAttended
	                                    data={this.extractDataForSessions(
	                                        this.state.data
	                                    )}
	                                />
	                            </Tab.Pane>
	                            <Tab.Pane eventKey="sixth">
	                                <SessionsMissed
	                                    data={this.extractDataForSessions(
	                                        this.state.data
	                                    )}
	                                />
	                            </Tab.Pane>
	                        </Tab.Content>
	                    </Col>
	                </Row>
	            </Tab.Container>
	        </React.Fragment>
	    );
	}

	render() {
	    const { error, loading } = this.props;
	    const handleHide = () => this.setState({ showAlert: false });

	    const alertObj = error
	        ? { variant: "danger", title: "Report generation failed!" }
	        : loading
	            ? { variant: "warning", title: "Loading..." }
	            : null;

	    let alert = null;
	    if (alertObj) {
	        alert = (
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
	            {this.state.showReports
	                ? this.renderReportTabs()
	                : this.renderDateSelection()}
	        </React.Fragment>
	    );
	}
}

const mapStateToProps = state => ({
    report: state.reports.report,
    loading: state.reports.creating,
    error: state.reports.error,
});

const SummaryReportConainer = connect(mapStateToProps)(SummaryReport);
export { SummaryReportConainer as SummaryReport };
