'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const AdminAccount = sequelize.define('AdminAccount', {
        admin_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: 'AdminAccount',
        timestamps: false
    });

    AdminAccount.associate = (models) => {
        AdminAccount.belongsTo(models.UserAccount, {foreignKey: 'admin_id'});
    };
    return AdminAccount;
};