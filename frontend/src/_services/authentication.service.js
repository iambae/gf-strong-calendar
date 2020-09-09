const baseUrl = process.env.NODE_ENV === "production" ? "https://gf-strong-calendar.appspot.com/api" : "http://localhost:3000/api";
const api_url = baseUrl;

export const AuthService = {
    login,
    logout
};

async function login(email, password) {
    const options = {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email, password })
    };

    // TODO: Add api url
    return fetch(api_url+"/login", options)
        .then(response => {
            return new Promise((resolve, reject) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        // auto logout if the response code is 401
                        logout();
                        // location.reload(true);
                    }
                    const error = (response.data && response.data.message) || response.statusText;
                    return reject(error);
                } else {
                    return resolve(response.json());
                }
            })
                .then(value => {
                    localStorage.setItem("user", JSON.stringify(value));
                    return value;
                });
        });
}

function logout() {
    localStorage.removeItem("user");
}
// Check if the response is ok
// If not, send error