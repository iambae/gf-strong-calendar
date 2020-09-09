import React from "react";
import BigCalendar from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import cn from "classnames";
import moment from "moment";
import { AddAppointment } from "../modals/AddAppointment";
import { EditAppointment } from "../modals/EditAppointment";
import "./Calendar.css";
import { connect } from "react-redux";
import { AppointmentActions } from "../_actions/appointmentAction.js";
import { PatientActions } from "../_actions/patientAction";
import { TherapistActions } from "../_actions/therapistAction";
import { LocationActions } from "../_actions/locationAction";
import { TypeActions } from "../_actions/typeAction.js";

moment.locale("en");
const localizer = BigCalendar.momentLocalizer(moment);

let navigate = {
    PREVIOUS: "PREV",
    NEXT: "NEXT",
    TODAY: "TODAY",
    DATE: "DATE",
};

const backArrow = "<";

// Get therapist, patient, location, therapy type names to render on calendar -- TEMP SOLUTION, WAIT FOR ENDPOINT CHANGE
var therapistNames = [];
var patientNames = [];
var locationNames = [];
var typeNames = [];

function Appointment({ event }) {
    // Create title string with all patient names and therapy type
    var titleString = "";
    var patientString = "";
    var therapistString = "";
    // TODO: set max number of patient names to display?
    for (var i = 0; i < event.patient.length; i++) {
        const patient = patientNames
            .filter(pair => event.patient[i] === pair[1])
            .map(name => name[0]);
        if (i === event.patient.length - 1) {
            //patientString += event.patient[i];
            patientString += patient;
        } else patientString += patient + ", "; //patientString += event.patient[i] + ", ";
    }
    // TODO: set max number of therapist names to display?
    for (var j = 0; j < event.therapist.length; j++) {
        const therapist = therapistNames
            .filter(pair => event.therapist[j] === pair[1])
            .map(name => name[0]);
        if (j === event.therapist.length - 1) {
            //therapistString += event.therapist[j];
            therapistString += therapist;
        } else therapistString += therapist + ", "; //therapistString += event.therapist[j] + ", ";
    }
    //titleString = event.therapyType + ": " + patientString;
    titleString =
		typeNames.filter(tt => tt[1] === event.therapyType).map(t => t[0]) +
		": " +
		patientString;
    const locationString = locationNames
        .filter(lo => lo[1] === event.location)
        .map(l => l[0]); //event.location.toString() instead
    return (
        <span className="appointment-text">
            <strong>{titleString}</strong>
            <span>{event.therapist && "Therapist: " + therapistString}</span>
            <span>{event.location && "Location: " + locationString}</span>
        </span>
    );
}

class CustomToolbar extends React.Component {
    render() {
        let {
            localizer: { messages },
            label,
        } = this.props;
        return (
            <div className="rbc-toolbar">
                <span className="rbc-btn-group">
                    <button
                        type="button"
                        onClick={this.navigate.bind(null, navigate.PREVIOUS)}>
                        {backArrow}
                    </button>
                    <button
                        type="button"
                        onClick={this.navigate.bind(null, navigate.TODAY)}>
                        {messages.today}
                    </button>
                    <button
                        type="button"
                        onClick={this.navigate.bind(null, navigate.NEXT)}>
						>
                    </button>
                </span>
                <span className="rbc-toolbar-label">
                    <strong>{label}</strong>
                </span>
                <span className="rbc-btn-group">
                    {this.viewNamesGroup(messages)}
                </span>
            </div>
        );
    }

	navigate = action => {
	    this.props.onNavigate(action);
	}

	view = view => {
	    this.props.onView(view);
	}

	viewNamesGroup(messages) {
	    let viewNames = this.props.views;
	    const view = this.props.view;

	    if (viewNames.length > 1) {
	        return viewNames.map(name => (
	            <button
	                type="button"
	                key={name}
	                className={cn({ "rbc-active": view === name })}
	                onClick={this.view.bind(null, name)}>
	                {messages[name]}
	            </button>
	        ));
	    }
	}
}

var slotInfo = { start: "", end: "" };

class Calendar extends React.Component {
	user = JSON.parse(localStorage.getItem("user"))
	calendarPermission = this.user.permission.filter(p => {
	    return (
	        p.indexOf("Calendar") !== -1 &&
			p.indexOf("Calendar") === p.length - "Calendar".length
	    );
	})[0]
	currentUserAppointments = []

