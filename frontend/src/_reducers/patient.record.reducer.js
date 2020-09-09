
import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";

export function records(state = {}, action) {
    switch (action.type) {
    case CREATE_SUCCESS:
        return {
            creating: false,
            record: action.record
        };
    case CREATE_REQUEST:
        return { creating: true };
    case CREATE_FAILURE:
        return {
            error: true
        };
        // Update
    case UPDATE_SUCCESS:
        return {
            updating: false,
            recordUpdate: action.record
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
