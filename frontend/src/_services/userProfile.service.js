import authHeader from "../_helpers/authHeader";

const baseUrl = 
    process.env.NODE_ENV === "production"
        ? "https://gf-strong-calendar.appspot.com/api"
        : "http://localhost:3000/api";

const api_url = baseUrl + "/users";

export const UserProfileService = {
    updateUserInfo,
    resetPassword,
    getUserInfo
};

async function updateUserInfo(userID, userInfo) {
    const options = {
        method: "PUT",
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            ...authHeader()
        },
        body: JSON.stringify(userInfo)
    };
    return fetch(api_url + "/user/" + userID, options).then(response => {
        return handleResponse(response);
    });
}

async function resetPassword(userID, userInfo) {
    const options = {
        method: "PUT",
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            ...authHeader()
        },
        body: JSON.stringify(userInfo)
    };
    return fetch(api_url + "/reset_pass/" + userID, options).then(response => {
        return handleResponse(response);
    });
}

async function getUserInfo(userID) {
    const options = {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            ...authHeader()
        },
    };
    return fetch(api_url + "/user/" + userID, options).then(response => {
        return handleResponse(response);
    });
}


function handleResponse(response) {
    return new Promise((resolve, reject) => {
        if (!response.ok) {
            if (response.status === 401) {
                // logout();
            }
            const error = (response.data && response.data.message) || response.statusText;
            reject(error);
        } else {
            resolve(response.json());
        }
    })
        .then(value => {
            return value;
        });
}
