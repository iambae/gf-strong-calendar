import React from "react";
import { Button, Row, Col, Form, Container, Alert } from "react-bootstrap";
import Select from "react-select";
import "./EditPatientForm.css"; // same as EditPatient for now as there is no difference. Create a new one in case this changes.
import "../css/Global.css";
import { validate } from "../forms/InputParser.js";
import AreYouSure from "../modals/AreYouSure";
import _ from "lodash";
import { connect } from "react-redux";
import { TherapistActions } from "../_actions/therapistAction";
import { TypeActions } from "../_actions/typeAction";
import changeCase from "../_helpers/changeToSnakeCase";
import DatePicker from "react-datepicker";
import moment from "moment";

class EditTherapistForm extends React.Component {

    state = {
        therapists: [],
        selectedTherapist: null,
        editedTherapist: null,
        password: null,

        typeOptions: [],
        archiveClicked: false,
        showAlert: false,
        unsavedChangesModal: false
    }

    componentDidMount = () => {
        if (this.props.selected) this.setState({ selectedTherapist: this.props.selected, editedTherapist: this.props.selected });
        this.props.dispatch(TherapistActions.getAllTherapists());
        this.props.dispatch(TypeActions.getAllTypes());
    }

    componentWillReceiveProps = newProps => {
        const showToast = newProps.loading || newProps.error || newProps.success;
        this.setState({ showAlert: showToast });

        if (newProps.therapists) {
            newProps.therapists.filter(t => { return !t.archived; });
            this.setState({
                therapists: newProps.therapists,
            });
        }

        if (newProps.types) {
            this.setState({
                typeOptions: newProps.types,
            });
        }

        if (newProps.success) {
            setTimeout(() => {
                this.props.onTherapistUpdated(4);
            }, 600);
        }
    }

    archiveClicked = () => {
        this.setState(() => ({
            archiveClicked: true,
        }));
    }

    handleDismiss = () => {
        this.setState(() => ({
            archiveClicked: false,
            unsavedChangesModal: false
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
            editedTherapist: _.cloneDeep(this.state.selectedTherapist),
            password: null
        }));
        this.handleDismiss();
    }

    mapOptionsToTypes = (opts) => {
        let values = [];
        opts.forEach(option => {
            values.push(option.value);
        });
        return values;
    }

	archiveUser = () => {
	    this.props.dispatch(TherapistActions.archiveTherapist(this.state.selectedTherapist.therapistId));
	    // this.props.dispatch(TherapistActions.getAllTherapists());

	    this.setState(() => ({
	        selectedTherapist: null,
	        editedTherapist: null
	    }));
	}

	updateTherapistRecord = () => {		
	    let finalObj = this.state.editedTherapist;
        
	    // add password field to the final object in case it was changed
	    if (this.state.password) finalObj["password"] = this.state.password;
	    finalObj["types"] = this.mapOptionsToTypes(this.state.editedTherapist.types);
        
	    // 2. update the DB
	    this.props.dispatch(TherapistActions.updateTherapist(changeCase(finalObj)));
	    // this.props.dispatch(TherapistActions.getAllTherapists());
	    // this.props.dispatch(TypeActions.getAllTypes());
	}

    handleChange = event => {
        const { name, value } = event.target;
        let temp = _.cloneDeep(this.state.editedTherapist);

        let conVal = null;
        if (name === "contactNumber" && value) {
            const valid = validate(event.target.dataset.parse, value);
            conVal = valid ? value : this.state.editedTherapist.contactNumber;
        }

        temp[name] = conVal || value;
        this.setState({ editedTherapist: temp });
    }

