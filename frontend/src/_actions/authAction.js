import { LOGIN_SUCCESS, LOGIN_REQUEST, LOGIN_FAILURE, LOGOUT } from "../_constants/login.constants";
import {AuthService} from "../_services/authentication.service";

export const AuthActions = {
    login,
    logout
};

function login(email, password) {
    return dispatch => {
        dispatch(request({ email }));

        AuthService.login(email, password)
            .then(
                user => { 
                    dispatch(success(user));
                },
                error => {
                    dispatch(failure(error.toString()));
                    // TODO: maybe add alertAction to dispatch
                }
            );
    };
    function request(user) { return {type: LOGIN_REQUEST, user}; }
    function success(user) { return {type: LOGIN_SUCCESS, user}; }
    function failure(error) { return {type: LOGIN_FAILURE, error}; }
}

function logout() {
    AuthService.logout();
    return { type: LOGOUT };
}



