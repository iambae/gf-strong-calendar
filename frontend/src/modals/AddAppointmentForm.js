import React, { Component } from "react";
import { Alert, Button, Form, Container, Col } from "react-bootstrap";
import { setHours, setMinutes } from "date-fns";
import DatePicker from "react-datepicker";
import isAfter from "date-fns/is_after/index.js";
import Select from "react-select";
import moment from "moment";
import { connect } from "react-redux";
import { AppointmentActions } from "../_actions/appointmentAction";
import { TherapistActions } from "../_actions/therapistAction";
import { PatientActions } from "../_actions/patientAction";
import changeCase from "../_helpers/changeToSnakeCase";
import createDropdown from "../_helpers/createDropdown";
import "../css/Global.css";
import { TypeActions } from "../_actions/typeAction";
import { LocationActions } from "../_actions/locationAction";

// Appointment object to submit to endpoint
var submitAppointment = {
    typeId: "",
    therapists: [],
    patients: [],
    locationId: null,
    startTime: "",
    endTime: "",
};

class AddAppointmentForm extends Component {
    constructor(props, context) {
        super(props, context);

        // Store selected values in the state
        this.state = {
            locationOptions: [],
            typeOptions: [],
            therapistOptions: [],
            patientOptions: [],
            therapyType: "",
            therapist: [],
            patient: [],
            location: null,
            start: "",
            end: "",
            warning: "",
        };
    }

    /* If current time is before 8AM, set minimum allowed time to 8AM on the same day
        If current time is after 6PM, set mimimum allowed time to 8AM on the next day
    */
    componentWillMount() {
        let currentTime = moment();
        let minTime = moment();
        minTime.set({ hours: 8, minutes: 0, second: 0 });
        let maxTime = moment();
        maxTime.set({ hours: 18, minutes: 0, second: 0 });
        if (currentTime.isAfter(maxTime)) {
            currentTime = minTime.add(1, "days");
        } else if (currentTime.isBefore(minTime)) {
            currentTime = minTime;
        }

        let start = currentTime.toDate();
        let end = start;
        this.setState({ start, end });
    }

    componentDidMount() {
        this.props.dispatch(PatientActions.getAllPatients());
        this.props.dispatch(TherapistActions.getAllTherapists());
        this.props.dispatch(TypeActions.getAllTypes());
        this.props.dispatch(LocationActions.getAllLocations());
    }

    componentWillReceiveProps = newProps => {
        if (
            newProps.typeError ||
            newProps.locError ||
            newProps.therapistError ||
            newProps.patientError ||
            newProps.addAppointmentError ||
            newProps.addSuccess ||
            newProps.addLoading ||
            newProps.locLoading ||
            newProps.therapistLoading ||
            newProps.patientLoading
        ) {
            this.setState({ showAlert: true });
        }

        if (newProps.types) {
            this.setState({
                typeOptions: newProps.types,
            });
        }

        if (newProps.locations) {
            this.setState({
                locationOptions: newProps.locations,
            });
        }

        if (newProps.patients) {
            this.setState({
                patientOptions: createDropdown(newProps.patients, "patient"),
            });
        }

        if (newProps.therapists) {
            this.setState({
                therapistOptions: createDropdown(
                    newProps.therapists,
                    "therapist"
                ),
            });
        }

        if (newProps.addSuccess) {
            setTimeout(() => {
                this.props.onAppointmentAdded(0);
            }, 600);
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        this.addAppointment();
    }

    addAppointment = () => {
        const temp = submitAppointment;
        const appointment = changeCase(temp);
        this.props.dispatch(AppointmentActions.createAppointment(appointment));
    }

    isWeekday = date => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    }

    /* The following 3 functions handle start and end dates correctly. */

    setAppointmentTime = ({ start, end }) => {
        start = start || this.state.start;
        end = end || this.state.end;
        if (isAfter(start, end)) end = start;
        submitAppointment.startTime = start;
        submitAppointment.endTime = end;
        this.setState({ start, end });
    }

    handleSelectStart = date => {
        this.setAppointmentTime({ start: date });
    }

    handleSelectEnd = date => {
        this.setAppointmentTime({ end: date });
    }

    handleSelectTherapyType = selected => {
        const typeOptions = this.state.typeOptions;
        const getTherapyType = typeOptions.filter(tt => {
            return tt === selected;
        })[0].key;
        submitAppointment.typeId = getTherapyType;
        this.setState({ therapyType: selected });
    }

    handleSelectPatient = selected => {
        const patientOptions = this.state.patientOptions;
        const getPatients = patientOptions
            .filter(po => selected.includes(po))
            .map(fpo => fpo.key);
        submitAppointment.patients = getPatients;
        this.setState({ patient: selected });
    }

    handleSelectTherapist = selected => {
        const therapistOptions = this.state.therapistOptions;
        const getTherapists = therapistOptions
            .filter(to => selected.includes(to))
            .map(fto => fto.key);
        submitAppointment.therapists = getTherapists;
        this.setState({ therapist: selected });
    }

