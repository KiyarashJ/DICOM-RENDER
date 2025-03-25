const db = require('../postgresConnection'),
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;

const dicomSchema = sequelize.define('dicom' , {
    id : {
        type : Sequelize.DataTypes.UUID,
        defaultValue : Sequelize.DataTypes.UUIDV4,
        primaryKey : true,
    },
    allMetaData : {
        type : Sequelize.DataTypes.TEXT,
        allowNull : false,
    },
    filename : {
        type : Sequelize.DataTypes.STRING,
        allowNull : false,
    },
    filePath : {
        type : Sequelize.DataTypes.STRING,
        allowNull : false,
    }
} , {
    timestamps : true,
    freezeTableName : true,
    tableName : 'dicom'
})

module.exports = dicomSchema;