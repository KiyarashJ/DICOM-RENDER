const db = require('./postgresConnection'),
    sequelize = db.sequelize,
    Sequelize = db.Sequelize;

require("dotenv").config()


db.sequelize.authenticate().then(() => {
    console.log("\x1b[35msuccessfully authenticated postgres database");
}).catch(err => {
    console.error("\x1b[31man error occurred on postgresql connection :\x1b[0m" , err);
})


db.sequelize.sync().then(() => {
    console.log('db connected and synced successfully');
}).catch(err => {
    console.error("\x1b[31mError occurred while syncing database:\x1b[0m", err);
});