import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { GETALL_TABLE_SUCCESS, GETALL_TABLE_REQUEST, GETALL_TABLE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { TypeService } from "../_services/type.service";

export const TypeActions = {
    getAllTypes,
    getAllTableTypes,
    updateType,
    archiveType,
    createType
};

function getAllTypes() {
    return dispatch => {
        dispatch(request({ }));

        TypeService.getAllTypes()
            .then(
                types => { 
                    dispatch(success(types));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(types) { return {type: GETALL_REQUEST, types}; }
    function success(types) { return {type: GETALL_SUCCESS, types}; }
    function failure(error) { return {type: GETALL_FAILURE, error}; }
}


function getAllTableTypes() {
    return dispatch => {
        dispatch(request({ }));

        TypeService.getAllTableTypes()
            .then(
                types => { 
                    dispatch(success(types));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(types) { return {type: GETALL_TABLE_REQUEST, types}; }
    function success(types) { return {type: GETALL_TABLE_SUCCESS, types}; }
    function failure(error) { return {type: GETALL_TABLE_FAILURE, error}; }
}

function createType(type) {
    return dispatch => {
        dispatch(request({ type }));
        return TypeService.addNewType(type)
            .then(
                type => { 
                    dispatch(success(type));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(newType) { return {type: CREATE_REQUEST, newType}; }
    function success(newType) { return {type: CREATE_SUCCESS, newType}; }
    function failure(error) { return {type: CREATE_FAILURE, error}; }
}

function updateType(info) {
    return dispatch => {
        dispatch(request({ info }));

        return TypeService.updateType(info)
            .then(
                type => { 
                    dispatch(success(type));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(newType) { return {type: UPDATE_REQUEST, newType}; }
    function success(newType) { return {type: UPDATE_SUCCESS, newType}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function archiveType(id) {
    return dispatch => {
        dispatch(request({ id }));

        return TypeService.archiveType(id)
            .then(
                type => { 
                    dispatch(success(type));
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };
    function request(newType) { return {type: UPDATE_REQUEST, newType}; }
    function success(newType) { return {type: UPDATE_SUCCESS, newType}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}