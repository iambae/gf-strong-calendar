import React from "react";
import {
    Row,
    Button,
    Nav,
    Navbar,
    NavDropdown,
    NavItem,
    Alert,
} from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "./Filter.css";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { connect } from "react-redux";
import { PatientActions } from "../_actions/patientAction";
import { TherapistActions } from "../_actions/therapistAction";
import { TypeActions } from "../_actions/typeAction";
import { LocationActions } from "../_actions/locationAction";

/* Must have a list of options for each react-select dropdown.
Use eventKey to map to values of event properties.
Label is the corresponding value for the event key (property),
and it is the value displayed in the dropdown. */

class Filter extends React.Component {
	user = JSON.parse(localStorage.getItem("user"))
	calendarPermission = this.user.permission.filter(p => {
	    return (
	        p.indexOf("Calendar") !== -1 &&
			p.indexOf("Calendar") === p.length - "Calendar".length
	    );
	})[0]

	constructor(props, context) {
	    super(props, context);
	    const today = moment().toDate();
	    var userIdx = 0;
	    var defaultSearchPlaceholder = "";
	    if (this.calendarPermission === "patientCalendar") {
	        userIdx = 1;
	        defaultSearchPlaceholder = "therapy type";
	    } else if (this.calendarPermission === "therapistCalendar") {
	        userIdx = 2;
	        defaultSearchPlaceholder = "patient name";
	    } else {
	        defaultSearchPlaceholder = "patient name";
	    }

	    this.state = {
	        /* Filters saved as options (each with value, label and eventKey; see above). 
			The info displayed on the dropdown is the label. */
	        index: 0, // Set to 1 for date filter
	        userIndex: userIdx,
	        filters: [], // All filters we want to search with (of all types) -- tags
	        selectedFilterType: [], // Filter type list selected in Search By
	        allSelectedFilters: [], // All selected filters of current type
	        filterSearchPlaceholder: defaultSearchPlaceholder,
	        date: today,
	        dateObj: {
	            value: today,
	            label:
					today.getFullYear() +
					"-" +
					("0" + (today.getMonth() + 1)).slice(-2) +
					"-" +
					("0" + today.getDate()).slice(-2),
	        },
	        locationOptions: [],
	        therapistOptions: [],
	        patientOptions: [],
	        typeOptions: [],
	    };
	    this.toggleSearch = [this.renderSelect, this.renderDatepicker];
	    this.toggleSearchDropdown = [
	        this.renderAdminDropdown,
	        this.renderPatientDropdown,
	        this.renderTherapistDropdown,
	    ];
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
	        for (var tt in newProps.types) {
	            newProps.types[tt].eventKey = "therapyType";
	        }
	        if (this.calendarPermission === "patientCalendar") {
	            this.setState({
	                typeOptions: newProps.types,
	                selectedFilterType: newProps.types,
	            });
	        } else this.setState({ typeOptions: newProps.types });
	    }

	    if (newProps.locations) {
	        for (var l in newProps.locations) {
	            newProps.locations[l].eventKey = "location";
	        }
	        this.setState({ locationOptions: newProps.locations });
	    }

	    if (newProps.patients) {
	        for (var p in newProps.patients) {
	            newProps.patients[p].eventKey = "patient";
	        }
	        if (
	            this.calendarPermission === "therapistCalendar" ||
				this.calendarPermission === "adminCalendar"
	        ) {
	            this.setState({
	                patientOptions: newProps.patients,
	                selectedFilterType: newProps.patients,
	            });
	        } else this.setState({ patientOptions: newProps.patients });
	    }

