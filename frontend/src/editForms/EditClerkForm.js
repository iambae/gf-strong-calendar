import React from "react";
import { Alert, Button, Row, Col, Form, Container } from "react-bootstrap";
import Select from "react-select";
import "./EditPatientForm.css"; // same as EditPatient for now as there is no difference. Create a new one in case this changes.
import "../css/Global.css";
import changeCase from "../_helpers/changeToSnakeCase";
import AreYouSure from "../modals/AreYouSure";
import _ from "lodash";
import { connect } from "react-redux";
import { ClerkActions } from "../_actions/clerkAction";
import { validate } from "../forms/InputParser.js";
import DatePicker from "react-datepicker";
import moment from "moment";

class EditClerkForm extends React.Component {

    state = {
        clerks: [],
        selectedClerk: null,
        editedClerk: null,
        showAlert: false,
        unsavedChangesModal: false,
        archiveClicked: false,
    }

    componentDidMount = () => {
        if (this.props.selected) this.setState({ selectedClerk: this.props.selected, editedClerk: this.props.selected });
        this.props.dispatch(ClerkActions.getAllClerks());
    }

    componentWillReceiveProps = newProps => {
        const showToast = newProps.loading || newProps.error || newProps.success;
        this.setState({ showAlert: showToast });

        if (newProps.clerks) {
            newProps.clerks.filter(c => {
                return !c.archived;
            });
            this.setState({
                clerks: newProps.clerks,
            });
        }

        if (newProps.success) {
            setTimeout(() => {
                this.props.onClerkUpdated(4);
            }, 600);
        }
    }

    getClerkInfo = selected => {
        this.setState(() => ({
            selectedClerk: selected,
            editedClerk: selected,
        }));
    }

    archiveClicked = () => {
        this.setState(() => ({
            archiveClicked: true,
        }));
    }

    handleDismiss = () => {
        this.setState(() => ({
            archiveClicked: false,
        }));
    }

    cancelEditingClicked = () => {
        this.setState(() => ({
            unsavedChangesModal: true
        }));
    }

    cancelEditing = () => {
        // fall back to latest version before changes were made
        this.setState(() => ({
            editedClerk: _.cloneDeep(this.state.selectedClerk)
        }));
        this.handleDismiss();
    }

    archiveUser = () => {
	    this.props.dispatch(ClerkActions.archiveClerk(this.state.selectedClerk.adminId));
	    // this.props.dispatch(ClerkActions.getAllClerks());

        this.handleDismiss();
    }

    updateClerkRecord = () => {
        let finalObj = this.state.editedClerk;
        
	    // 2. update the DB
	    this.props.dispatch(ClerkActions.updateClerk(changeCase(finalObj)));
	    // this.props.dispatch(ClerkActions.getAllClerks());
    }

    handleChange = event => {
        const { name, value } = event.target;
        let temp = _.cloneDeep(this.state.editedClerk);

        let conVal = null;
        if (name === "contactNumber" && value) {
            const valid = validate(event.target.dataset.parse, value);
            conVal = valid ? value : this.state.editedClerk.contactNumber;
        }

        temp[name] = conVal || value;
        this.setState({ editedClerk: temp });
    }

    onEdit = (field, value) => {
        // value is different and not an empty string
        if (this.state.editedClerk[field] !== value && value !== "") {
            let tempRecord = _.cloneDeep(this.state.editedClerk);
            tempRecord[field] = value;
            this.setState(() => ({
                editedClerk: tempRecord
            }));

            this.unsavedChanges = true;
        }
    };

    renderForm = () => {
        return (
            <React.Fragment>
                {(this.state.unsavedChangesModal ||
                    this.state.archiveClicked) && (
                    <AreYouSure
                        onHide={this.handleDismiss}
                        onConfirm={
                            this.state.archiveClicked
                                ? this.archiveUser
                                : this.cancelEditing
                        }
                        modalBody={<h5> {this.state.archiveClicked ?
                            "Please confirm to archive this clerk's account" :
                            "Please confirm to cancel editing"}
                        </h5>}
                    />
                )}
                <Container className="form-container">
                    <Row className="button-row">
                        <Col>
                            <Button
                                className="btn"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    this.setState({ selectedClerk: null, showAlert: false });
                                }}>
                                &lt; &nbsp; Select Clerk
                            </Button>
                        </Col>
                    </Row>
                </Container>
                <Container className="form-container">
                    <Form>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    First Name:
                                </Form.Label>
                                <Form.Control
                                    name="firstName"
                                    placeholder="First Name"
                                    type="text"
                                    pattern="[A-Za-z]+"
                                    autoFocus
                                    onChange={this.handleChange}
                                    value={this.state.editedClerk.firstName}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Middle Name
                                </Form.Label>
                                <Form.Control
                                    name="middleName"
                                    placeholder="Middle Name"
                                    type="text"
                                    pattern="[A-Za-z]+"
                                    onChange={this.handleChange}
                                    value={this.state.editedClerk.middleName}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Last Name
                                </Form.Label>
                                <Form.Control
                                    name="lastName"
                                    placeholder="Last Name"
                                    required
                                    type="text"
                                    pattern="[A-Za-z]+"
                                    onChange={this.handleChange}
                                    value={this.state.editedClerk.lastName}
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Contact Number
                                </Form.Label>
                                <Form.Control
                                    name="contactNumber"
                                    type="text"
                                    data-parse="contact"
                                    placeholder="Contact Number"
                                    onChange={this.handleChange}
                                    value={this.state.editedClerk.contactNumber}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">Email</Form.Label>
                                <Form.Control
                                    value={this.state.editedClerk.email}
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    onChange={this.handleChange}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Date of Birth
                                </Form.Label>
                                <DatePicker
                                    selected={new Date(moment(this.state.editedClerk.dateOfBirth).format())}
                                    className="datepicker"
                                    dateFormat="yyyy-MM-dd"
                                    onChange={e => {
                                        this.onEdit("dateOfBirth", e);
                                    }}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    placeholderText="Date of Birth"
                                    todayButton={"Today"}
                                />
                            </Form.Group>
                        </Form.Row>
                        <div className="inner-row-btn">
                            <div className="inner-row-cols button-row">
                                <Button
                                    className="btn"
                                    variant="danger"
                                    onClick={this.archiveClicked}
                                    size="sm">
                                    Archive
                                </Button>
                                <Button
                                    className="btn"
                                    variant="primary"
                                    size="large"
                                    onClick={this.updateClerkRecord}>
                                    Update
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Container>
            </React.Fragment>
        );
    }

    renderSelectUser = () => {
        return (
            <Row>
                <Col>
                    <Select
                        options={this.state.clerks}
                        onChange={selected => {
                            this.getClerkInfo(selected);
                        }}
                        isSearchable
                        placeholder="Select Clerk to Edit"
                    />
                </Col>
            </Row>
        );
    }

    render() {
        const { error, loading, success } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = error ?
            { variant: "danger", title: "Loading Clerk information failed!" } :
            loading ?
                { variant: "warning", title: "Loading..." } :
                success ? { variant: "success", title: "Clerk was successfully updated!" } : null;

        let alert = null;
        if (alertObj && this.state.showAlert) {
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
                {this.state.selectedClerk
                    ? this.renderForm()
                    : this.renderSelectUser()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    loading: state.clerks.loading || state.clerks.updating,
    clerks: state.clerks.items,
    error: state.clerks.error,
    success: state.clerks.updated
});

const EditClerkFormConnected = connect(mapStateToProps)(EditClerkForm);
export { EditClerkFormConnected as EditClerkForm };
