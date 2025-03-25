const db = require('../postgresConnection')
    sequelize = db.sequelize
    Sequelize = db.Sequelize

const dicomSeries = sequelize.define('dicomSeries', {
        SeriesInstance: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        } ,
        SeriesNum: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        } ,
        SeriesTime: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        } ,
        SeriesDesc: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        } ,
        Modality: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        } ,
        patientPos: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        contrastBo : {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        } ,
        Manufactur: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        } ,
        ModelName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        } ,
        BodyPartEx: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        } ,
        ProtocolNa: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        } ,
        StationNam: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        } ,
        institution: {
            type: Sequelize.DataTypes.STRING,
            allowNull: true
        } ,
        FrameOfRef: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        } ,
        SeriesPat: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        } ,
        StudyInsta : {
            type: Sequelize.DataTypes.STRING,
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
        tableName: 'dicomSeries'
    }
)

module.exports = dicomSeries;