const db = require('../postgresConnection')
const dicomStudies = require('./dicomStudies')
    sequelize = db.sequelize
    Sequelize = db.Sequelize


const dicomPatients = sequelize.define('dicomPatients', {
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
    DoctorMobile : {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9]{11}$/
        }
    },
    PatientMobile: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9]{11}$/
        }
    },
    PriorityINT: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
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
        tableName: 'dicomPatients'
    }
)

// dicomPatients.belongsTo(dicomStudies, {
//     foreignKey: 'patientId'
// })



module.exports = dicomPatients;