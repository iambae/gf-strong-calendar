import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";
import { GET_SUCCESS, GET_REQUEST, GET_FAILURE} from "../_constants/record.constants";

export function userProfiles(state = {}, action) {
    switch (action.type) {
    case UPDATE_SUCCESS:
        return {
            loading: false,
            success: true
        };
    case UPDATE_REQUEST:
        return {
            loading: true,
        };
    case UPDATE_FAILURE:
        return {
            error: true
        };
    case GET_SUCCESS:
        return {
            loading: false,
            user: action.user
        };
    case GET_REQUEST:
        return {
            loading: true,
        };
    case GET_FAILURE:
        return {
            error: true
        };
    default:
        return state;
    }
}