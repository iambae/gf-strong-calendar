import React, { Component } from "react";
import { Button, Col, Row } from "react-bootstrap";
import "./Dashboard.css";
import { AddPatient } from "../modals/AddPatient";
import { AddLocation } from "../modals/AddLocation";
import { AddType } from "../modals/AddType";
import { AddTherapist } from "../modals/AddTherapist";
import { AddClerk } from "../modals/AddClerk";
import { Calendar } from "../calendar/Calendar";
import Navigation from "../navigation/Navigation";
import { UserProfile } from "../profile/UserProfile";
import { UserTable } from "../usertable/UserTable";
import { LocationTable } from "../locationtable/LocationTable";
import { TypeTable } from "../typetable/TypeTable";
import { Filter } from "../filter/Filter";
import { TableReport } from "../reports/TableReport";
import { SummaryReport } from "../reports/SummaryReport";
import printUtility from "../_helpers/printUtility";
import { EditPatientForm } from "../editForms/EditPatientForm";
import { EditLocationForm } from "../editForms/EditLocationForm";
import { EditTypeForm } from "../editForms/EditTypeForm";
import { EditTherapistForm } from "../editForms/EditTherapistForm";
import EditAppointmentForm from "../editForms/EditAppointmentForm";
import { EditClerkForm } from "../editForms/EditClerkForm";
import { AddAppointmentForm } from "../modals/AddAppointmentForm";
import AreYouSure from "../modals/AreYouSure";
import { history } from "../_helpers/history";
import { connect } from "react-redux";
import { AuthActions } from "../_actions/authAction";

