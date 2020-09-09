import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { GETALL_TABLE_SUCCESS, GETALL_TABLE_REQUEST, GETALL_TABLE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { LocationService } from "../_services/location.service";

export const LocationActions = {
    getAllLocations,
    getAllTableLocations,
    createLocation,
    updateLocation,
    archiveLocation
};

function getAllLocations() {
    return dispatch => {
        dispatch(request({ }));

        LocationService.getAllLocations()
            .then(
                locations => { 
                    dispatch(success(locations));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(locations) { return {type: GETALL_REQUEST, locations}; }
    function success(locations) { return {type: GETALL_SUCCESS, locations}; }
    function failure(error) { return {type: GETALL_FAILURE, error}; }
}

function getAllTableLocations() {
    return dispatch => {
        dispatch(request({ }));

        LocationService.getAllTableLocations()
            .then(
                locations => { 
                    dispatch(success(locations));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(locations) { return {type: GETALL_TABLE_REQUEST, locations}; }
    function success(locations) { return {type: GETALL_TABLE_SUCCESS, locations}; }
    function failure(error) { return {type: GETALL_TABLE_FAILURE, error}; }
}

function createLocation(location) {
    return dispatch => {
        dispatch(request({ location }));
        return LocationService.addNewLocation(location)
            .then(
                location => { 
                    dispatch(success(location));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(location) { return {type: CREATE_REQUEST, location}; }
    function success(location) { return {type: CREATE_SUCCESS, location}; }
    function failure(error) { return {type: CREATE_FAILURE, error}; }
}

function updateLocation(info) {
    return dispatch => {
        dispatch(request({ info }));

        return LocationService.updateLocation(info)
            .then(
                location => { 
                    dispatch(success(location));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(location) { return {type: UPDATE_REQUEST, location}; }
    function success(location) { return {type: UPDATE_SUCCESS, location}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function archiveLocation(id) {
    return dispatch => {
        dispatch(request({ id }));

        return LocationService.archiveLocation(id)
            .then(
                location => { 
                    dispatch(success(location));
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };
    function request(location) { return {type: UPDATE_REQUEST, location}; }
    function success(location) { return {type: UPDATE_SUCCESS, location}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}