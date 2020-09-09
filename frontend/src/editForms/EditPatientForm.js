import React from "react";
import { Button, Row, Col, Form, Container, Alert } from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import _ from "lodash";
import PatientRecordTable from "./PatientRecordTable";
import AreYouSure from "../modals/AreYouSure";
import "./EditPatientForm.css";
import "../css/Global.css";
import "../calendar/Calendar.css";
import changeCase from "../_helpers/changeToSnakeCase";
import { connect } from "react-redux";
import { PatientActions } from "../_actions/patientAction";
import { PatientRecordActions } from "../_actions/patientRecordActions";
import moment from "moment";

class EditPatientForm extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            patients: [],
            selectedPatient: null,
            selectedRecord: null,
            editedRecord: null,
            password: null,

            archivePatientClicked: false,
            archiveRecordClicked: false,
            unsavedChangesModal: false,
            editMode: null,
            nothingChangedAlert: null,
            missingInfo: false
        };
    }
    unsavedChanges = false;

    componentDidMount = () => {
        if (this.props.selected) this.setState({ selectedPatient: this.props.selected });
        this.props.dispatch(PatientActions.getAllPatients());
    };

    componentWillReceiveProps = newProps => {
        if (newProps.selected) {
            this.setState({ selectedPatient: newProps.selected });
        }
        
        const { loading, errorCreate, errorGet, errorUpdate, patient, patientUpdate, successPR, errorPR } = newProps;
        const showToast = loading || errorCreate || errorGet || errorUpdate || patient || patientUpdate || successPR || errorPR;
        this.setState({ showAlert: showToast });

        if (patientUpdate || successPR || newProps.patient) { // update/archive is successful
            if (this.isNonArchivedRecords()) {
                // Go back to mode selection disable the Update Existing button
                this.setState(() => ({
                    editMode: null,
                    editedRecord: {}
                }));
            }

            // Only redirect to user table if it was a patient update / archive, don't redirect for record update / archive.
            // Ideally we would also redirect when this.isNonArchivedRecords() is true,
            // but this seems to cause a memory leak according to React
            if (patientUpdate) {
                setTimeout(() => {
                    this.cancelEditing();
                    this.props.onPatientUpdated(4);
                }, 600);
            }
        }
        
        if (newProps.patients) {
            newProps.patients.filter(p => {
                return !p.archived;
            });
            if (this.state.selectedPatient) { // not the first time we fetch all patients
                const selected = newProps.patients.filter(p => { return p.patientId === this.state.selectedPatient.patientId; })[0];
                this.setState({
                    patients: newProps.patients,
                    selectedPatient: selected,
                    editedRecord: (this.state.editMode) ? { ...selected, ...selected.PatientRecords[0] } : {},
                    selectedRecord: 0,
                });
            } else {
                this.setState({ patients: newProps.patients });
            }
        }
    };

    componentWillUnmount = () => {
        if (this.unsavedChanges) {
            this.setState(() => ({
                unsavedChangesModal: true
            }));
        }
    };

    isWeekday = date => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
    };

    getPatientInfo = selected => {
        this.setState(() => ({
            selectedPatient: selected,
            selectedRecord: 0,
            editMode: null,
        }));
    };

    onEdit = (field, value) => {
        // value is different and not an empty string
        if (this.state.editedRecord[field] !== value) {
            let tempRecord = _.cloneDeep(this.state.editedRecord);
            tempRecord[field] = value;
            this.setState(() => ({
                editedRecord: tempRecord
            }));

            this.unsavedChanges = true;
        }
    };

    // date is in the format YYYY-MM-DD
    getDateObject = date => {
        if (!date) {
            return new Date();
        }
        let split = date.split("-");
        if (split.length < 3) {
            return new Date();
        }
        // month is 0-indexed
        return new Date(split[0], split[1]-1, split[2]);
    }

    onEditDOB = (field, value) => {
        // value is different and not an empty string
        if (this.state.selectedPatient[field] !== value && value !== "") {
            let tempRecord = _.cloneDeep(this.state.selectedPatient);
            tempRecord[field] = value;
            this.setState(() => ({
                selectedPatient: tempRecord
            }));

            this.unsavedChanges = true;
        }
    };

    updatePatientRecord = () => {
        if (!this.unsavedChanges) return this.setState(() => ({ nothingChangedAlert: true, showAlert: true }));

        // 1. prep the final object to be sent to the DB (combined patient and record fields)
        // send the whole patient object with a filed of "PatientRecords": updatedRecord
        let editedRecord = this.state.editedRecord; // both patient and record fields
        let patientRecords = this.state.selectedPatient.PatientRecords;
        let originalPatientRecord = _.cloneDeep(patientRecords[ this.state.selectedRecord ]); // record fields only

        // clean the edited record from PatientRecord fields
        Object.keys(editedRecord).map(key => {
            if (originalPatientRecord.hasOwnProperty(key)) {
                // it's a Patient Record field
                originalPatientRecord[key] = editedRecord[key]; //replace original with updated values
                delete editedRecord[key];
            }
        });

        // add patientId, PatientRecords and password
        if (this.state.password) editedRecord["password"] = this.state.password;
        editedRecord["patientId"] = this.state.selectedPatient.patientId;
        editedRecord["record"] = changeCase(originalPatientRecord);
        
        // Add any missing (unchanged) fields to the request object - not sure it's needed
        let selectedPatient = this.state.selectedPatient;
        Object.keys(selectedPatient).map(key => {
            if (selectedPatient.hasOwnProperty(key) && !editedRecord.hasOwnProperty(key) && key !== "updatedAt") {
                // The field is missing in editRecord
                editedRecord[key] = selectedPatient[key];
            }}); 

        // 2. update the DB
        this.props.dispatch(PatientActions.updatePatient(changeCase(editedRecord)));

        // 3. re-load all patients - pre-selct the same patient
        // this.props.dispatch(PatientActions.getAllPatients());
        this.unsavedChanges = false;
    };

    cancelEditingClicked = () => {
        if (this.unsavedChanges) {
            this.setState(() => ({
                unsavedChangesModal: true
            }));
        } else (
            this.setState(() => ({ nothingChangedAlert: true, showAlert: true }))
        );
    };

    cancelEditing = () => {
        this.unsavedChanges = false;

        // fall back to latest version before changes were made
        this.setState({
            editedRecord: (this.state.editMode) ? 
                { ...this.state.selectedPatient, ...this.state.selectedPatient.PatientRecords[this.state.selectedRecord] } : 
                {},
            password: null
        });
        this.handleDismiss();
    };

    archivePatientClicked = () => {
        this.setState(() => ({
            archivePatientClicked: true
        }));
    };

    archiveRecordClicked = () => {
        this.setState(() => ({
            archiveRecordClicked: true
        }));
    };

    handleDismiss = () => {
        this.setState(() => ({
            archivePatientClicked: false,
            archiveRecordClicked: false,
            unsavedChangesModal: false
        }));
    };

    archiveUser = () => {
        // dispatch the archive Patient action + patientId

        this.cancelEditing();
        this.props.dispatch(PatientActions.archivePatient(this.state.selectedPatient.patientId));
        // this.props.dispatch(PatientActions.getAllPatients());
        this.handleDismiss();
    };

    archiveRecord = () => {
        // dispatch the archive Patient Record action + patienRecordtId

        this.cancelEditing();
        let selectedRecordId = this.state.selectedPatient.PatientRecords[this.state.selectedRecord].patientRecordId;

        // if this is the only patient record this patient has -> go back to mode selection and disable "Update Existing Record" button
        // if there is more than one record -> archive it and stay on editing page
        this.props.dispatch(PatientRecordActions.archivePatientRecord(selectedRecordId));
        // The timeout here is essential, I don't fully understand why
        setTimeout(() => {
            this.props.dispatch(PatientActions.getAllPatients());
        }, 500);
    };

    addPatientRecord = () => {        
        let edited = this.state.editedRecord;
        const mandatoryFields = ["program", "setting", "category", "admissionDate", "diagnosis"];
        let valid = true;
        mandatoryFields.map((key) => {
            if (!edited.hasOwnProperty(key)) valid = false;
        });

        if (!valid) return this.setState(() => ({missingInfo: true, showAlert: true, nothingChangedAlert: false}));

        // if we got here, we have the mandatory fields we need
        edited["patientId"] = this.state.selectedPatient.patientId;

        this.props.dispatch(PatientRecordActions.createPatientRecord(changeCase(edited)));
        //this.props.dispatch(PatientActions.getAllPatients());
        this.unsavedChanges = false;
    };

    rowChanged = newRow => {
        this.unsavedChanges = false;
        this.setState(() => ({
            selectedRecord: newRow.index,
            editedRecord: { ...this.state.selectedPatient, ...newRow.row }
        }));
    };

    // Checks whether selectedPatient has at least 1 record that is not archived
    //  - If there are no non-archived records, we will hide the "Update Existing Record" button
    isNonArchivedRecords = () => {
        if (!this.state.selectedPatient || !this.state.selectedPatient.PatientRecords) {
            return false;
        }

        return this.state.selectedPatient.PatientRecords.some(pr => {
            return !pr.archived;
        });
    };

    renderForm = () => {
        return (
            <React.Fragment>
                {(this.state.archivePatientClicked ||
                    this.state.archiveRecordClicked ||
                    this.state.unsavedChangesModal) && (
                    <AreYouSure
                        onHide={this.handleDismiss}
                        onConfirm={
                            this.state.archivePatientClicked
                                ? this.archiveUser
                                : this.state.archiveRecordClicked
                                    ? this.archiveRecord
                                    : this.cancelEditing
                        }
                        modalBody={
                            <h5>
                                {this.state.archiveRecordClicked
                                    ? "Please confirm to archive this patient record"
                                    : this.state.archivePatientClicked
                                        ? "Please confirm to archive this patient's account"
                                        : "Please confirm to cancel editing"}{" "}
                            </h5>
                        }
                    />
                )}
                <Row>
                    <Col md={2}>
                        <Button
                            className="btn"
                            variant="secondary"
                            size="md"
                            onClick={() => {
                                this.setState({ editMode: null, showAlert: false });
                            }}
                        >
                            {" "}
                            &lt; &nbsp; Back
                        </Button>
                    </Col>
                </Row>
                {this.state.editMode ? (
                    <>
                        <Row style={{ textAlign: "center" }}>
                            <Col>
                                <h4 className="form-heading">
                                    Select a Patient Record to edit
                                </h4>
                            </Col>
                        </Row>
                        <Row>
                            <Col>{this.renderRecordTable()}</Col>
                        </Row>
                    </>
                ) : null}
                <Container className="form-container">
                    <Row>
                        <Col>
                            <h4 className="form-heading">
                                {this.state.editMode
                                    ? "Edit selected Patient Record"
                                    : "Add a New Patient Record"}
                            </h4>
                        </Col>
                    </Row>
                    <Form id="editing-form">
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    First Name
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={this.state.editMode ? this.state.editedRecord.firstName : this.state.selectedPatient.firstName}
                                    onChange={
                                        this.state.editMode
                                            ? e => {
                                                this.onEdit(
                                                    "firstName",
                                                    e.target.value
                                                );
                                            }
                                            : null
                                    }
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Middle Name
                                </Form.Label>
                                <Form.Control
                                    value={this.state.editMode ? this.state.editedRecord.middleName : this.state.selectedPatient.middleName}
                                    type="text"
                                    onChange={
                                        this.state.editMode
                                            ? e => {
                                                this.onEdit(
                                                    "middleName",
                                                    e.target.value
                                                );
                                            }
                                            : null
                                    }
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Last Name
                                </Form.Label>
                                <Form.Control
                                    value={this.state.editMode ? this.state.editedRecord.lastName : this.state.selectedPatient.lastName}
                                    type="text"
                                    onChange={
                                        this.state.editMode
                                            ? e => {
                                                this.onEdit(
                                                    "lastName",
                                                    e.target.value
                                                );
                                            }
                                            : null
                                    }
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Contact Number
                                </Form.Label>
                                <Form.Control
                                    value={this.state.editMode ? this.state.editedRecord.contactNumber : this.state.selectedPatient.contactNumber}
                                    placeholder="Contact Number"
                                    onChange={
                                        this.state.editMode
                                            ? e => {
                                                this.onEdit(
                                                    "contactNumber",
                                                    e.target.value
                                                );
                                            }
                                            : null
                                    }
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">Email</Form.Label>
                                <Form.Control
                                    value={this.state.editMode ? this.state.editedRecord.email : this.state.selectedPatient.email} 
                                    onChange={
                                        this.state.editMode
                                            ? e => {
                                                this.onEdit(
                                                    "email",
                                                    e.target.value
                                                );
                                            }
                                            : null
                                    }
                                />
                            </Form.Group>
                            <Form.Group as={Col} controlId="dob">
                                <Form.Label className="label">
                                    Date of Birth
	                        </Form.Label>
                                <DatePicker
                                    selected={this.state.editMode ? this.getDateObject(this.state.editedRecord.dateOfBirth) : this.getDateObject(this.state.selectedPatient.dateOfBirth) }
                                    className="datepicker"
                                    dateFormat="yyyy-MM-dd"
                                    onChange={e => {
                                        this.onEdit("dateOfBirth", moment(e).format("YYYY-MM-DD"));
                                    }}
                                    readOnly={!this.state.editMode}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    placeholderText="Date of Birth"
                                    todayButton={"Today"}
                                />
                            </Form.Group>
                            {this.state.editMode ? (
                                <Form.Group as={Col}>
                                    <Form.Label className="label">
                                        Password
                                    </Form.Label>
                                    <Form.Control
                                        placeholder="Insert New Password"
                                        type="password"
                                        onChange={e => {
                                            this.unsavedChanges = true;
                                            this.setState({
                                                password: e.target.value
                                            });
                                        }}
                                    />
                                </Form.Group>
                            ) : null}
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Program
                                </Form.Label>
                                <Form.Control
                                    value={this.state.editedRecord.program || ""}
                                    placeholder="Program"
                                    onChange={e => {
                                        this.onEdit("program", e.target.value);
                                    }}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Interruption Days
                                </Form.Label>
                                <Form.Control
                                    value={this.state.editedRecord.interruptionDays || ""}
                                    type="number"
                                    step="1"
                                    min="0"
                                    onChange={e => {
                                        this.onEdit(
                                            "interruptionDays",
                                            e.target.value
                                        );
                                    }}
                                />
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Patient Number
                                </Form.Label>
                                <Form.Control
                                    value={this.state.editMode ? this.state.editedRecord.patientNumber : this.state.selectedPatient.patientNumber}
                                    onChange={
                                        this.state.editMode
                                            ? e => {
                                                this.onEdit(
                                                    "patientNumber",
                                                    e.target.value
                                                );
                                            }
                                            : null
                                    }
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Patient Category
                                </Form.Label>
                                <Form.Control
                                    as="select"
                                    value={this.state.editedRecord.category || "-1"}
                                    onChange={e => {
                                        this.onEdit("category", e.target.value);
                                    }}
                                >
                                    <option value="-1">Category</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label className="label">
                                    Setting
                                </Form.Label>
                                <Form.Control
                                    as="select"
                                    value={this.state.editedRecord.setting || "-1"}
                                    onChange={e => {
                                        this.onEdit("setting", e.target.value);
                                    }}
                                >
                                    <option value="-1">Setting</option>
                                    <option value="In Patient">In Patient</option>
                                    <option value="Out Patient">Out Patient</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Form.Label>Diagnosis</Form.Label>
	                        <Form.Control
	                            as="select"
                                    value={this.state.editedRecord.diagnosis || "-1"}
                                    onChange={e => {
                                        this.onEdit(
                                            "diagnosis",
                                            e.target.value
                                        );
                                    }}>
                                    <option value="-1">Diagnosis</option>
                                    <option>Stroke</option>
                                    <option>TBI</option>
                                    <option>Other</option>
	                        </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col} className="form-container">
                                <Form.Label className="label">
                                    Admission Date
                                </Form.Label>
                                <DatePicker
                                    selected={this.state.editedRecord.admissionDate ? this.getDateObject(this.state.editedRecord.admissionDate) : null}
                                    className="datepicker"
                                    dateFormat="MMMM d, yyyy"
                                    filterDate={this.isWeekday}
                                    onChange={e => {
                                        this.onEdit("admissionDate", moment(e).format("YYYY-MM-DD"));
                                    }}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    placeholderText="Admission Date"
                                    todayButton={"Today"}
                                />
                            </Form.Group>
                            <Form.Group as={Col} className="form-container">
                                <Form.Label className="label">
                                    Discharge Date
                                </Form.Label>
                                <DatePicker
                                    selected={this.state.editedRecord.dischargeDate ? this.getDateObject(this.state.editedRecord.dischargeDate) : null}
                                    className="datepicker"
                                    dateFormat="MMMM d, yyyy"
                                    filterDate={this.isWeekday}
                                    onChange={e => {
                                        this.onEdit("dischargeDate", moment(e).format("YYYY-MM-DD"));
                                    }}
                                    placeholderText={"Optional Discharge Date"}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    todayButton={"Today"}
                                />
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col}>
                                <Form.Label>Comments</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows="3"
                                    value={this.state.editedRecord.comments || ""}
                                    placeholder="Comments.."
                                    onChange={e => {
                                        this.onEdit("comments", e.target.value);
                                    }}
                                />
                            </Form.Group>
                        </Form.Row>
                        <Row className="inner-row-btn">
                            <div className="inner-row-col">
                                <Button
                                    className="btn"
                                    variant="secondary"
                                    onClick={this.cancelEditingClicked}
                                >
                                    Cancel Editing
                                </Button>
                            </div>
                            {this.state.editMode ? (
                                <>
                                    <div className="inner-row-col">
                                        <Button
                                            className="btn"
                                            variant="danger"
                                            onClick={this.archiveRecordClicked}
                                        >
                                            Archive Patient Record
                                        </Button>
                                    </div>
                                    <div className="inner-row-col">
                                        <Button
                                            className="btn"
                                            variant="danger"
                                            onClick={this.archivePatientClicked}
                                        >
                                            Archive Patient
                                        </Button>
                                    </div>
                                </>
                            ) : null}
                            {!this.state.editMode ? (
                                <div className="inner-row-col">
                                    <Button
                                        className="btn"
                                        variant="primary"
                                        size="large"
                                        onClick={this.addPatientRecord}
                                    >
                                        Add New Record
                                    </Button>
                                </div>
                            ) : (
                                <div className="inner-row-col">
                                    <Button
                                        className="btn"
                                        variant="primary"
                                        size="large"
                                        onClick={this.updatePatientRecord}
                                    >
                                        Update
                                    </Button>
                                </div>
                            )}
                        </Row>
                    </Form>
                </Container>
            </React.Fragment>
        );
    };

    renderRecordTable = () => {
        return (
            <PatientRecordTable
                records={this.state.selectedPatient.PatientRecords}
                changeRowClicked={() => {
                    return this.unsavedChanges; //there are changes to the record or the password
                }}
                onHide={this.handleDismiss}
                modalBody={<h5>Please confirm to cancel editing</h5>}
                updateSelectedRecord={row => this.rowChanged(row)}
            />
        );
    };

    renderSelectUser = () => {
        return (
            <Row>
                <Col>
                    <Select
                        options={this.state.patients}
                        onChange={selected => {
                            this.getPatientInfo(selected);
                        }}
                        isSearchable
                        placeholder="Select Patient to Edit"
                    />
                </Col>
            </Row>
        );
    };

    renderSelectMode = () => {
        return (
            <> 
                <Row>
                    <Col md={2}>
                        <Button
                            className="btn"
                            variant="secondary"
                            size="md"
                            onClick={() => {
                                this.setState({
                                    selectedPatient: null,
                                    editedRecord: null,
                                    selectedRecord: null,
                                    showAlert: false
                                });
                            }}
                        >
                            {" "}
                            &lt; &nbsp; Select Patient
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="inner-row-col">
                            <Button
                                className="btn"
                                variant="success"
                                size="large"
                                onClick={() => {
                                    this.setState(() => ({
                                        editMode: false,
                                        editedRecord: {},
                                    }));
                                }}
                            >
                                Add A New Patient Record
                            </Button>
                        </div>
                        <div className="inner-row-col">
                            <Button
                                className="btn"
                                variant="primary"
                                size="large"
                                onClick={() => {
                                    let selected = this.state.selectedPatient;
                                    this.setState({ 
                                        editMode: true,
                                        selectedPatient: selected,
                                        editedRecord: { ...selected, ...selected.PatientRecords[0] }
                                    });}}
                            >
                                Update An Existing Patient Record
                            </Button>
                        </div>
                    </Col>
                </Row>
            </>
        );
    };

    render() {
        const { loading, errorCreate, errorGet, errorUpdate, errorPR, patient, patientUpdate, successPR } = this.props;
        const handleHide = () => this.setState({ showAlert: false });
        const alertObj = (errorCreate || errorGet || errorUpdate || errorPR) ?
            { variant: "danger", title: "Loading Patient information failed!" } :
            loading ?
                { variant: "warning", title: "Loading..." } :
                (patientUpdate || patient || successPR) ? { variant: "success", title: "Information was successfully updated!" } : 
                    this.state.nothingChangedAlert ? { variant: "warning", title: "No changes were made" } : 
                        this.state.missingInfo ? { variant: "danger", title: "Failed! Some information is missing" } : null;

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
                {!this.state.selectedPatient
                    ? this.renderSelectUser()
                    : this.state.editMode !== null
                        ? this.renderForm()
                        : this.renderSelectMode()}
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
    loading:
        state.patients.updating ||
        state.patients.loading ||
        state.patients.creating ||
        state.reports.creating ||
        state.reports.updating,
    patients: state.patients.items, // get all
    patient: state.patients.patient, // create patient success
    errorCreate: state.patients.errorCreate,
    errorGet: state.patients.errorGet,
    errorUpdate: state.patients.errorUpdate,
    patientUpdate: state.patients.patientUpdate, // update patient success
    errorPR: state.records.error,
    successPR: state.records.record || state.records.recordUpdate, // patientRecord success
});

const EditPatientFormConnected = connect(mapStateToProps)(EditPatientForm);
export { EditPatientFormConnected as EditPatientForm };
