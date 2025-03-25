const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('dicomreader' , 'postgres' , '12345' , {
    host : 'localhost',
    dialect : 'postgres',
    define : {
        freezeTableName : true
    }
})


var db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
