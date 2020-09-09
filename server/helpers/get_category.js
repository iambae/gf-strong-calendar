const path = require('path');
const models = require(path.join(__dirname, '/../models'));

module.exports = {
    getCategory: function(categoryId) {
        models.PatientCategory.findOne({
            where: {
                category: categoryId
            }
        }).then(category => {
            return category;
        }).catch(() => {
            return null;
        });
    }
};