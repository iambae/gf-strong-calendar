const baseUrl =
	process.env.NODE_ENV === "production"
	    ? "https://gf-strong-calendar.appspot.com/api"
	    : "http://localhost:3000/api";
const api_url = baseUrl + "/locations";

export const LocationService = {
    getAllLocations,
    getAllTableLocations,
    addNewLocation,
    updateLocation,
    archiveLocation
};

async function getAllLocations() {
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

async function addNewLocation(info) {
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
    return fetch(api_url + "/location", options).then(response => {return handleResponse(response);});
}

async function getAllTableLocations() {
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
    return fetch(api_url+"/table", options).then(response => {
        return handleResponse(response);
    });
}

async function updateLocation(info) {
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
    return fetch(`${api_url}/${info.location_id}`, options).then(response => {return handleResponse(response);});
}

async function archiveLocation(id) {
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
