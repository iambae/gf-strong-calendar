import React from "react";
import ReactTable from "react-table";
import "../css/Table.css";
import UserView from "./UserView";
import UserTableFilter from "../usertablefilter/UserTableFilter";
import { Col, Row, Container, Alert } from "react-bootstrap";
import { connect } from "react-redux";
import { PatientActions } from "../_actions/patientAction";
import { TherapistActions } from "../_actions/therapistAction";
import { ClerkActions } from "../_actions/clerkAction";

const columns = [
    {
        Header: "First Name",
        accessor: "firstName",
    },
    {
        Header: "Middle Name",
        accessor: "middleName",
    },
    {
        Header: "Last Name",
        accessor: "lastName",
    },
    {
        Header: "User Type",
        accessor: "userType",
    },
    {
        Header: "Email",
        accessor: "email",
    },
    {
        Header: "Contact Number",
        accessor: "contactNumber",
    },
];

class UserTable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            patientData: null,
            therapistData: null,
            clerkData: null,
            filterUserType: this.props.module,
            filterFirstName: "",
            filterMiddleName: "",
            filterLastName: "",
            filterEmail: "",
            filterContactNumber: "",
            archived: false,
            selected: -1,
            selectedInfo: null,
            selectedFilterType: "",
            filterValue: "",
            lastModule: this.props.module,
            showAlert: false,
            page: 0,
        };
    }

    componentDidMount = () => {
        this.props.dispatch(PatientActions.getAllPatients());
        this.props.dispatch(TherapistActions.getAllTherapists());
        this.props.dispatch(ClerkActions.getAllClerks());
    }

    componentWillReceiveProps = newProps => {
        const showToast = newProps.loading || newProps.error;
        this.setState({ showAlert: showToast });

        const patientArray = newProps.patients;
        if (patientArray) {
            this.setState({ patientData: patientArray });
        }

        const therapistArray = newProps.therapists;
        if (therapistArray) {
            this.setState({ therapistData: therapistArray });
        }
        
        const clerkArray = newProps.clerks;
        if (clerkArray) {
            for (let clerk of clerkArray){
                clerk["userType"] = "clerk";
            }
            this.setState({ clerkData: clerkArray });
        }

        if (this.props.module !== this.state.lastModule) {
            this.setState(() => ({
                filterUserType: this.props.module,
                lastModule: this.props.module,
            }));
        }
    }

    handleMainFilter = filter => {
        switch (filter) {
        case "all":
            this.setState(() => ({ filterUserType: "", selected: -1 }));
            break;
        case "therapist":
            this.setState(() => ({ filterUserType: filter, selected: -1 }));
            break;
        case "patient":
            this.setState(() => ({ filterUserType: filter, selected: -1 }));
            break;
        case "clerk":
            this.setState(() => ({ filterUserType: filter, selected: -1 }));
            break;
        default:
            return null;
        }
    }

    setSecondaryFilter = filterType => {
        this.setState(() => ({ selectedFilterType: filterType }));
    }

    resetFilters = () => {
        this.setState(() => ({
            filterFirstName: "",
            filterMiddleName: "",
            filterLastName: "",
            filterEmail: "",
            filterContactNumber: "",
            page: 0,
            selected: -1,
        }));
    }

    handleSecondaryFilter = filter => {
        this.resetFilters();
        switch (this.state.selectedFilterType) {
        case "firstName":
            this.setState(() => ({ filterFirstName: filter }));
            break;
        case "middleName":
            this.setState(() => ({ filterMiddleName: filter }));
            break;
        case "lastName":
            this.setState(() => ({ filterLastName: filter }));
            break;
        case "email":
            this.setState(() => ({ filterEmail: filter }));
            break;
        case "contactNumber":
            this.setState(() => ({ filterContactNumber: filter }));
            break;
        default:
            return null;
        }
    }

	handleArchived = filter => {
	    switch (filter) {
	    case "active":
	        this.setState(() => ({ archived: false, selected: -1, page: 0 }));
	        break;
	    case "archived":
	        this.setState(() => ({ archived: true, selected: -1, page: 0 }));
	        break;
	    default:
	        return null;
	    }
	}

	render() {
	    const { error, loading } = this.props;
	    const handleHide = () => this.setState({ showAlert: false });
	    const alertObj = error
	        ? {
	            variant: "danger",
	            title: "Loading Patient, Therapist and Clerk information failed!",
	        }
	        : loading
	            ? { variant: "warning", title: "Loading..." }
	            : null;

	    if (alertObj) {
	        return (
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

	    if (!this.state.patientData || !this.state.therapistData || !this.state.clerkData) return null;

	    if (!this.state.archived) {
	        if (this.state.filterUserType === "patient") {
	            this.data = this.state.patientData.filter(function(user) {
	                return !user.archived;
	            });
	        } else if (this.state.filterUserType === "therapist") {
	            this.data = this.state.therapistData.filter(function(user) {
	                return !user.archived;
	            });
	        } else if (this.state.filterUserType === "clerk") {
	            this.data = this.state.clerkData.filter(function (user) {
	                return !user.archived;
	            });
	        }
	        else {
	            this.data = this.state.patientData
	                .concat(this.state.therapistData)
	                .concat(this.state.clerkData)
	                .filter(function(user) {
	                    return !user.archived;
	                });
	        }
	    } else {
	        if (this.state.filterUserType === "patient") {
	            this.data = this.state.patientData.filter(function(user) {
	                return user.archived;
	            });
	        } else if (this.state.filterUserType === "therapist") {
	            this.data = this.state.therapistData.filter(function(user) {
	                return user.archived;
	            });
	        } else if (this.state.filterUserType === "clerk") {
	            this.data = this.state.clerkData.filter(function (user) {
	                return user.archived;
	            });
	        } else {
	            this.data = this.state.patientData
	                .concat(this.state.therapistData)
	                .concat(this.state.clerkData)
	                .filter(function(user) {
	                    return user.archived;
	                });
	        }
	    }

	    return (
	        <div className="main-content container-fluid">
	            <Container fluid>
	                <Row className="content-row">
	                    <Col sm={8} className="columns">
	                        <UserTableFilter
	                            module={this.props.module}
	                            handleMainFilter={this.handleMainFilter}
	                            handleSecondaryFilter={
	                                this.handleSecondaryFilter
	                            }
	                            handleArchived={this.handleArchived}
	                            setSecondaryFilter={this.setSecondaryFilter}
	                            defaultUsers={this.filterUserType}
	                            resetFilters={this.resetFilters}
	                        />
	                        <ReactTable
	                            data={this.data}
	                            columns={columns}
	                            page={this.state.page}
	                            onPageChange={page => this.setState({ page })}
	                            filtered={[
	                                {
	                                    id: "userType",
	                                    value: this.state.filterUserType,
	                                },
	                                {
	                                    id: "firstName",
	                                    value: this.state.filterFirstName,
	                                },
	                                {
	                                    id: "middleName",
	                                    value: this.state.filterMiddleName,
	                                },
	                                {
	                                    id: "lastName",
	                                    value: this.state.filterLastName,
	                                },
	                                {
	                                    id: "email",
	                                    value: this.state.filterEmail,
	                                },
	                                {
	                                    id: "contactNumber",
	                                    value: this.state.filterContactNumber,
	                                },
	                            ]}
	                            defaultFilterMethod={filterCaseInsensitive}
	                            getTrProps={(state, rowInfo) => {
	                                if (rowInfo && rowInfo.row) {
	                                    return {
	                                        onClick: e => {
	                                            this.setState({
	                                                selected: rowInfo.index,
	                                                selectedInfo:
                                                        rowInfo.original,
	                                            });
	                                        },
	                                        style: {
	                                            background:
                                                    rowInfo.index ===
                                                    this.state.selected
                                                        ? "#91c9d6"
                                                        : null,
	                                        },
	                                    };
	                                } else {
	                                    return {};
	                                }
	                            }}
	                            defaultPageSize={10}
	                            pageSizeOptions={[5, 10, 20]}
	                            className="-striped -highlight"
	                        />
	                    </Col>
	                    <Col sm={4} className="columns right-column">
	                        <UserView
	                            title="User Information"
	                            content={this.state.selectedInfo}
	                            handleEditShow={this.props.handleEditShow}
	                        />
	                    </Col>
	                </Row>
	            </Container>
	        </div>
	    );
	}
}

function filterCaseInsensitive(filter, row) {
    if (
        String(row[filter.id])
            .toLowerCase()
            .startsWith(filter.value.toLowerCase())
    ) {
        return true;
    }
    return false;
}

const mapStateToProps = state => ({
    loading: state.patients.loading || state.therapists.loading,
    patients: state.patients.items,
    therapists: state.therapists.items,
    clerks: state.clerks.items,
    error: state.patients.error || state.therapists.error || state.clerks.error ,
});

const UserTableComponent = connect(mapStateToProps)(UserTable);
export { UserTableComponent as UserTable };
