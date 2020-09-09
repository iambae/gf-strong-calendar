import authHeader from "../_helpers/authHeader";
const baseUrl = process.env.NODE_ENV === "production" ? "https://gf-strong-calendar.appspot.com/api" : "http://localhost:3000/api";
const api_url = baseUrl + "/records";

export const PatientRecordService = {
    createNewRecord,
    updateRecordById,
    deleteRecordById,
    archivePatientRecord
};

async function createNewRecord (info) {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-type": "application/json",
            Origin: "",
            Authorization: "Bearer " + user.accessToken
        },
        body: JSON.stringify(info)
    };
    // TODO: add api url to register new patients
    return fetch(api_url + "/patient_record", options).then(response => {
        return new Promise((resolve, reject) => {
            if (!response.ok) {
                if (response.status === 401) {
                    // auto logout if the response code is 401
                    // logout();
                    // location.reload(true);
                }
                const error =
                    (response.data && response.data.message) ||
                    response.statusText;
                reject(error);
            } else {
                resolve(response.json());
            }
        }).then(value => {
            return value;
        });
    });
}

// main update method for updating the patient record
async function updateRecordById(info) {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-type": "application/json",
            Origin: "",
            Authorization: "Bearer " + user.accessToken
        },
        body: JSON.stringify(info)
    };

    return fetch(`${api_url}/${info.id}`, options).then(handleResponse);
}

// main update method for updating the patient record
async function archivePatientRecord(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    const options = {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-type": "application/json",
            Origin: "",
            Authorization: "Bearer " + user.accessToken
        }
    };

    return fetch(`${api_url}/archive/${id}`, options).then(handleResponse);
}

// Will only delete the patient record, not the patient
async function deleteRecordById(id) {
    const options = {
        method: "DELETE",
        headers: authHeader()
    };

    return fetch(`${api_url}/${id}`, options).then(handleResponse);
}

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
