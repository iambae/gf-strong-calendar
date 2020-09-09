const baseUrl = process.env.NODE_ENV === "production" ? "https://gf-strong-calendar.appspot.com/api" : "http://localhost:3000/api";
const api_url = baseUrl + "/admins";

export const ClerkService = {
    registerNewClerk,
    getAllClerks,
    getClerkById,
    updateClerk,
    archiveClerk
};

async function getAllClerks() {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken}
    };
    // TODO: add api url to get all patients
    return fetch(api_url, options)
        .then(response => {
            return handleResponse(response);
        });
}

async function registerNewClerk(info) {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken
        },
        body: JSON.stringify(info)
    };
    return fetch(api_url + "/admin", options).then(response => {return handleResponse(response);});
}

async function getClerkById(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "GET",
        headers: { "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken }
    };

    return fetch(`${api_url}/${id}`, options).then(response => {return handleResponse(response);});
}

// used only by admin
async function updateClerk(info) {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        credentials: "include",
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken 
        },
        body: JSON.stringify(info)
    };
    return fetch(`${api_url}/${info.admin_id}`, options).then(response => {return handleResponse(response);});
}

// used only by admin
async function archiveClerk(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        credentials: "include",
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken 
        }
    };
    return fetch(`${api_url}/archive/${id}`, options).then(response => {return handleResponse(response);});
}
// Check if the response is ok
// If not, send error
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