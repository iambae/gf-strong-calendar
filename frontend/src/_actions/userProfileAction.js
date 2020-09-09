import {
    UPDATE_SUCCESS,
    UPDATE_REQUEST,
    UPDATE_FAILURE,
    GET_REQUEST,
    GET_SUCCESS,
    GET_FAILURE
} from "../_constants/record.constants";
import { UserProfileService } from "../_services/userProfile.service";

export const UserProfileActions = {
    updateUserInfo,
    resetPassword,
    getUserInfo
};

function updateUserInfo(userID, userInfo) {
    return dispatch => {
        dispatch(request({  }));

        UserProfileService.updateUserInfo(userID, userInfo)
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
    function request(userInfo) { return {type: UPDATE_REQUEST, userInfo}; }
    function success(userInfo) { return {type: UPDATE_SUCCESS, userInfo}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function resetPassword(userID, userInfo) {
    return dispatch => {
        dispatch(request({  }));

        UserProfileService.resetPassword(userID, userInfo)
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
    function request(userInfo) { return {type: UPDATE_REQUEST, userInfo}; }
    function success(userInfo) { return {type: UPDATE_SUCCESS, userInfo}; }
    function failure(error) { return {type: UPDATE_FAILURE, error}; }
}

function getUserInfo(userID) {
    return dispatch => {
        dispatch(request({  }));

        UserProfileService.getUserInfo(userID)
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
    function request(user) { return {type: GET_REQUEST, user}; }
    function success(user) { return {type: GET_SUCCESS, user}; }
    function failure(error) { return {type: GET_FAILURE, error}; }
}