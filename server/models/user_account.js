'use strict';

const DataTypes = require('sequelize').DataTypes;

module.exports = (sequelize) => {
    const UserAccount = sequelize.define('UserAccount', {
        user_account_ID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        date_of_birth: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password_salt: {
            type: DataTypes.STRING,
            allowNull: true
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'UserAccount',
    });

    UserAccount.associate = (models) => {
        UserAccount.hasOne(models.Patient, {onDelete: 'NO ACTION', foreignKey: 'patient_id', targetKey: 'patient_id'});
        UserAccount.hasOne(models.Therapist, {onDelete: 'NO ACTION', foreignKey: 'therapist_id', targetKey: 'therapist_id'});
        UserAccount.hasOne(models.AdminAccount, {onDelete: 'NO ACTION', foreignKey: 'admin_id', targetKey: 'admin_id'});
    };
    return UserAccount;
};