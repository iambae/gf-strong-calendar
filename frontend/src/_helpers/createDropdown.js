const createDropdown = function(userArray, type) {
    let userObjectArray = [];
    let userObject;
    if (type === "patient") {
        userObject = {};
        userArray.forEach(element => {
            userObject["label"] = element.label;
            userObject["key"] = element.patientId;
            userObject["value"] = element.label;
            userObjectArray.push(userObject);
            userObject = {};
        });
    }
    if (type === "therapist") {
        userObject = {};
        userArray.forEach(element => {
            userObject["label"] = element.label;
            userObject["key"] = element.therapistId;
            userObject["value"] = element.label;
 
            userObjectArray.push(userObject);
            userObject = {};
        });
    }
 
    if (type === "clerk") {
        userObject = {};
        userArray.forEach(element => {
            userObject["label"] = element.label;
            userObject["key"] = element.adminId;
            userObject["value"] = element.label;
 
            userObjectArray.push(userObject);
            userObject = {};
        });
    }
    return userObjectArray;
};

export default createDropdown;