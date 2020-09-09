const path = require('path');
const models = require(path.join(__dirname, '/../models'));

module.exports = {
    getSetting: function(settingId) {
        models.PatientSetting.findOne({
            where: {
                setting_type: settingId
            }
        }).then(setting => {
            return setting;
        }).catch(() => {
            return null;
        });
    }
};