import React, { Component } from "react";
import "./EditAppointment.css";
import "./AddAppointment.css";
import { Button, Row, Modal, Form } from "react-bootstrap";
import Select from "react-select";
import isAfter from "date-fns/is_after/index.js";
import { setHours, setMinutes } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Global.css";
import { connect } from "react-redux";
import { AppointmentActions } from "../_actions/appointmentAction";
import { PatientActions } from "../_actions/patientAction";
import { TherapistActions } from "../_actions/therapistAction";
import { TypeActions } from "../_actions/typeAction";
import { LocationActions } from "../_actions/locationAction";
import changeCase from "../_helpers/changeToSnakeCase";
import createDropdown from "../_helpers/createDropdown";
import moment from "moment";

var details = null;

class EditAppointment extends Component {
	user = JSON.parse(localStorage.getItem("user"))
	calendarPermission = this.user.permission.filter(p => {
	    return (
	        p.indexOf("Calendar") !== -1 &&
			p.indexOf("Calendar") === p.length - "Calendar".length
	    );
	})[0]

	constructor(props, context) {
	    super(props, context);

	    details = this.props.appointmentInfo;

	    this.state = {
	        show: true,
	        id: details.id,
	        therapyType: details.therapyType,
	        therapist: details.therapist,
	        patient: details.patient,
	        location: details.location,
	        start: details.start,
	        end: details.end,
	        therapistOptions: [],
	        patientOptions: [],
	        typeOptions: [],
	        locationOptions: [],
	        archiveClicked: false,
	    };
	}

	componentDidMount() {
	    this.props.dispatch(PatientActions.getAllPatients());
	    this.props.dispatch(TherapistActions.getAllTherapists());
	    this.props.dispatch(TypeActions.getAllTypes());
	    this.props.dispatch(LocationActions.getAllLocations());
	    if (this.calendarPermission === "adminCalendar")
	        this.props.dispatch(AppointmentActions.getAllAppointments());
	    else this.props.dispatch(
	        AppointmentActions.getAppointments(this.user.data.user_id)
	    );
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

	    if (newProps.appointments) {
	        this.setState({
	            appointments: newProps.appointments,
	        });
	    }

	    if (newProps.types) {
	        this.setState({
	            typeOptions: newProps.types,
	            therapyType: newProps.types.filter(tt => {
	                return tt.key === details.therapyType;
	            })[0],
	        });
	    }

	    if (newProps.locations) {
	        this.setState({
	            locationOptions: newProps.locations,
	            location: newProps.locations.filter(lo => {
	                return lo.key === details.location;
	            })[0],
	        });
	    }

	    if (newProps.patients) {
	        const options = newProps.patients.filter(po =>
	            details.patient.includes(po.patientId)
	        );
	        var selectedPatients = createDropdown(options, "patient");
	        this.setState({
	            patientOptions: newProps.patients,
	            patient: selectedPatients,
	        });
	    }

	    if (newProps.therapists) {
	        const options = newProps.therapists.filter(to =>
	            details.therapist.includes(to.therapistId)
	        );
	        var selectedTherapists = createDropdown(options, "therapist");
	        this.setState({
	            therapistOptions: newProps.therapists,
	            therapist: selectedTherapists,
	        });
	    }

	    if (newProps.updateSuccess) {
	        setTimeout(() => {
	            this.props.editCalendar(this.state);
	            this.handleClose();
	        }, 700);
	    }
	}

	submitAppointment = {
	    appointmentId: this.props.appointmentInfo.id,
	    typeId: this.props.appointmentInfo.therapyType,
	    therapists: this.props.appointmentInfo.therapist,
	    patients: this.props.appointmentInfo.patient,
	    locationId: this.props.appointmentInfo.location,
	    startTime: this.props.appointmentInfo.start,
	    endTime: this.props.appointmentInfo.end,
	    archived: false,
	}

	handleClose = () => {
	    this.setState({
	        show: false,
	    });
	    this.props.onHide();
	}

	handleShow = modalType => {
	    this.setState({
	        show: true,
	    });
	}

	handleSubmit = event => {
	    event.preventDefault();
	    this.updateAppointment();
	}

