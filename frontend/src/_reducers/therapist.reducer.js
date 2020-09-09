import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";

export function therapists(state = {}, action) {
    switch (action.type) {
    case CREATE_SUCCESS:
        return {
            therapist: action.therapist
        };
    case CREATE_REQUEST:
        return { creating: true };
    case CREATE_FAILURE:
        return {
            error: action.error
        };
    // Get all 
    case GETALL_SUCCESS:
        return {
            loading: false,
            items: action.therapists
        };
    case GETALL_REQUEST:
        return {
            loading: true,
        };
    case GETALL_FAILURE:
        return { 
            error: action.error
        };
    case UPDATE_SUCCESS:
        return {
            updating: false,
            updated: action.therapist
        };
    case UPDATE_REQUEST:
        return {
            updating: true,
        };
    case UPDATE_FAILURE:
        return { 
            error: true
        };
    default:
        return state;
    }
}