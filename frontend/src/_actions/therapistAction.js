import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { GET_SUCCESS, GET_REQUEST, GET_FAILURE} from "../_constants/record.constants";
import { TherapistService } from "../_services/therapist.service";

export const TherapistActions = {
    createTherapist,
    updateTherapist,
    getAllTherapists,
    getTherapist,
    archiveTherapist
};

function createTherapist(therapist) {
    return dispatch => {
        dispatch(request({ therapist }));
        TherapistService.registerNewTherapist(therapist)
            .then(
                therapist => { 
                    dispatch(success(therapist));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(therapist) { return {type: CREATE_REQUEST, therapist}; }
    function success(therapist) { return {type: CREATE_SUCCESS, therapist}; }
    function failure(error) { return {type: CREATE_FAILURE, error}; }
}

function updateTherapist(therapistInfo) {
    return dispatch => {
        dispatch(request({ therapistInfo }));

        TherapistService.updateTherapist(therapistInfo)
            .then(
                therapist => { 
                    dispatch(success(therapist));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(therapist) { return {type: UPDATE_REQUEST, therapist}; }
    function success(therapist) { return {type: UPDATE_SUCCESS, therapist}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function archiveTherapist(therapistId) {
    return dispatch => {
        dispatch(request({ therapistId }));

        TherapistService.archiveTherapist(therapistId)
            .then(
                therapist => { 
                    dispatch(success(therapist));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(therapist) { return {type: UPDATE_REQUEST, therapist}; }
    function success(therapist) { return {type: UPDATE_SUCCESS, therapist}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function getAllTherapists() {
    return dispatch => {
        dispatch(request({ }));

        TherapistService.getAllTherapists()
            .then(
                therapists => { 
                    dispatch(success(therapists));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(therapists) { return {type: GETALL_REQUEST, therapists}; }
    function success(therapists) { return {type: GETALL_SUCCESS, therapists}; }
    function failure(error) { return {type: GETALL_FAILURE, error}; }
}

function getTherapist(therapistId) {
    return dispatch => {
        dispatch(request({ therapistId }));

        TherapistService.getPatientById(therapistId)
            .then(
                therapist => { 
                    dispatch(success(therapist));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(therapistId) { return {type: GET_REQUEST, therapistId}; }
    function success(therapist) { return {type: GET_SUCCESS, therapist}; }
    function failure(error) { return {type: GET_FAILURE, error}; }
}