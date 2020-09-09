import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { GET_SUCCESS, GET_REQUEST, GET_FAILURE} from "../_constants/record.constants";
import { ClerkService } from "../_services/clerk.service";

export const ClerkActions = {
    createClerk,
    updateClerk,
    getAllClerks,
    getClerk,
    archiveClerk
};

function createClerk(clerk) {
    return dispatch => {
        dispatch(request({ clerk }));
        ClerkService.registerNewClerk(clerk)
            .then(
                clerk => { 
                    dispatch(success(clerk));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(clerk) { return {type: CREATE_REQUEST, clerk}; }
    function success(clerk) { return {type: CREATE_SUCCESS, clerk}; }
    function failure(error) { return {type: CREATE_FAILURE, error}; }
}

function updateClerk(clerkInfo) {
    return dispatch => {
        dispatch(request({ clerkInfo }));

        ClerkService.updateClerk(clerkInfo)
            .then(
                clerk => { 
                    dispatch(success(clerk));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(clerk) { return {type: UPDATE_REQUEST, clerk}; }
    function success(clerk) { return {type: UPDATE_SUCCESS, clerk}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function getAllClerks() {
    return dispatch => {
        dispatch(request({ }));

        ClerkService.getAllClerks()
            .then(
                clerks => { 
                    dispatch(success(clerks));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(clerks) { return {type: GETALL_REQUEST, clerks}; }
    function success(clerks) { return {type: GETALL_SUCCESS, clerks}; }
    function failure(error) { return {type: GETALL_FAILURE, error}; }
}

function getClerk(clerkId) {
    return dispatch => {
        dispatch(request({ clerkId }));

        ClerkService.getPatientById(clerkId)
            .then(
                clerk => { 
                    dispatch(success(clerk));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(clerkId) { return {type: GET_REQUEST, clerkId}; }
    function success(clerk) { return {type: GET_SUCCESS, clerk}; }
    function failure(error) { return {type: GET_FAILURE, error}; }
}

function archiveClerk(id) {
    return dispatch => {
        dispatch(request({ id }));

        ClerkService.archiveClerk(id)
            .then(
                clerk => { 
                    dispatch(success(clerk));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(clerk) { return {type: UPDATE_REQUEST, clerk}; }
    function success(clerk) { return {type: UPDATE_SUCCESS, clerk}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}