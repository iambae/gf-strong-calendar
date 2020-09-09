import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";

export function clerks(state = {}, action) {
    switch (action.type) {
    case CREATE_SUCCESS:
        return {
            clerk: action.clerk
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
            items: action.clerks
        };
    case GETALL_REQUEST:
        return {
            loading: true,
        };
    case GETALL_FAILURE:
        return { 
            error: true,
        };
    // Update
    case UPDATE_SUCCESS:
        return {
            updating: false,
            updated: true
        };
    case UPDATE_REQUEST:
        return {
            updating: true,
        };
    case UPDATE_FAILURE:
        return { 
            error: action.error
        };
    default:
        return state;
    }
}