
const baseUrl =
	process.env.NODE_ENV === "production"
	    ? "https://gf-strong-calendar.appspot.com/api"
	    : "http://localhost:3000/api";
const api_url = baseUrl + "/therapists";

export const TherapistService = {
    registerNewTherapist,
    getAllTherapists,
    getTherapistById,
    updateTherapist,
    deleteTherapist,
    archiveTherapist
};

async function getAllTherapists() {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "GET",
        credentials: "include",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken}
    };
    return fetch(api_url, options).then(response => {
        return handleResponse(response);
    });
}

async function registerNewTherapist(info) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken},
        body: JSON.stringify(info),
    };
    // TODO: add api url to register new patients
    return fetch(api_url + "/therapist", options).then(response => {
        return handleResponse(response);
    });
}

async function getTherapistById(id) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken},
    };

    return fetch(api_url + id, options).then(response => {
        return handleResponse(response);
    });
}

// to be used only to update patient number
// used only by admin
// add params to the options
async function updateTherapist(info) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken},
        body: JSON.stringify(info)
    };

    return fetch(`${api_url}/${info.therapist_id}`, options).then(response => {
        return handleResponse(response);
    });
}

async function archiveTherapist(id) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken},
    };

    return fetch(`${api_url}/archive/${id}`, options).then(response => {
        return handleResponse(response);
    });
}

// Will not need this
async function deleteTherapist(id) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken
        },
    };

    return fetch(api_url + id, options).then(handleResponse);
}

// Check if the response is ok
// If not, send error
async function handleResponse(response) {
    const value_1 = await new Promise((resolve, reject) => {
        if (!response.ok) {
            if (response.status === 401) {
                // logout();
            }
            const error =
				(response.data && response.data.message) || response.statusText;
            reject(error);
        } else {
            resolve(response.json());
        }
    });
    return value_1;
}
