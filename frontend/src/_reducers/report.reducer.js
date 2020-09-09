import { GET_SUCCESS, GET_REQUEST, GET_FAILURE} from "../_constants/record.constants";

export function reports(state = {}, action) {
    switch (action.type) {
    // GET
    case GET_SUCCESS:
        return {
            report: action.report
        };
    case GET_REQUEST:
        return {
            creating: true
        };
    case GET_FAILURE:
        return {
            error: action.error
        };
    default:
        return state;
    }
}
