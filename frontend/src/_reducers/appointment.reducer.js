import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";

export function appointments(state = {}, action) {
    switch (action.type) {
    case CREATE_SUCCESS:
        return {
            appointment: action.appointment
        };
    case CREATE_REQUEST:
        return { creating: true };
    case CREATE_FAILURE:
        return {
            error: true
        };
    // Get all 
    case GETALL_SUCCESS:
        return {
            items: action.appointments
        };
    case GETALL_REQUEST:
        return {
            loading: true
        };
    case GETALL_FAILURE:
        return { 
            error: true
        };
    // Update 
    case UPDATE_SUCCESS:
        return {
            updated: true
        };
    case UPDATE_REQUEST:
        return {
            updating: true
        };
    case UPDATE_FAILURE:
        return { 
            error: true
        };
    default:
        return state;
    }
}