    onEdit = (field, value) => {
        // value was changes
        if (this.state.editedTherapist[field] !== value) {
            let tempTherapist = _.cloneDeep(this.state.editedTherapist);
            tempTherapist[field] = value;
            this.setState(() => ({
                editedTherapist: tempTherapist
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
                            "Please confirm to archive this therapist's account" :
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
                                    this.setState({ selectedTherapist: null, showAlert: false });
                                }}>
                                &lt; &nbsp; Select Therapist
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
                                    type="input"
                                    pattern="[A-Za-z]+"
                                    autoFocus
                                    onChange={this.handleChange}
                                    value={this.state.editedTherapist.firstName}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Middle Name
                                </Form.Label>
                                <Form.Control
                                    name="middleName"
                                    placeholder="Middle Name"
                                    type="input"
                                    pattern="[A-Za-z]+"
                                    onChange={this.handleChange}
                                    value={this.state.editedTherapist.middleName}
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
                                    type="input"
                                    pattern="[A-Za-z]+"
                                    onChange={this.handleChange}
                                    value={this.state.editedTherapist.lastName}
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">Date of Birth</Form.Label>
                                <DatePicker
                                    selected={new Date(moment(this.state.editedTherapist.dateOfBirth).format())}
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
                            <Form.Group as={Col}>
                                <Form.Label className="label">Password</Form.Label>
                                <Form.Control
                                    placeholder="Insert New Password"
                                    type="password"
                                    onChange={e => {
                                        this.setState({ password: e.target.value });
                                    }}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">Email</Form.Label>
                                <Form.Control
                                    value={this.state.editedTherapist.email}
                                    name="email"
                                    placeholder="Email"
                                    type="email"
                                    onChange={this.handleChange}
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label"> Contact Number </Form.Label>
                                <Form.Control
                                    name="contactNumber"
                                    type="input"
                                    data-parse="contact"
                                    placeholder="Contact Number"
                                    onChange={this.handleChange}
                                    value={this.state.editedTherapist.contactNumber}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Therapist Code
                                </Form.Label>
                                <Form.Control
                                    maxLength="10"
                                    name="code"
                                    pattner="^[a-z0-9]+$"
                                    placeholder="Therapist Code"
                                    onChange={this.handleChange}
                                    value={this.state.editedTherapist.code}
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Therapy Type
                                </Form.Label>
                                <Select
                                    className="select-field"
                                    placeholder="Types"
                                    name="types"
                                    value={this.state.editedTherapist.types}
                                    options={[
                                        { key: 1, label: "PT", value: "PT" },
                                        { key: 2, label: "OT", value: "OT" },
                                        { key: 3, label: "Speech", value: "Speech" }
                                    ]}
                                    isMulti={true}
                                    isSearchable={true}
                                    onChange={selected => {
                                        let temp = _.cloneDeep(this.state.editedTherapist);
                                        temp["types"] = selected;
                                        this.setState({
                                            editedTherapist: temp
                                        });
                                    }}
                                    theme={theme => ({
                                        ...theme,
                                        borderRadius: 0,
                                        colors: {
                                            ...theme.colors,
                                            primary25: "silver",
                                            primary: "silver",
                                        },
                                    })}
                                />
                            </Form.Group>
                        </Form.Row>
                        <div className="inner-row-btn">
                            <div className="inner-row-cols button-row">
                                <div className="inner-row-col">
                                    <Button
                                        className="btn"
                                        variant="secondary"
                                        onClick={this.cancelEditingClicked}>
                                        Cancel Editing
                                    </Button>
                                </div>
                                <Button
                                    className="btn"
                                    variant="danger"
                                    onClick={this.archiveClicked}
                                    size="sm">
                                    Archive Therapist
                                </Button>
                                <Button
                                    className="btn"
                                    variant="primary"
                                    size="large"
                                    onClick={this.updateTherapistRecord}>
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
                        options={this.state.therapists}
                        onChange={selected => {
                            this.getTherapistInfo(selected);
                        }}
                        isSearchable
                        placeholder="Select Therapist to Edit"
                    />
                </Col>
            </Row>
        );
    }

    render = () => {
        const { error, loading, success } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = error ?
            { variant: "danger", title: "Loading Therapist information failed!" } :
            loading ?
                { variant: "warning", title: "Loading..." } :
                success ? { variant: "success", title: "Therapist was successfully updated!" } : null;

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
                {this.state.selectedTherapist
                    ? this.renderForm()
                    : this.renderSelectUser()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    loading: state.therapists.loading || state.types.loading || state.therapists.updating,
    therapists: state.therapists.items,
    types: state.types.items,
    success: state.therapists.updated,
    error: state.therapists.error || state.types.error
});

const EditTherapistFormConnected = connect(mapStateToProps)(EditTherapistForm);
export { EditTherapistFormConnected as EditTherapistForm };
