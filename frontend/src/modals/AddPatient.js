import React, { Component } from "react";
import "../css/Global.css";
import "../calendar/Calendar.css";
import { validate, getCustomMessage } from "../forms/InputParser.js";
import { Button, Col, Form, Container, FormCheck } from "react-bootstrap";
import DatePicker from "react-datepicker";
import isAfter from "date-fns/is_after/index.js";
import { connect } from "react-redux";
import { PatientActions } from "../_actions/patientAction";
import changeCase from "../_helpers/changeToSnakeCase";
import { Alert } from "react-bootstrap";
import moment from "moment";

class AddPatient extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            contactNumber: "",
            patientNumber: "",
            diagnosis: "Other", // default: Other
            notes: "",
            category: "1", // default: 1 (or 3, no defaults specified for any fields)
            program: "",
            admissionDate: new Date(),
            dischargeDate: null, // optional (can be null)
            pickDischargeDate: false,
            comments: "", // optional (can be null)
            setting: "In Patient", //  default: In Patient
            dateOfBirth: new Date(),
            showAlert: false,
        };
    }

    handleChange = event => {
        event.target.setCustomValidity("");
        const { name, value } = event.target;
        if (name === "contactNumber" && value) {
            const valid = validate(event.target.dataset.parse, value);
            valid
                ? this.setState({ [name]: value })
                : this.setState(prevState => {
                    return { [name]: prevState.contactNumber };
                });
        } else {
            this.setState({ [name]: value });
        }
    }

    handleCustomError = formData => {
        let errors = 0;
        Object.values(formData.target.elements).forEach((element, index) => {
            let { value, dataset } = element;
            if (value !== "") {
                if (validate(dataset.parse, value))
                    element.setCustomValidity("");
                else {
                    element.setCustomValidity(getCustomMessage(dataset.parse));
                    errors++;
                }
                element.reportValidity();
            }
        });

        return errors;
    }

    handleSubmit = event => {
        event.preventDefault();
        const errors = this.handleCustomError(event);
        if (errors === 0) {
            this.addPatient();
        }
    }

    addPatient = () => {
        const temp = this.state;
        const patient = changeCase(temp);
        this.props.dispatch(PatientActions.createPatient(patient));
    }

    isWeekday = date => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    }

    componentWillReceiveProps = newProps => {
        if (
            newProps.addPatientError ||
            newProps.addSuccess ||
            newProps.addLoading
        ) {
            this.setState({ showAlert: true });
        }

        if (newProps.addSuccess) {
            setTimeout(() => {
                this.props.onPatientAdded(0);
            }, 600);
        }
    }

    handleCheckbox = e => {
        const checked = e.target.checked;
        this.setState(prevState => {
            let dischargeDate;
            checked
                ? (dischargeDate = prevState.dischargeDate)
                : (dischargeDate = null);
            return { dischargeDate, pickDischargeDate: checked };
        });
    }

    /* The following 3 functions handle start and end dates correctly. */

    handleDateChange = ({ admissionDate, dischargeDate }) => {
        admissionDate = admissionDate || this.state.admissionDate;
        dischargeDate = dischargeDate || this.state.dischargeDate;
        if (
            isAfter(admissionDate, dischargeDate) &&
            this.state.pickDischargeDate
        )
            dischargeDate = admissionDate;
        this.setState({ admissionDate, dischargeDate });
    }

    handleDateChangeDOB = ({ dob }) => {
        this.setState({ dateOfBirth: dob });
    }

    handleDateSelect = dob => {
        this.handleDateChangeDOB({ dob });
    }

    handleChangeStart = admissionDate =>
        this.handleDateChange({ admissionDate })

    handleChangeEnd = dischargeDate => this.handleDateChange({ dischargeDate })

    render() {
        const { addPatientError, addSuccess } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = addPatientError
            ? { variant: "danger", title: "Adding a patient failed!" }
            : addSuccess
                ? { variant: "success", title: "Adding a patient succeeded" }
                : { variant: "warning", title: "Loading..." };

        return (
            <Container className="form-container">
                <Alert
                    show={this.state.showAlert}
                    className="fixed-top"
                    variant={alertObj.variant}
                    dismissible
                    onClose={handleHide}>
                    {alertObj.title}
                </Alert>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Row className="inner-row">
                        <p className="form-title">Create New Patient</p>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Form.Group as={Col} controlId="firstName">
                            <Form.Label className="label">
                                First Name
                            </Form.Label>
                            <Form.Control
                                required
                                name="firstName"
                                placeholder="First Name"
                                type="text"
                                autoFocus
                                data-parse="name"
                                value={this.state.firstName}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId="middleName">
                            <Form.Label className="label">
                                Middle Name
                            </Form.Label>
                            <Form.Control
                                name="middleName"
                                placeholder="Middle Name"
                                type="text"
                                data-parse="name"
                                value={this.state.middleName}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId="lastName">
                            <Form.Label className="label">Last Name</Form.Label>
                            <Form.Control
                                required
                                name="lastName"
                                placeholder="Last Name"
                                type="text"
                                data-parse="name"
                                value={this.state.lastName}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Form.Group as={Col} controlId="contact">
                            <Form.Label className="label">
                                Contact Number
                            </Form.Label>
                            <Form.Control
                                required
                                name="contactNumber"
                                type="text"
                                data-parse="contact"
                                placeholder="Contact Number"
                                value={this.state.contactNumber}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId="email">
                            <Form.Label className="label">Email</Form.Label>
                            <Form.Control
                                name="email"
                                placeholder="Email"
                                type="email"
                                required
                                data-parse="email"
                                value={this.state.email}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId="dob">
                            <Form.Label className="label">
                                Date of Birth
                            </Form.Label>
                            <DatePicker
                                name="dateOfBirth"
                                className="datepicker"
                                selected={new Date(moment(this.state.dateOfBirth).format())}
                                dateFormat="yyyy-MM-dd"
                                max="9999-12-31"
                                onChange={this.handleDateSelect}
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                todayButton={"Today"}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Form.Group as={Col} controlId="patientNumber">
                            <Form.Label className="label">
                                Patient Number
                            </Form.Label>
                            <Form.Control
                                required
                                name="patientNumber"
                                type="text"
                                placeholder="Patient Number"
                                maxLength="10"
                                data-parse="patientNumber"
                                value={this.state.patientNumber}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Col} controlId="program">
                            <Form.Label className="label">
                                Patient Program
                            </Form.Label>
                            <Form.Control
                                required
                                name="program"
                                type="text"
                                placeholder="Patient Program"
                                maxLength="5"
                                data-parse="patientProgram"
                                value={this.state.program}
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Form.Group as={Col} controlId="patientCategory">
                            <Form.Label className="label">
                                Patient Category
                            </Form.Label>
                            <Form.Control
                                required
                                name="category"
                                as="select"
                                onChange={this.handleChange}>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} controlId="patientSetting">
                            <Form.Label className="label">
                                Patient Setting
                            </Form.Label>
                            <Form.Control
                                name="setting"
                                as="select"
                                required
                                onChange={this.handleChange}>
                                <option>In Patient</option>
                                <option>Out Patient</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group
                            as={Col}
                            className="form-container"
                            controlId="diagnosis">
                            <Form.Label>Diagnosis</Form.Label>
                            <Form.Control
                                as="select"
                                required
                                onChange={this.handleChange}>
                                <option>Stroke</option>
                                <option>TBI</option>
                                <option>Other</option>
                            </Form.Control>
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Form.Group as={Col} className="date-container">
                            <Form.Label className="label">
                                Admission Date
                            </Form.Label>
                            <DatePicker
                                className="datepicker patient-form"
                                selected={new Date(moment(this.state.admissionDate).format())}
                                selectsStart
                                startDate={this.state.admissionDate}
                                endDate={this.state.dischargeDate}
                                dateFormat="MMMM d, yyyy"
                                filterDate={this.isWeekday}
                                onChange={this.handleChangeStart}
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                placeholderText="Admission Date"
                                todayButton={"Today"}
                            />
                        </Form.Group>
                        <Form.Group as={Col} className="date-container">
                            <label
                                htmlFor="discharge-known"
                                className="form-label css-label">
                                Pick Discharge Date
                            </label>
                            <FormCheck
                                id="discharge-known"
                                label=""
                                className="css-checkbox"
                                checked={this.state.pickDischargeDate}
                                onChange={this.handleCheckbox}
                            />
                        </Form.Group>
                        <Form.Group as={Col} className="date-container">
                            <Form.Label className="label">
                                Discharge Date
                            </Form.Label>
                            <DatePicker
                                className="datepicker"
                                selected={this.state.dischargeDate ? new Date(moment(this.state.dischargeDate).format()) : new Date(moment(this.state.start).format())}
                                selectsEnd
                                startDate={this.state.admissionDate}
                                endDate={this.state.dischargeDate}
                                dateFormat="MMMM d, yyyy"
                                filterDate={this.isWeekday}
                                disabled={
                                    this.state.pickDischargeDate ? false : true
                                }
                                onChange={this.handleChangeEnd}
                                peekNextMonth
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                placeholderText={"Optional Discharge Date"}
                                todayButton={"Today"}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Form.Group as={Col} controlId="comments">
                            <Form.Label className="label">Comments</Form.Label>
                            <Form.Control
                                style={{
                                    wordWrap: "break-word",
                                    overflow: "hidden",
                                }}
                                type="input"
                                name="comments"
                                maxLength="250"
                                rows="3"
                                as="textarea"
                                data-parse="comments"
                                placeholder="Add comments about patient here..."
                                onChange={this.handleChange}
                            />
                        </Form.Group>
                    </Form.Row>
                    <Form.Row className="inner-row">
                        <Button
                            className="btn"
                            variant="primary"
                            size="large"
                            type="submit">
                            Add Patient
                        </Button>
                    </Form.Row>
                </Form>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    patients: state.patients,
    addPatientError: state.patients.error,
    addSuccess: state.patients.patient,
    addLoading: state.patients.creating,
});

const AddPatientForm = connect(mapStateToProps)(AddPatient);
export { AddPatientForm as AddPatient };