	constructor(props, context) {
	    super(props, context);
	    this.state = {
	        view: "work_week",
	        date: moment().toDate(),
	        appointments: this.currentUserAppointments,
	        selectedEvent: "", // Get appointment id
	        addAptPop: false,
	        editAptPop: false,
	        typeColours: {},
	    };
	}

	componentDidMount() {
	    this.props.dispatch(PatientActions.getAllPatients());
	    this.props.dispatch(TherapistActions.getAllTherapists());
	    this.props.dispatch(TypeActions.getAllTypes());
	    this.props.dispatch(TypeActions.getAllTableTypes());
	    this.props.dispatch(LocationActions.getAllLocations());
	    if (this.calendarPermission === "adminCalendar")
	        this.props.dispatch(AppointmentActions.getAllAppointments());
	    else
	        this.props.dispatch(
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

	    /*
        if (newProps.currentUser) {
            this.user = newProps.currentUser;
            this.calendarPermission = this.user.permission.filter(p => {return p.indexOf("Calendar") !== -1 && (p.indexOf("Calendar") === p.length - "Calendar".length);})[0];
		}
		*/

	    if (newProps.appointments) {
	        this.currentUserAppointments = this.parseAppointments(
	            newProps.appointments
	        );
	        this.setState({
	            appointments: this.state.appointments.push(
	                this.currentUserAppointments
	            ),
	        });
	    }
		
	    if (newProps.allTypes) {
	        var colours = {};
	        for (var id in newProps.allTypes) {
	            colours[newProps.allTypes[id].typeId] = newProps.allTypes[id].color;
	        }
	        this.setState({
	            typeColours: colours
	        });
	    }

	    if (newProps.types) {
	        // quick fix to test: map therapy type id to name
	        typeNames = newProps.types.map(l => {
	            return [l.label, l.key];
	        });
	        this.setState({
	            typeOptions: newProps.types,
	        });
	    }

	    if (newProps.locations) {
	        // quick fix to test: map location id to name
	        locationNames = newProps.locations.map(l => {
	            return [l.label, l.key];
	        });
	        this.setState({
	            locationOptions: newProps.locations,
	        });
	    }

	    if (newProps.patients) {
	        // quick fix to test: map patient id to name
	        patientNames = newProps.patients.map(p => {
	            return [p.firstName, p.patientId];
	        });

	        this.setState({
	            patientOptions: newProps.patients,
	        });
	    }

	    if (newProps.therapists) {
	        // quick fix to test: map therapist id to name
	        therapistNames = newProps.therapists.map(t => {
	            return [t.firstName, t.therapistId];
	        });

	        this.setState({
	            therapistOptions: newProps.therapists,
	        });
	    }

	    if (newProps.filters) {
	        this.handleFilterInput(newProps.filters);
	    }
	}

	parseAppointments = dbApps => {
	    var allParsed = [];
	    for (var app in dbApps) {
	        const patients = dbApps[app].patients;
	        const therapists = dbApps[app].therapists;
	        const startValue = moment(dbApps[app].startTime).toDate();
	        const endValue = moment(dbApps[app].endTime).toDate();
	        const idValue = dbApps[app].appointmentId;
	        const location = dbApps[app].locationId;
	        const therapyType = dbApps[app].typeId;
	        allParsed.push({
	            id: idValue,
	            start: startValue,
	            end: endValue,
	            patient: patients,
	            therapist: therapists,
	            location: location,
	            therapyType: therapyType,
	            title: therapyType + ": " + patients,
	        });
	    }
	    return allParsed;
	}

	handleClose = () => {
	    this.setState(() => ({
	        addAptPop: false,
	        editAptPop: false,
	    }));
	}

	//  Click and drag to select slot and create event
	handleSelectSlot = slot => {
	    if (this.calendarPermission === "adminCalendar") {
	        if (slot.action === "select") {
	            slotInfo = { start: slot.start, end: slot.end };
	            // Show AddAppointment modal to enter new event details
	            this.setState(() => ({
	                addAptPop: true,
	            }));
	        }
	    }
	}

	getAppointments = () => {
	    this.props.dispatch(AppointmentActions.getAllAppointments());
	}

	// Double click on existing event to view/edit details
	handleSelectEvent = event => {
	    // Show EditAppointment modal to view event details
	    if (this.calendarPermission === "adminCalendar") {
	        this.setState({
	            editAptPop: true,
	            selectedEvent: event.id,
	        });
	    }
	}

	eventStyleGetter = event => {
	    return {
	        style: {
	            backgroundColor: this.state.typeColours[event.therapyType],
	            borderColor: this.state.typeColours[event.therapyType],
	        },
	    };
	}

	handleFilterInput = (filterProp) => {
	    const filters = filterProp;
	    const apps = this.currentUserAppointments;
	    /* Update calendar based on filter state passed in Filter.js.
		Use filter eventKey to match event values -- using key instead of label now. 
		This is an OR filter. */
	    var filteredEvents = [];
	    var dateFilter = "";
	    for (var a in apps) {
	        for (var f in filters) {
	            var comparisonEvent = apps[a][filters[f].eventKey];
	            if (filters[f].eventKey === "patient") {
	                if (comparisonEvent.indexOf(filters[f].patientId) !== -1) {
	                    filteredEvents.push(apps[a]);
	                    continue;
	                }
	            } else if (filters[f].eventKey === "therapist") {
	                if (comparisonEvent.indexOf(filters[f].therapistId) !== -1) {
	                    filteredEvents.push(apps[a]);
	                    continue;
	                }
	            } else if (filters[f].value instanceof Date) {
	                dateFilter = filters[f].value;
	                // Transform event Date object into filter date string format for comparison
	                comparisonEvent =
						apps[a].start.getFullYear() +
						"-" +
						("0" + (apps[a].start.getMonth() + 1)).slice(-2) +
						"-" +
						("0" + apps[a].start.getDate()).slice(-2);
	                if (comparisonEvent === filters[f].label) filteredEvents.push(apps[a]);
	            } else if (comparisonEvent === filters[f].key) {
	                filteredEvents.push(apps[a]);
	            }
	        }
	    }
	    this.filterAppointments(filteredEvents, dateFilter);
	}

	filterAppointments = (filteredEvents, dateFilter) => {
	    var newAppointments = [];
	    if (filteredEvents.length === 0) {
	        // TODO: warn user no appointment was found
	        //if (this.calendarPermission === "patientCalendar" || this.calendarPermission === "therapistCalendar") {
	        newAppointments = this.currentUserAppointments;
	        //}
	    } else newAppointments = filteredEvents;
	    this.setState(() => ({
	        appointments: newAppointments,
	    }));
	    // Display date on calendar corresponding to date filter
	    if (dateFilter) this.setState(() => ({ date: dateFilter }));
	}

	render() {
	    return (
	        <div>
	            <div>
	                {/* Display AddAppointment modal when creating new event */}
	                {this.state.addAptPop && (
	                    <AddAppointment
	                        onHide={this.handleClose}
	                        addAppointment={this.getAppointments}
	                        appointmentInfo={slotInfo}
	                    />
	                )}
	            </div>
	            <div>
	                {/* Display EditAppointment modal when double clicking an event */}
	                {this.state.editAptPop && (
	                    <EditAppointment
	                        onHide={this.handleClose}
	                        editCalendar={this.getAppointments}
	                        appointmentInfo={
	                            this.state.appointments.filter(app => {
	                                return app.id === this.state.selectedEvent;
	                            })[0]
	                        }
	                    />
	                )}
	            </div>
	            <div id={"calendar"} style={{ height: 900 }}>
	                <BigCalendar
	                    localizer={localizer}
	                    step={30}
	                    timeslots={2}
	                    events={this.state.appointments}
	                    eventPropGetter={this.eventStyleGetter}
	                    style={{ height: 700 }}
	                    components={{
	                        event: Appointment,
	                        toolbar: CustomToolbar,
	                    }}
	                    views={["month", "work_week", "day"]}
	                    selectable={this.calendarPermission === "adminCalendar"}
	                    onSelectSlot={slotInfo =>
	                        this.handleSelectSlot(slotInfo)
	                    }
	                    onDoubleClickEvent={event =>
	                        this.handleSelectEvent(event)
	                    }
	                    defaultView={this.state.view}
	                    date={this.state.date}
	                    min={
	                        new Date(
	                            this.state.date.getFullYear(),
	                            this.state.date.getMonth(),
	                            this.state.date.getDay(),
	                            8
	                        )
	                    }
	                    max={
	                        new Date(
	                            this.state.date.getFullYear(),
	                            this.state.date.getMonth(),
	                            this.state.date.getDay(),
	                            18
	                        )
	                    }
	                    onView={() => { }}
	                    onNavigate={date => this.setState({ date })}
	                />
	            </div>
	        </div>
	    );
	}
}

const mapStateToProps = state => ({
    appointments: state.appointments.items,
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
    allTypes: state.types.types,
    typeLoading: state.types.loading,
    typeError: state.types.error,
    //currentUser: state.authentication.user,
});

const CalendarConnected = connect(mapStateToProps)(Calendar);
export { CalendarConnected as Calendar };
