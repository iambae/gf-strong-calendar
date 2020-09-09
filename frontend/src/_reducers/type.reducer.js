import { CREATE_SUCCESS, CREATE_REQUEST, CREATE_FAILURE } from "../_constants/record.constants";
import { GETALL_SUCCESS, GETALL_REQUEST, GETALL_FAILURE} from "../_constants/record.constants";
import { GETALL_TABLE_SUCCESS, GETALL_TABLE_REQUEST, GETALL_TABLE_FAILURE} from "../_constants/record.constants";
import { UPDATE_SUCCESS, UPDATE_REQUEST, UPDATE_FAILURE} from "../_constants/record.constants";

export function types(state = {}, action) {
    switch (action.type) { 
    case CREATE_SUCCESS:
        return {
            creating: false,
            type: action.newType
        };
    case CREATE_REQUEST:
        return {
            creating: true,
        };
    case CREATE_FAILURE:
        return { 
            error: true
        };
    case UPDATE_SUCCESS:
        return {
            updating: false,
            updatedType: action.newType
        };
    case UPDATE_REQUEST:
        return {
            updating: true,
        };
    case UPDATE_FAILURE:
        return { 
            error: true
        };
    case GETALL_TABLE_SUCCESS:
        return {
            loadingTable: false,
            types: action.types
        };
    case GETALL_TABLE_REQUEST:
        return {
            loadingTable: true,
        };
    case GETALL_TABLE_FAILURE:
        return { 
            error: true
        };
    case GETALL_SUCCESS:
        return {
            loading: false,
            items: action.types
        };
    case GETALL_REQUEST:
        return {
            loading: true,
        };
    case GETALL_FAILURE:
        return { 
            error: action.error
        };
    default:
        return state;
    }
}