class Dashboard extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            index: 0,
            userTableDefault: "",
            previousIndex: 0,
            filters: [],
            user: this.props.user, // for visibility
        };
        this.printCalRef = React.createRef();
        this.subViews = [
            this.renderCalendarView,
            this.renderProfileView,
            this.renderReportView.bind(this, "table"),
            this.renderReportView.bind(this, "chart"),
            this.renderUserTableView,
            this.renderEditPatientView,
            this.renderEditTherapistView,
            this.renderEditAppointmentView,
            this.renderEditClerkView,
            this.renderLogout,
            this.renderAddPatientView,
            this.renderAddTherapistView,
            this.renderAddClerkView,
            this.renderAddAppointmentView,
            this.renderLocationTableView,
            this.renderTypeTableView,
            this.renderEditLocationView,
            this.renderEditTypeView,
            this.renderAddLocationView,
            this.renderAddTypeView
        ];
        this.indexByModule = {
            calendar: 0,
            userProfile: 1,
            tableReport: 2,
            summaryReport: 3,
            usersall: 4,
            patientEdit: 5,
            therapistEdit: 6,
            appointmentEdit: 7,
            clerkEdit: 8,
            logout: 9,
            addPatient: 10,
            addTherapist: 11,
            addClerk: 12,
            addAppointment: 13,
            locationsall: 14,
            typesall: 15,
            locationEdit: 16,
            typeEdit: 17,
            addLocation: 18,
            addType: 19,
        };
    }

    componentDidMount = () => {
        let user = this.props.user || JSON.parse(localStorage.getItem("user"));    
        if (!user) { history.push("/login"); }
    }

    componentWillReceiveProps = newProps => {
        if (newProps.index) { this.state.setState({ index: newProps.index }); }
    }

    handleToggle = index => {
        const prevIndex = this.state.index;
        index === 0 ?
            this.setState(() => ({ index: index, previousIndex: prevIndex, filters: [] })) :
            this.setState(() => ({ index: index, previousIndex: prevIndex }));
    }

    handleShow = modalType => {
        switch (modalType) {
        case "usersall":
            this.setState(() => ({
                index: this.indexByModule[modalType],
            }));
            break;
        case "tableReport":
            this.handleToggle(this.indexByModule[modalType]);
            break;
        case "summaryReport":
            this.handleToggle(this.indexByModule[modalType]);
            break;
        case "userProfile":
            this.handleToggle(this.indexByModule[modalType]);
            break;
        case "logout":
            this.handleToggle(this.indexByModule[modalType]);
            break;
        case "therapytypes":
            this.handleToggle(this.indexByModule[modalType]);
            break;
        case "locationsall":
            this.handleToggle(this.indexByModule[modalType]);
            break;
        case "typesall":
            this.handleToggle(this.indexByModule[modalType]);
            break;
        default:
            return null;
        }
    }

    _printUtil = ({ title, ref }) => {
        return printUtility(title, ref, 0.4);
    }

    handleEditShow = (modalType, selectedInfo) => {
        switch (modalType) {
        case "patientEdit":
            this.setState(() => ({ index: this.indexByModule[modalType], selected: selectedInfo }));
            break;
        case "therapistEdit":
            this.setState(() => ({ index: this.indexByModule[modalType], selected: selectedInfo }));
            break;
        case "clerkEdit":
            this.setState(() => ({ index: this.indexByModule[modalType], selected: selectedInfo }));
            break;
        case "locationEdit":
            this.setState(() => ({ index: this.indexByModule[modalType], selected: selectedInfo }));
            break;
        case "typeEdit":
            this.setState(() => ({ index: this.indexByModule[modalType], selected: selectedInfo }));
            break;
        default:
            return null;
        }
    }

    renderUserTableView = () => {
        return (
            <div>
                <UserTable
                    module={this.state.userTableDefault}
                    handleEditShow={this.handleEditShow}
                />
            </div>
        );
    }

    renderLocationTableView = () => {
        return (
            <div>
                <LocationTable
                    handleEditShow={this.handleEditShow}
                    handleAddShow={this.handleAddShow}
                />
            </div>
        );
    }

    renderTypeTableView = () => {
        return (
            <div>
                <TypeTable
                    handleEditShow={this.handleEditShow}
                    handleAddShow={this.handleAddShow}
                />
            </div>
        );
    }

    handleAddShow = page => {
        switch (page) {
        case "addPatient":
            this.setState(() => ({ index: this.indexByModule[page] }));
            break;
        case "addTherapist":
            this.setState(() => ({ index: this.indexByModule[page] }));
            break;
        case "addAppointment":
            this.setState(() => ({ index: this.indexByModule[page] }));
            break;
        case "addClerk":
            this.setState(() => ({ index: this.indexByModule[page] }));
            break;
        case "addLocation":
            this.setState(() => ({ index: this.indexByModule[page] }));
            break;
        case "addType":
            this.setState(() => ({ index: this.indexByModule[page] }));
            break;
        default:
            return null;
        }
    }

    logout = () => {
        this.props.dispatch(AuthActions.logout());
        history.push("/login");
    }

    renderLogout = () => {
        return (
            <AreYouSure
                onConfirm={() => {
                    this.logout();
                }}
                onHide={() => {
                    this.handleToggle(this.state.previousIndex);
                }}
                modalBody={<h5>Please confirm in order to logout</h5>}
            />
        );
    }

    goToIndex = index => {
        this.setState(() => ({
            index: index
        }));
    }

    renderAddPatientView = () => {
        return <AddPatient onPatientAdded={this.goToIndex} />;
    }

    renderAddTherapistView = () => {
        return <AddTherapist onTherapistAdded={this.goToIndex} />;
    }

    renderAddClerkView = () => {
        return <AddClerk onClerkAdded={this.goToIndex} />;
    }

    renderAddAppointmentView = () => {
        return <AddAppointmentForm onAppointmentAdded={this.goToIndex} />;
    }

    renderAddLocationView = () => {
        return <AddLocation onLocationAdded={this.goToIndex} />;
    }

    renderAddTypeView = () => {
        return <AddType onTypeAdded={this.goToIndex} />;
    }

    renderEditPatientView = () => {
        return <EditPatientForm selected={this.state.selected} onPatientUpdated={this.goToIndex} />;
    }

    renderEditTherapistView = () => {
        return <EditTherapistForm selected={this.state.selected} onTherapistUpdated={this.goToIndex} />;
    }

    renderEditClerkView = () => {
        return <EditClerkForm selected={this.state.selected} onClerkUpdated={this.goToIndex} />;
    }

    renderEditAppointmentView = () => {
        return <EditAppointmentForm />;
    }

    renderEditLocationView = () => {
        return <EditLocationForm selected={this.state.selected} onLocationUpdated={this.goToIndex} />;
    }

    renderEditTypeView = () => {
        return <EditTypeForm selected={this.state.selected} onTypeUpdated={this.goToIndex} />;
    }

    renderProfileView = () => {
        return (
            <div>
                <UserProfile userAuth={this.props.user} />
            </div>
        );
    }

    renderReportView = type => {
        return type === "table" ? (
            <div>
                {" "}
                <TableReport />{" "}
            </div>
        ) : (
            <div>
                {" "}
                <SummaryReport />{" "}
            </div>
        );
    }

    renderCalendarView = () => {
        return (
            <React.Fragment>
                <Row className="filter-container">
                    <Col>
                        <Filter handleFilterInput={this.handleFilterInput} />
                    </Col>
                </Row>
                <Row>
                    <Col className="print-btn-container">
                        <Button
                            variant="primary"
                            type="button"
                            size="sm"
                            className="print-btn"
                            onClick={this._printUtil.bind(this, {
                                title: "Calendar",
                                ref: this.printCalRef,
                            })}>
                            Print Schedule
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div ref={this.printCalRef}>
                            <Calendar filters={this.state.filters} />
                        </div>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

    handleFilterInput = filterState => {
        this.setState({ filters: filterState });
    }

    render() {
        let user = this.props.user || JSON.parse(localStorage.getItem("user"));    
        if (!user) { history.push("/login"); return null; }
        
        if (user.permission.includes("user"))
            user.permission.push("users");

        if (user.permission.includes("appointments"))
            user.permission.push("appointment");
        return (
            <div>
                <div>
                    <Row>
                        <Navigation
                            userPermissions={user.permission}
                            handleShow={this.handleShow}
                            handleAddShow={this.handleAddShow}
                            handleEditShow={this.handleEditShow}
                            handleToggle={this.handleToggle}
                        />
                    </Row>
                </div>
                {/* render calendar view / profile view / reports view based on index */}
                {this.subViews[this.state.index]()}
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { loggedIn, user, index } = state.authentication;
    return { loggedIn, user };
}

const connectedDashboard = connect(mapStateToProps)(Dashboard);
export { connectedDashboard as Dashboard };