	    if (newProps.therapists) {
	        for (var t in newProps.therapists) {
	            newProps.therapists[t].eventKey = "therapist";
	        }
	        this.setState({ therapistOptions: newProps.therapists });
	    }
	}

	isWeekday = date => {
	    const day = date.getDay();
	    return day !== 0 && day !== 6;
	}

	renderDatepicker = () => {
	    return (
	        <DatePicker
	            className="datepicker-field"
	            popperClassName="datepicker-popper"
	            selected={this.state.date}
	            filterDate={this.isWeekday}
	            dateFormat="yyyy-MM-dd"
	            autoFocus
	            onFocus={() =>
	                this.setState({ allSelectedFilters: [this.state.dateObj] })
	            }
	            onChange={date => this.handleSelectDate(date)}
	            placeholderText="Select date..."
	        />
	    );
	}

	renderSelect = () => {
	    return (
	        <Select
	            className="select-field"
	            options={this.state.selectedFilterType}
	            onChange={selected =>
	                this.setState({ allSelectedFilters: selected })
	            } // Can also pass action
	            isSearchable={true}
	            isMulti={true}
	            value={this.state.allSelectedFilters}
	            placeholder={
	                "Select " + this.state.filterSearchPlaceholder + "..."
	            }
	        />
	    );
	}

	renderAdminDropdown = () => {
	    return (
	        <NavDropdown
	            title="Search By"
	            className="search-by"
	            id="filter-nav-dropdown"
	            onSelect={selected => this.handleSelectSearch(selected)}>
	            <NavDropdown.Item eventKey="Patient Name">
					Patient Name
	            </NavDropdown.Item>
	            <NavDropdown.Item eventKey="Therapist Name">
					Therapist Name
	            </NavDropdown.Item>
	            <NavDropdown.Item eventKey="Therapy Type">
					Therapy Type
	            </NavDropdown.Item>
	            <NavDropdown.Item eventKey="Date">Date</NavDropdown.Item>
	            <NavDropdown.Item eventKey="Location">
					Location
	            </NavDropdown.Item>
	        </NavDropdown>
	    );
	}

	renderPatientDropdown = () => {
	    return (
	        <NavDropdown
	            title="Search By"
	            className="search-by"
	            id="filter-nav-dropdown"
	            onSelect={selected => this.handleSelectSearch(selected)}>
	            <NavDropdown.Item eventKey="Therapy Type">
					Therapy Type
	            </NavDropdown.Item>
	            <NavDropdown.Item eventKey="Therapist Name">
					Therapist Name
	            </NavDropdown.Item>
	            <NavDropdown.Item eventKey="Date">Date</NavDropdown.Item>
	        </NavDropdown>
	    );
	}

	renderTherapistDropdown = () => {
	    return (
	        <NavDropdown
	            title="Search By"
	            className="search-by"
	            id="filter-nav-dropdown"
	            onSelect={selected => this.handleSelectSearch(selected)}>
	            <NavDropdown.Item eventKey="Patient Name">
					Patient Name
	            </NavDropdown.Item>
	            <NavDropdown.Item eventKey="Therapy Type">
					Therapy Type
	            </NavDropdown.Item>
	            <NavDropdown.Item eventKey="Date">Date</NavDropdown.Item>
	            <NavDropdown.Item eventKey="Location">
					Location
	            </NavDropdown.Item>
	        </NavDropdown>
	    );
	}

	createDateObj = date => {
	    return {
	        value: date,
	        label:
				date.getFullYear() +
				"-" +
				("0" + (date.getMonth() + 1)).slice(-2) +
				"-" +
				("0" + date.getDate()).slice(-2),
	    };
	}

	handleSelectDate = date => {
	    const dateObj = this.createDateObj(date);
	    this.setState({
	        date: date,
	        dateObj: dateObj,
	        allSelectedFilters: [dateObj],
	    });
	}

	handleAddFilters = () => {
	    if (this.state.selectedFilterType === "start") {
	        // Limit date selection to one date only
	        if (
	            this.state.filters.filter(f => f.value instanceof Date === true)
	                .length > 0
	        ) {
	            // Already have one date filter; do not add more dates to filters
	            // TODO: warn user that only one date can be selected at the same time
	            return;
	        }
	    }
	    if (this.state.filters.length === 0) {
	        this.setState(
	            {
	                filters: this.state.allSelectedFilters,
	                allSelectedFilters: [],
	            },
	            this.updateCalendar
	        );
	    } else {
	        const newlyAdded = this.state.allSelectedFilters.filter(
	            f => !this.state.filters.includes(f)
	        );
	        this.setState(
	            {
	                filters: [...this.state.filters, ...newlyAdded],
	                allSelectedFilters: [],
	            },
	            this.updateCalendar
	        );
	    }
	}

	handleSelectSearch = selected => {
	    switch (selected) {
	    case "Patient Name":
	        this.setState(() => ({
	            index: 0,
	            selectedFilterType: this.state.patientOptions,
	            allSelectedFilters: [],
	            filterSearchPlaceholder: selected,
	            date: moment().toDate(),
	        }));
	        break;
	    case "Therapist Name":
	        this.setState(() => ({
	            index: 0,
	            selectedFilterType: this.state.therapistOptions,
	            allSelectedFilters: [],
	            filterSearchPlaceholder: selected,
	            date: moment().toDate(),
	        }));
	        break;
	    case "Therapy Type":
	        this.setState(() => ({
	            index: 0,
	            selectedFilterType: this.state.typeOptions,
	            allSelectedFilters: [],
	            filterSearchPlaceholder: selected,
	            date: moment().toDate(),
	        }));
	        break;
	    case "Date":
	        this.setState(() => ({
	            index: 1,
	            selectedFilterType: "start",
	            allSelectedFilters: [],
	            filterSearchPlaceholder: selected,
	            date: moment().toDate(),
	        }));
	        break;
	    case "Location":
	        this.setState(() => ({
	            index: 0,
	            selectedFilterType: this.state.locationOptions,
	            allSelectedFilters: [],
	            filterSearchPlaceholder: selected,
	            date: moment().toDate(),
	        }));
	        break;
	    default:
	        return null;
	    }
	}

	handleRemoveFilter = filterObj => {
	    const index = this.state.filters.indexOf(filterObj);
	    this.state.filters.splice(index, 1);
	    this.setState({ filters: [...this.state.filters] }, this.updateCalendar);
	}

	updateCalendar = () => {
	    this.props.handleFilterInput(this.state.filters);
	}

	render() {
	    const filters = this.state.filters;
	    let showFilterBar;
	    if (filters) {
	        showFilterBar = (
	            <Row>
	                <Navbar className="filter-tags" bg="light" expand="lg">
	                    <Nav>
	                        {this.state.filters.map(o => (
	                            <Alert
	                                className="tags"
	                                key={o.label}
	                                dismissible
	                                variant="dark"
	                                onClose={() => this.handleRemoveFilter(o)}>
	                                {o.label}
	                            </Alert>
	                        ))}
	                    </Nav>
	                </Navbar>
	            </Row>
	        );
	    } else {
	        showFilterBar = "";
	    }
	    return (
	        <div>
	            <Row>
	                <Navbar className="filterbar" bg="light" expand="lg">
	                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
	                    <Navbar.Collapse id="basic-navbar-nav">
	                        <Nav>
	                            {/* Render dropdown according to user type */}
	                            {this.toggleSearchDropdown[
	                                this.state.userIndex
	                            ]()}
	                        </Nav>
	                        <Nav>
	                            <NavItem className="filter-selection">
	                                {this.state.filterSearchPlaceholder}
	                            </NavItem>
	                        </Nav>
	                        {/* Render react-select for all filters except date -> render react-datepicker for date */}
	                        {this.toggleSearch[this.state.index]()}
	                        <Button
	                            variant="outline-dark"
	                            onClick={() => this.handleAddFilters()}>
								Search
	                        </Button>
	                    </Navbar.Collapse>
	                </Navbar>
	            </Row>
	            <Row>
	                <Navbar className="filter-tags" bg="light" expand="lg">
	                    <Nav>
	                        {this.state.filters.map(o => (
	                            <Alert
	                                className="tags"
	                                key={o.label}
	                                dismissible
	                                variant="dark"
	                                onClose={() => this.handleRemoveFilter(o)}
	                            >
	                                {o.label}
	                            </Alert>
	                        ))}
	                    </Nav>
	                </Navbar>
	            </Row>

	        </div>
	    );
	}
}

const mapStateToProps = state => ({
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

const FilterConnected = connect(mapStateToProps)(Filter);
export { FilterConnected as Filter };
