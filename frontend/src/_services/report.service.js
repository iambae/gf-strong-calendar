import authHeader from "../_helpers/authHeader";

// TODO: base URL should probably be an environment variable
const baseURL = process.env.NODE_ENV === "production" ? "https://gf-strong-calendar.appspot.com/api" : "http://localhost:3000/api";
const apiURL = baseURL + "/reports";

export const ReportService = {
    generateSupportPersonnelReport,
    generatePatientTherapyReport,
    generateTherapyIntensityReport,
    generateSummaryReport
};

async function generateSupportPersonnelReport(patientID) {
    const options = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            ...authHeader()
        }
    };

    const endpoint = apiURL + "/support-staff/" + patientID;

    return fetch(endpoint, options)
        .then(response => {
            return handleResponse(response);
        });
}

async function generatePatientTherapyReport(patientID, startDate, endDate) {
    // Since GET request, have to pass params in the URL (GET req doesn't have a body)
    // TODO: Change endpoint to expect the startDate/endDate in the URL query params
    const options = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            ...authHeader()
        },
    };

    // From the official fetch documentation:
    const url = new URL(apiURL + "/therapy/" + patientID);
    const params = {startDate: startDate, endDate: endDate};
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    return fetch(url.toString(), options)
        .then(response => {
            return handleResponse(response);
        });
}

async function generateTherapyIntensityReport(patientID) {
    const options = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            ...authHeader()
        }
    };

    const endpoint = apiURL + "/intensity/" + patientID;

    return fetch(endpoint, options)
        .then(response => {
            return handleResponse(response);
        });
}

async function generateSummaryReport(category, startDate, endDate) {
    // Since GET request, have to pass params in the URL (GET req doesn't have a body)
    // TODO: Change endpoint to expect the startDate/endDate in the URL query params
    const options = {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            ...authHeader()
        },
    };

    // From the official fetch documentation:
    const url = new URL(apiURL + "/aggregate/" + category);
    const params = {startDate: startDate, endDate: endDate};
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    return fetch(url.toString(), options)
        .then(response => {
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