	updateAppointment = () => {
	    const temp = this.submitAppointment;
	    const appointment = changeCase(temp);
	    this.props.dispatch(AppointmentActions.updateAppointment(appointment));
	}

	isWeekday = date => {
	    const day = date.getDay();
	    return day !== 0 && day !== 6;
	}

	handleSelectTherapyType = selected => {
	    const typeOptions = this.state.typeOptions;
	    const getTherapyType = typeOptions.filter(tt => {
	        return tt === selected;
	    })[0].key;
	    this.submitAppointment.typeId = getTherapyType;
	    this.setState({ therapyType: selected });
	}

	handleSelectPatient = selected => {
	    this.submitAppointment.patients = selected.map(fpo => fpo.key ? fpo.key : fpo.patientId);
	    this.setState({ patient: selected });
	}

	handleSelectTherapist = selected => {
	    this.submitAppointment.therapists = selected.map(fto => fto.key ? fto.key : fto.therapistId);
	    this.setState({ therapist: selected });
	}

	handleSelectLocation = selected => {
	    const locationOptions = this.state.locationOptions;
	    const getLocation = locationOptions.filter(lo => {
	        return lo === selected;
	    })[0].key;
	    this.submitAppointment.locationId = getLocation;
	    this.setState({ location: selected });
	}

	setAppointmentTime = ({ start, end }) => {
	    start = start || this.state.start;
	    end = end || this.state.end;
	    if (isAfter(start, end)) end = start;
	    this.submitAppointment.startTime = start;
	    this.submitAppointment.endTime = end;
	    this.setState({ start, end });
	}

	handleSelectStart = date => {
	    this.setAppointmentTime({ start: date });
	}

	handleSelectEnd = date => {
	    this.setAppointmentTime({ end: date });
	}

	archiveClicked = event => {
	    this.submitAppointment.archived = true;
	    this.setState({ archiveClicked: true }, () => this.handleSubmit(event));
	}

	render() {
	    return (
	        <Modal
	            class="modal-dialog"
	            show={this.state.show}
	            onHide={this.handleClose}>
	            <Modal.Header closeButton>
	                <Modal.Title>Edit Appointment</Modal.Title>
	            </Modal.Header>
	            <Row className="inner-row-btn">
	                <div className="inner-row-col">
	                    <Button
	                        className="btn"
	                        variant="danger"
	                        onClick={this.archiveClicked}
	                        size="sm">
							Archive Appointment
	                    </Button>
	                </div>
	            </Row>
	            <Modal.Body>
	                <Form>
	                    <Form.Group>
	                        <Form.Label className="label">
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
	                        <Form.Label className="label">
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
	                        <Form.Label className="label">
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
	                    <Form.Group >
	                        <Form.Label className="label">
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
	                    <Form.Group id="center-form-group">
	                        <Form.Label className="label">
								Appointment Start Time
	                        </Form.Label>
	                        <DatePicker className="select-start"
	                            selected={new Date(moment(this.state.start).format())}
	                            showTimeSelect
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
	                            onChange={this.handleSelectStart}
	                            placeholderText="Start Time"
	                            className="datepicker"
	                            todayButton={"Today"}
	                        />
	                        <Form.Label className="label">
								Appointment End Time
	                        </Form.Label>
	                        <DatePicker className="select-end"
	                            selected={new Date(moment(this.state.end).format())}
	                            showTimeSelect
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
	                    <Row className="inner-row-btn">
	                        <div className="inner-row-col">
	                            <Button
	                                className="btn"
	                                variant="secondary"
	                                size="large"
	                                onClick={this.handleClose}>
									Close
	                            </Button>
	                        </div>
	                        <div className="inner-row-col">
	                            <Button
	                                className="btn"
	                                variant="primary"
	                                size="large"
	                                onClick={this.handleSubmit}>
									Save Changes
	                            </Button>
	                        </div>
	                    </Row>
	                </Form>
	            </Modal.Body>
	        </Modal>
	    );
	}
}

const mapStateToProps = state => ({
    appointments: state.appointments.items,
    updateAppointmentError: state.appointments.error,
    updateSuccess: state.appointments.updated,
    updateLoading: state.appointments.updating,
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

const EditAppModal = connect(mapStateToProps)(EditAppointment);
export { EditAppModal as EditAppointment };
