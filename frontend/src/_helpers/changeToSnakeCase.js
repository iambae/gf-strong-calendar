const changeCase = function(input) {
    let changedObject = {};
    Object.keys(input).forEach(val => {
        let snakeCase = val.replace(/([A-Z])/g, function($1){
            return "_"+$1.toLowerCase();
        });
        changedObject[snakeCase] = input[val];
    });
    return changedObject;
};
export default changeCase;