import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";

export function patients(state = {}, action) {
    switch (action.type) {
    case CREATE_SUCCESS:
        return {
            creating: false,
            patient: action.patient
        };
    case CREATE_REQUEST:
        return { creating: true };
    case CREATE_FAILURE:
        return {
            errorCreate: true
        };
        // Get all
    case GETALL_SUCCESS:
        return {
            loading: false,
            items: action.patients
        };
    case GETALL_REQUEST:
        return {
            loading: true
        };
    case GETALL_FAILURE:
        return {
            errorGet: true
        };
    // Update
    case UPDATE_SUCCESS:
        return {
            updating: false,
            patientUpdate: action.patient
        };
    case UPDATE_REQUEST:
        return {
            updating: true,
        };
    case UPDATE_FAILURE:
        return { 
            errorUpdate: true
        };
    default:
        return state;
    }
}
