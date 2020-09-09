import React, { Component } from "react";
import "./AddAppointment.css";
import { Alert, Button, Modal, Row, Form } from "react-bootstrap";
import Select from "react-select";
import "../css/Global.css";
import { connect } from "react-redux";
import createDropdown from "../_helpers/createDropdown";
import { PatientActions } from "../_actions/patientAction";
import { TherapistActions } from "../_actions/therapistAction";
import { AppointmentActions } from "../_actions/appointmentAction";
import { TypeActions } from "../_actions/typeAction";
import { LocationActions } from "../_actions/locationAction";
import changeCase from "../_helpers/changeToSnakeCase";

class AddAppointment extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            show: true,
            therapist: [],
            therapyType: "",
            patient: [],
            location: null,
            start: this.props.appointmentInfo.start,
            end: this.props.appointmentInfo.end,
            locationOptions: [],
            therapistOptions: [],
            patientOptions: [],
            typeOptions: [],
        };
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
                this.props.addAppointment(this.state);
                this.handleClose();
            }, 600);
        }
    }

    // Appointment object to submit to endpoint
    submitAppointment = {
        typeId: "",
        therapists: [],
        patients: [],
        locationId: null,
        startTime: this.props.appointmentInfo.start,
        endTime: this.props.appointmentInfo.end,
    }

    handleClose = () => {
        this.setState({
            show: false,
        });
        this.props.onHide();
    }


    handleSubmit = event => {
        event.preventDefault();
        this.addAppointment();        
    }

    addAppointment = () => {
        const temp = this.submitAppointment;
        const appointment = changeCase(temp);
        this.props.dispatch(AppointmentActions.createAppointment(appointment));
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
        const patientOptions = this.state.patientOptions;
        const getPatients = patientOptions
            .filter(po => selected.includes(po))
            .map(fpo => fpo.key);
        this.submitAppointment.patients = getPatients;
        this.setState({ patient: selected });
    }

    handleSelectTherapist = selected => {
        const therapistOptions = this.state.therapistOptions;
        const getTherapists = therapistOptions
            .filter(to => selected.includes(to))
            .map(fto => fto.key);
        this.submitAppointment.therapists = getTherapists;
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

    render() {
        const { addLoading, addSuccess, addAppointmentError } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = addAppointmentError ? { variant: "danger", title: "Failed to create an appointment!" } :
            addLoading ? { variant: "warning", title: "Loading..." } :
                addSuccess ? { variant: "success", title: "Appointment was successfully created!" } : null;

        if (alertObj && this.state.showAlert) {
            return (
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
                <Modal
                    class="modal-dialog"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title className="modal-title">
                        Add Appointment
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group>
                                <Form.Label className="label">
                                Select Therapy Type:
                                </Form.Label>
                                <Select
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
                                <Select
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
                                <Select
                                    options={this.state.patientOptions}
                                    onChange={this.handleSelectPatient}
                                    isSearchable={true}
                                    isMulti={true}
                                    value={this.state.patient}
                                    placeholder={"Select patient..."}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="label">
                                Select Location:
                                </Form.Label>
                                <Select
                                    options={this.state.locationOptions}
                                    onChange={this.handleSelectLocation}
                                    isSearchable={true}
                                    value={this.state.location}
                                    placeholder={"Select location..."}
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
                                        type="submit">
                                    Save Changes
                                    </Button>
                                </div>
                            </Row>
                        </Form>
                    </Modal.Body>
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
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

const AddAppointmentConnected = connect(mapStateToProps)(AddAppointment);
export { AddAppointmentConnected as AddAppointment };
