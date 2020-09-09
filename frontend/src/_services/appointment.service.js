
const baseUrl = process.env.NODE_ENV === "production" ? "https://gf-strong-calendar.appspot.com/api" : "http://localhost:3000/api";
const api_url = baseUrl + "/appointments";
export const AppointmentService = {
    getAllAppointments,
    addNewAppointment,
    updateAppointment,
    getAppointments
};

async function addNewAppointment(info) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "POST",
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Content-type": "application/json",
            Origin: "",
            Authorization: "Bearer " + user.accessToken
        },
        body: JSON.stringify(info)
    };
    // TODO: add api url to add new appointments
    return fetch(api_url + "/appointment", options).then(response => {
        return handleResponse(response);
    });
}

// to be used only to update patient number
// used only by admin
async function updateAppointment(info) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "PUT",
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken},
        body: JSON.stringify(info)
    };

    return fetch(`${api_url}/${info.appointment_id}`, options).then(response => {return handleResponse(response);});
}

async function getAppointments(id) {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken},
    };

    return fetch(`${api_url}/user/${id}`, options).then(response => {
        return handleResponse(response);
    });
}

async function getAllAppointments() {
    var user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Origin": "",
            "Authorization": "Bearer "+ user.accessToken},
    };

    return fetch(`${api_url}`, options).then(response => {
        return handleResponse(response);
    });
}

// Check if the response is ok
// If not, send error
function handleResponse(response) {
    return new Promise((resolve, reject) => {
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
    }).then(value => {
        return value;
    });
}