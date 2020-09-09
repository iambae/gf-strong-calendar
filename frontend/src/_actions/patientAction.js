import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { GET_SUCCESS, GET_REQUEST, GET_FAILURE} from "../_constants/record.constants";
import { PatientService } from "../_services/patient.service";

export const PatientActions = {
    createPatient,
    updatePatient,
    getAllPatients,
    getPatients,
    archivePatient
};

function createPatient(patient) {
    return dispatch => {
        dispatch(request({ patient }));
        return PatientService.registerNewPatient(patient)
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
    function request(patient) { return {type: CREATE_REQUEST, patient}; }
    function success(patient) { return {type: CREATE_SUCCESS, patient}; }
    function failure(error) { return {type: CREATE_FAILURE, error}; }
}

function updatePatient(info) {
    return dispatch => {
        dispatch(request({ info }));

        return PatientService.updatePatient(info)
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
    function request(patient) { return {type: UPDATE_REQUEST, patient}; }
    function success(patient) { return {type: UPDATE_SUCCESS, patient}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function archivePatient(id) {
    return dispatch => {
        dispatch(request({ id }));

        return PatientService.archivePatient(id)
            .then(
                patient => { 
                    dispatch(success(patient));
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };
    function request(patient) { return {type: UPDATE_REQUEST, patient}; }
    function success(patient) { return {type: UPDATE_SUCCESS, patient}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function getAllPatients() {
    return dispatch => {
        dispatch(request({ }));

        return PatientService.getAllPatients()
            .then(
                patients => { 
                    dispatch(success(patients));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(patients) { return {type: GETALL_REQUEST, patients}; }
    function success(patients) { return {type: GETALL_SUCCESS, patients}; }
    function failure(error) { return {type: GETALL_FAILURE, error}; }
}

function getPatients(patientId) {
    return dispatch => {
        dispatch(request({ patientId }));

        return PatientService.getPatientById(patientId)
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
    function request(patientId) { return {type: GET_REQUEST, patientId}; }
    function success(patient) { return {type: GET_SUCCESS, patient}; }
    function failure(error) { return {type: GET_FAILURE, error}; }
}