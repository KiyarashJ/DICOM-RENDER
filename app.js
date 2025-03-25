const express = require('express');
const app = express();
require('./MiddleWares/multer')
const multerRoutes = require("./Routes/multerRoutes")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const path = require("path")
require("./server")
require("dotenv").config()


app.use(cors({
    origin: 'http://localhost:3001', 
    credentials: true, 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    exposedHeaders: ['X-Metadata' , 'filename' , 'Content-Type'],
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(morgan("common"))


app.use('/dicom/upload', express.static(path.join(__dirname, 'dicom/upload')));


app.use('/dicom' , multerRoutes)

app.listen(process.env.PORT , () => console.log("\x1b[34mrunning successfully on port : 3000 \x1b[0m"))

module.exports = app;