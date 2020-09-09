import React from "react";
import ReactTable from "react-table";
import "../css/Table.css";
import LocationView from "./LocationView";
import LocationTableFilter from "../locationtablefilter/LocationTableFilter";
import {
    Col, Row, Container, Alert, Button} from "react-bootstrap";
import { connect } from "react-redux";
import { LocationActions } from "../_actions/locationAction";

const columns = [
    {
        Header: "Location Name",
        accessor: "location",
    },
    {
        Header: "Address",
        accessor: "address",
    }
];

class LocationTable extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            locationData: null,
            location: "",
            address: "",
            filterLocation: "",
            filterAddress: "",
            selected: -1,
            selectedInfo: null,
            selectedFilterType: "",
            filterValue: "",
            lastModule: this.props.module,
            showAlert: false,
            archived: false,
            page: 0,
        };
    }

	componentDidMount = () => {
	    this.props.dispatch(LocationActions.getAllTableLocations());
	}

	componentWillReceiveProps = newProps => {
	    const showToast = newProps.loading || newProps.error;
	    this.setState({ showAlert: showToast });

	    const locationArray = newProps.locations;
	    if (locationArray) {
	        this.setState({ locationData: locationArray });
	    }

	    if (this.props.module !== this.state.lastModule) {
	        this.setState(() => ({
	            lastModule: this.props.module,
	        }));
	    }
	}

	setSecondaryFilter = filterType => {
	    this.setState(() => ({ selectedFilterType: filterType }));
	}

	resetFilters = () => {
	    this.setState(() => ({
	        filterLocation: "",
	        filterAddress: "",
	        page: 0,
	        selected: -1,
	    }));
	}

	handleSecondaryFilter = filter => {
	    this.resetFilters();
	    switch (this.state.selectedFilterType) {
	    case "location":
	        this.setState(() => ({ filterLocation: filter }));
	        break;
	    case "address":
	        this.setState(() => ({ filterAddress: filter }));
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
	            title: "Loading Location information failed!",
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

	    if (!this.state.locationData) return null;

	    if (!this.state.archived) {
	        this.data = this.state.locationData.filter(function (type) {
	            return !type.archived;
	        });
	    } else {
	        this.data = this.state.locationData.filter(function (type) {
	            return type.archived;
	        });
	    }

	    return (
	        <div className="main-content container-fluid">
	            <Container fluid>
	                <Row className="content-row">
	                    <Col sm={8} className="columns">
	                        <LocationTableFilter
	                            module={this.props.module}
	                            handleMainFilter={this.handleMainFilter}
	                            handleSecondaryFilter={
	                                this.handleSecondaryFilter
	                            }
	                            handleArchived={this.handleArchived}
	                            setSecondaryFilter={this.setSecondaryFilter}
	                            resetFilters={this.resetFilters}
	                        />
	                        <ReactTable
	                            data={this.data}
	                            columns={columns}
	                            page={this.state.page}
	                            onPageChange={page => this.setState({ page })}
	                            filtered={[
	                                {
	                                    id: "location",
	                                    value: this.state.filterLocation,
	                                },
	                                {
	                                    id: "address",
	                                    value: this.state.filterAddress,
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
	                    <Col sm={4} className="addColumn">
	                        <Row>
	                            <Col className="add-btn-container">
	                                <Button
	                                    className="add-btn"
	                                    color="#00afec"
	                                    size="lg"
	                                    onClick={() => {
	                                        this.props.handleAddShow("addLocation");
	                                    }}>
										Add New Location
                        			</Button>
	                            </Col>
	                        </Row>
	                        <LocationView
	                            title="Location Information"
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
    loading: state.locations.loading,
    locations: state.locations.locations,
});

const LocationTableComponent = connect(mapStateToProps)(LocationTable);
export { LocationTableComponent as LocationTable };
