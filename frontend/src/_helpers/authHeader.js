export default function authHeader() {
    // return authorization header with jwt token
    // TODO: maybe change this to a cookie
    var user = JSON.parse(localStorage.getItem("user"));

    if (user && user.accessToken) {
        return { "Authorization": "Bearer " + user.accessToken };
    } else {
        return {};
    }
}