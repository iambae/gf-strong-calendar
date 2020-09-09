import React from "react";
import { Button, Row, Col, Form, Container } from "react-bootstrap";
import Select from "react-select";
import "../css/Global.css";

const tempAppointments = [
    { label: "OT - March 20, 2pm", patient: "James", therapist: "Bond" },
    { label: "PT - April 1, 10am", patient: "April", therapist: "Fools" },
];

export default class EditAppointmentForm extends React.Component {
    // TODO: disable the fields that should not be editable
    // TODO: pull data of the desired appointment to update then autopopulate their info in the form

	state = {
	    appointments: tempAppointments,
	    selectedAppointment: null,
	    therapist: "",
	    patient: "",
	    location: "",
	    startTime: "",
	    endTime: "",
	}

	componentWillMount = () => {
	    // TODO: get all appointmenta and populate the state.appointments
	}

	getAppointmentInfo = selected => {
	    // TODO: get appointment info of the selected appointment from the DB and populate the state
	    // await and then:

	    this.setState(() => ({
	        selectedAppointment: selected,
	        patient: selected.patient,
	        therapist: selected.therapist,
	    }));
	}

	updateAppointmentRecord = () => {
	    // TODO: send the updated state to the backend to update the appointment record

	    // TODO: send emails and text messages to the parties involved
	    this.NotifyParticipants();
	}

	NotifyParticipants = () => {
	    // email
	    // text
	}

	renderForm = () => {
	    return (
	        <Container className="form-container">
	            <React.Fragment>
	                <Row>
	                    <Col md={2}>
	                        <Button
	                            className="btn"
	                            variant="secondary"
	                            size="sm"
	                            margin-bottom="10px"
	                            onClick={() => {
	                                this.setState({ selectedAppointment: null });
	                            }}>
								Back
	                        </Button>
	                    </Col>
	                </Row>
	                <Form>
	                    <Form.Group>
	                        <Form.Label className="label">
								Select Therapist:
	                        </Form.Label>
	                        <Form.Control
	                            as="select"
	                            onChange={e => {
	                                this.setState({ therapist: e.target.value });
	                            }}>
	                            <option>Get</option>
	                            <option>Therapies</option>
	                            <option>From</option>
	                            <option>The</option>
	                            <option>DB :)</option>
	                        </Form.Control>
	                    </Form.Group>
	                    <Form.Group>
	                        <Form.Label className="label">
								Select Patient:
	                        </Form.Label>
	                        <Form.Control
	                            as="select"
	                            onChange={e => {
	                                this.setState({ patient: e.target.value });
	                            }}>
	                            <option>Get</option>
	                            <option>Patients</option>
	                            <option>From</option>
	                            <option>The</option>
	                            <option>DB :)</option>
	                        </Form.Control>
	                    </Form.Group>
	                    <Form.Group>
	                        <Form.Label className="label">
								Select Location:
	                        </Form.Label>
	                        <Form.Control
	                            as="select"
	                            onChange={e => {
	                                this.setState({ location: e.target.value });
	                            }}>
	                            <option>Get</option>
	                            <option>Locations/Rooms</option>
	                            <option>From</option>
	                            <option>The</option>
	                            <option>DB :)</option>
	                        </Form.Control>
	                    </Form.Group>
	                    <Form.Group>
	                        <Form.Label className="label">
								Appointment Start Time
	                        </Form.Label>
	                        <Form.Control
	                            onChange={e => {
	                                this.setState({ startTime: e.target.value });
	                            }}
	                        />
	                        <Form.Label className="label">
								Appointment End Time
	                        </Form.Label>
	                        <Form.Control
	                            onChange={e => {
	                                this.setState({ endTime: e.target.value });
	                            }}
	                        />
	                    </Form.Group>
	                    <Row className="inner-row-btn">
	                        <Col>
	                            <Button
	                                className="btn"
	                                variant="primary"
	                                size="large"
	                                onClick={this.updateAppointmentRecord}>
									Update
	                            </Button>
	                        </Col>
	                    </Row>
	                </Form>
	            </React.Fragment>
	        </Container>
	    );
	}

	// TODO: change the selection view to have a date picker to limit the amount of options (appointments to choose from)
	renderSelectAppointment = () => {
	    return (
	        <Row>
	            <Col>
	                <Select
	                    options={this.state.appointments}
	                    onChange={selected => {
	                        this.getAppointmentInfo(selected);
	                    }}
	                    isSearchable
	                    placeholder="Select Appointment to Edit"
	                />
	            </Col>
	        </Row>
	    );
	}

	render() {
	    return (
	        <React.Fragment>
	            {this.state.selectedAppointment
	                ? this.renderForm()
	                : this.renderSelectAppointment()}
	        </React.Fragment>
	    );
	}
}
