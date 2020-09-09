import { LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT } from "../_constants/login.constants";

//const user = JSON.parse(localStorage.getItem("user"));
const initialState = {};

export function authentication(state = initialState, action) {
    switch (action.type) {
    // Updates the state to the information that
    // the user is using to log in
    case LOGIN_REQUEST:
        return {
            loggingIn: true
        };
    case LOGIN_SUCCESS:
        return {
            loggedIn: true,
            user: action.user
        };
    case LOGIN_FAILURE:
        return {
            error: true
        };
    case LOGOUT:
        return {};
        // If action type is not known, return previous state
    default:
        return state;
    }
}