    handleSelectLocation = selected => {
        const locationOptions = this.state.locationOptions;
        const getLocation = locationOptions.filter(lo => {
            return lo === selected;
        })[0].key;
        submitAppointment.locationId = getLocation;
        this.setState({ location: selected });
    }

    render() {
        const { addLoading, addSuccess, addAppointmentError } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = addAppointmentError ? { variant: "danger", title: "Failed to create an appointment!" } :
            addLoading ? { variant: "warning", title: "Loading..." } :
                addSuccess ? { variant: "success", title: "Appointment was successfully created!" } : null;

        let alert = null;
        if (alertObj && this.state.showAlert) {
            alert = (
                <Alert
                    show={this.state.showAlert}
                    className="fixed-top"
                    variant={alertObj.variant}
                    dismissible
                    onClose={handleHide}
                >
                    {alertObj.title}
                </Alert>
            );
        }

        return (
            <React.Fragment>
                {alert}
                <Container className="form-container">
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Row className="inner-row">
                            <p className="form-title">Create New Appointment</p>
                        </Form.Row>
                        <Form.Row className="inner-row" />
                        <Form.Group>
                            <Form.Label className="select-type">
                                Select Therapy Type:
                            </Form.Label>
                            <Select className="select-type"
                                options={this.state.typeOptions}
                                onChange={this.handleSelectTherapyType}
                                isSearchable={true}
                                value={this.state.therapyType}
                                placeholder={"Select therapy type..."}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="select-therapist">
                                Select Therapist:
                            </Form.Label>
                            <Select className="select-therapist"
                                options={this.state.therapistOptions}
                                onChange={this.handleSelectTherapist}
                                isSearchable={true}
                                isMulti={true}
                                value={this.state.therapist}
                                placeholder={"Select therapist..."}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="select-patient">
                                Select Patient:
                            </Form.Label>
                            <Select className="select-patient"
                                options={this.state.patientOptions}
                                onChange={this.handleSelectPatient}
                                isSearchable={true}
                                isMulti={true}
                                value={this.state.patient}
                                placeholder={"Select patient..."}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className="select-location">
                                Select Location:
                            </Form.Label>
                            <Select className="select-location"
                                options={this.state.locationOptions}
                                onChange={this.handleSelectLocation}
                                isSearchable={true}
                                value={this.state.location}
                                placeholder={"Select location..."}
                            />
                        </Form.Group>
                        <Form.Row className="inner-row">
                            <Form.Group as={Col} className="form-container">
                                <Form.Label className="select-start">
                                    Appointment Start Time
                                </Form.Label>
                                <DatePicker className="select-start"
                                    selected={new Date(moment(this.state.end).format())}
                                    selectsEnd
                                    showTimeSelect
                                    startDate={this.state.start}
                                    endDate={this.state.end}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    timeFormat="HH:mm"
                                    filterDate={this.isWeekday}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    minTime={setHours(setMinutes(new Date(), 0), 8)}
                                    maxTime={setHours(
                                        setMinutes(new Date(), 30),
                                        18
                                    )}
                                    onChange={this.handleSelectEnd}
                                    placeholderText="End Time"
                                    className="datepicker"
                                    todayButton={"Today"}
                                />
                            </Form.Group>
                            <Form.Group as={Col} className="form-container">
                                <Form.Label className="select-end">
                                    Appointment End Time
                                </Form.Label>
                                <DatePicker className="select-end"
                                    selected={this.state.end}
                                    selectsEnd
                                    showTimeSelect
                                    startDate={this.state.start}
                                    endDate={this.state.end}
                                    dateFormat="MMMM d, yyyy h:mm aa"
                                    timeFormat="HH:mm"
                                    filterDate={this.isWeekday}
                                    minTime={setHours(setMinutes(new Date(), 0), 8)}
                                    maxTime={setHours(
                                        setMinutes(new Date(), 30),
                                        18
                                    )}
                                    onChange={this.handleSelectEnd}
                                    placeholderText="End Time"
                                    className="datepicker"
                                    todayButton={"Today"}
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row className="inner-row">
                            <Button
                                className="btn"
                                variant="primary"
                                size="large"
                                type="submit">
                                Add Appointment
                            </Button>
                        </Form.Row>
                        <Form.Row>
                            <p>{this.state.warning}</p>
                        </Form.Row>
                    </Form>
                </Container>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    // appointments: state.appointments, 	--> not being used.
    addAppointmentError: state.appointments.error,
    addSuccess: state.appointments.appointment,
    addLoading: state.appointments.creating,
    locations: state.locations.items,
    locLoading: state.locations.loading,
    locError: state.locations.error,
    therapists: state.therapists.items,
    therapistLoading: state.therapists.loading,
    therapistError: state.therapists.error,
    patients: state.patients.items,
    patientLoading: state.patients.loading,
    patientError: state.patients.error,
    types: state.types.items,
    typeLoading: state.types.loading,
    typeError: state.types.error,
});

const AddAppointmentFormConnected = connect(mapStateToProps)(AddAppointmentForm);
export { AddAppointmentFormConnected as AddAppointmentForm };
