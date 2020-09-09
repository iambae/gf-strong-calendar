export function validate(fieldType, input) {
    let regex = true;
    switch (fieldType) {
    case "contact":
        regex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/g;
        break;
    case "name":
        regex = /^[A-Za-z]+$/;
        break;
    case "patientNumber":
        regex = /^[a-zA-Z0-9]*$/;
        break;
    case "patientProgram":
        regex = /^[a-zA-Z0-9]*$/;
        break;
    default:
        return regex;
    }

    return regex.test(input);
}

export function getCustomMessage(fieldType) {
    let message = "";
    switch (fieldType) {
    case "name":
        message = "Please enter a valid name";
        break;
    case "contact":
        message = "Please enter numbers and dash only";
        break;
    case "patientNumber":
    case "patientProgram":
        message = "Please enter letters and numbers only.";
        break;
    default:
        message = "";
    }

    return message;
}
