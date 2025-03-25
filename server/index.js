const express = require('express');
const next = require('next');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const multerRoutes = require('./Routes/multerRoutes');
require('./MiddleWares/multer');
require('dotenv').config();

// دیتابیس از server.js
const db = require('./postgresConnection');
const sequelize = db.sequelize;
const Sequelize = db.Sequelize;

db.sequelize.authenticate()
  .then(() => {
    console.log('\x1b[35msuccessfully authenticated postgres database');
  })
  .catch(err => {
    console.error('\x1b[31man error occurred on postgresql connection :\x1b[0m', err);
  });

db.sequelize.sync()
  .then(() => {
    console.log('db connected and synced successfully');
  })
  .catch(err => {
    console.error('\x1b[31mError occurred while syncing database:\x1b[0m', err);
  });

// تنظیمات Next.js و Express
const app = express();
const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// میدلورها از app.js
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  exposedHeaders: ['X-Metadata', 'filename', 'Content-Type'],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));

// استاتیک و روت‌ها
app.use('/dicom/upload', express.static(path.join(__dirname, 'dicom/upload')));
app.use('/dicom', multerRoutes);

// هندل کردن Next.js
nextApp.prepare().then(() => {
  app.all('*', (req, res) => {
    return handle(req, res); // همه درخواست‌ها رو به Next.js می‌ده
  });

  app.listen(port, () => {
    console.log(`\x1b[34mrunning successfully on port: ${port} \x1b[0m`);
  });
});

module.exports = app;