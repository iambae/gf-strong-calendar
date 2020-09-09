'use strict';

const fs = require('fs');
const Sequelize = require('sequelize');
const path = require('path');
const basename = path.basename(__filename);
const db = {};

var env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config.json')[env];

// console.log(config);
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Read all js files in the directory that whose name is not index.js
// console.log(__dirname);
fs.readdirSync(__dirname).filter(file => {
    return file.indexOf('.') !== 0 && file != basename && file.slice(-3) == '.js';
}).forEach(file => {
    // Import all files to models
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;