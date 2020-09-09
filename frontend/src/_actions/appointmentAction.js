import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { AppointmentService } from "../_services/appointment.service";

export const AppointmentActions = {
    getAllAppointments,
    createAppointment,
    updateAppointment,
    getAppointments
};

function createAppointment(appointment) {
    return dispatch => {
        dispatch(request({ appointment }));
        AppointmentService.addNewAppointment(appointment)
            .then(
                appointment => { 
                    dispatch(success(appointment));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(appointment) { return {type: CREATE_REQUEST, appointment}; }
    function success(appointment) { return {type: CREATE_SUCCESS, appointment}; }
    function failure(error) { return {type: CREATE_FAILURE, error}; }
}

function updateAppointment(appointmentId) {
    return dispatch => {
        dispatch(request({ appointmentId }));

        AppointmentService.updateAppointment(appointmentId)
            .then(
                appointment => { 
                    dispatch(success(appointment));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(appointment) { return {type: UPDATE_REQUEST, appointment}; }
    function success(appointment) { return {type: UPDATE_SUCCESS, appointment}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function getAppointments(filter) {
    return dispatch => {
        dispatch(request({ filter }));

        AppointmentService.getAppointments(filter)
            .then(
                appointments => { 
                    dispatch(success(appointments));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(appointments) { return {type: GETALL_REQUEST, appointments}; }
    function success(appointments) { return {type: GETALL_SUCCESS, appointments}; }
    function failure(error) { return {type: GETALL_FAILURE, error}; }
}

function getAllAppointments() {
    return dispatch => {
        dispatch(request({ }));
    
        AppointmentService.getAllAppointments()
            .then(
                appointments => { 
                    dispatch(success(appointments));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(appointments) { return {type: GETALL_REQUEST, appointments}; }
    function success(appointments) { return {type: GETALL_SUCCESS, appointments}; }
    function failure(error) { return {type: GETALL_FAILURE, error}; }
}