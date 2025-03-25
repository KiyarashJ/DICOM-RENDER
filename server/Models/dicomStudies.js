const db = require('../postgresConnection');
const dicomPatients = require('./dicomPatients');
    sequelize = db.sequelize
    Sequelize = db.Sequelize

const dicomStudies = sequelize.define('dicomStudies', {
    patientId: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    } ,
    PatientName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    } , 
    PatientBir: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    } ,
    PatientSex: {
        type: Sequelize.DataTypes.ENUM,
        values: ['M', 'F'],
        allowNull: false
    } , 
    studyDesc: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    } ,
    StudyInstance: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    } ,
    StudyModal : {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    } ,
    PatientsAge: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 200
        }
    } ,
    StudyTime: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false 
    }, 
    StudyID: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    } ,
    qFlags: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
    } ,
    qSpare: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
    } 
}
,
    {
        timestamps: true,
        freezeTableName: true,
        tableName: 'dicomStudies'
    }
)
// dicomStudies.hasOne(dicomPatients, {
//     foreignKey: 'patientId'
// })


// here must exit aa field named SeriesInstance which has relation with SeriesInstance iwth DicomSeries 

module.exports = dicomStudies;