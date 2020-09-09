import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { PatientRecordService } from "../_services/patientRecord.service";

export const PatientRecordActions = {
    createPatientRecord,
    updatePatientRecord,
    archivePatientRecord
};

function createPatientRecord(record) {
    return dispatch => {
        dispatch(request({ record }));
        PatientRecordService.createNewRecord(record)
            .then(
                record => { 
                    dispatch(success(record));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(record) { return {type: CREATE_REQUEST, record}; }
    function success(record) { return {type: CREATE_SUCCESS, record}; }
    function failure(error) { return {type: CREATE_FAILURE, error}; }
}

function updatePatientRecord(info) {
    return dispatch => {
        dispatch(request({ info }));

        PatientRecordService.updateRecordById(info)
            .then(
                patient => { 
                    dispatch(success(patient));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(record) { return {type: UPDATE_REQUEST, record}; }
    function success(record) { return {type: UPDATE_SUCCESS, record}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function archivePatientRecord(recordId) {
    return dispatch => {
        dispatch(request({ recordId }));

        PatientRecordService.archivePatientRecord(recordId)
            .then(
                record => { 
                    dispatch(success(record));
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };
    function request(record) { return {type: UPDATE_REQUEST, record}; }
    function success(record) { return {type: UPDATE_SUCCESS, record}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}