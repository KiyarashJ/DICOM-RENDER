
const express = require("express");
const router = express.Router();
const { UploadFile } = require("../MiddleWares/multer");
const path = require("path");
const { Worker } = require("worker_threads");
const pathOfDICOMFOLDER = path.join(__dirname, "..", "uploads");
const upload = UploadFile(pathOfDICOMFOLDER);
const fs = require('fs');
const dicomSchema = require("../Models/dicomReader");

const runWorker = (dicomFilePath) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(path.join(__dirname, "..", "Workers", "MDWorkers.js"), {
            workerData: dicomFilePath
        });
        worker.on('message', metadata => {
            try {
                const parsedMetadata = JSON.parse(metadata);
                resolve(parsedMetadata);
            } catch (e) {
                reject(new Error("Invalid metadata from worker: " + metadata));
            }
        });
        worker.on('error', err => reject(err));
        worker.on('exit', code => {
            if (code !== 0) reject(new Error(`Worker exited with code: ${code}`));
        });
    });
};

router
    .route('/upload')
    .post(upload, async (req, res) => {
        try {
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).send("No valid DICOM files uploaded.");
            }
            if (!files[0].filename) {
                return res.status(400).send("File metadata missing.");
            }

            console.log("First file:", files[0]);
            const firstFilePath = path.join(pathOfDICOMFOLDER, files[0].filename);
            console.log("First file path:", firstFilePath);
            const firstMetadata = await runWorker(firstFilePath);
            if (firstMetadata.error) throw new Error(firstMetadata.error);
            const seriesInstance = firstMetadata.SeriesInstanceUID;

            const seriesFolder = path.join(pathOfDICOMFOLDER, seriesInstance);
            if (!fs.existsSync(seriesFolder)) {
                fs.mkdirSync(seriesFolder, { recursive: true });
            }

            const results = [];
            for (const file of files) {
                if (!file.filename) {
                    console.log("Missing filename for file:", file);
                    continue;
                }

                console.log("Processing file:", file.filename);
                const oldPath = path.join(pathOfDICOMFOLDER, file.filename);
                const dicomFilePath = path.join(seriesFolder, file.filename);
                console.log("DICOM file path:", dicomFilePath);

                if (fs.existsSync(oldPath)) {
                    fs.renameSync(oldPath, dicomFilePath);
                }

                const metadata = await runWorker(dicomFilePath);
                if (metadata.error) throw new Error(metadata.error);

                const saveMetaData = await dicomSchema.create({
                    allMetaData: JSON.stringify(metadata),
                    filename: file.filename,
                    filePath: dicomFilePath
                });
                results.push(saveMetaData);
            }

            // تنظیم هدرها
            res.setHeader("X-Metadata", JSON.stringify(results));
            res.setHeader("fileName", seriesInstance);
            res.setHeader('Content-Type', 'application/octet-stream'); // عوض کردیم به استریم باینری

            // استریم فایل‌ها
            let fileIndex = 0;
            const streamNextFile = () => {
                if (fileIndex >= files.length) {
                    res.end();
                    return;
                }

                const filePath = path.join(seriesFolder, files[fileIndex].filename);
                const fileStream = fs.createReadStream(filePath);

                fileStream.on('data', (chunk) => {
                    res.write(chunk);
                });

                fileStream.on('end', () => {
                    fileIndex++;
                    res.write('---FILE_SEPARATOR---'); // جداکننده فایل‌ها
                    streamNextFile();
                });

                fileStream.on('error', (err) => {
                    console.log(`Error streaming file ${filePath}: ${err}`);
                    res.status(500).send("Error streaming file.");
                });
            };

            streamNextFile();
        } catch (error) {
            console.log(`Error catch: ${error.stack}`);
            return res.status(500).send("Error processing DICOM files: " + error.message);
        }
    });


router
    .route('/file')
    .get((req, res) => {
      const filePath = req.query.path;
      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).send("File not found");
      }
  
      const fileStream = fs.createReadStream(filePath);
      res.setHeader('Content-Type', 'application/dicom');
      fileStream.pipe(res);
  
      fileStream.on('error', (err) => {
        console.log(`Error streaming file ${filePath}: ${err}`);
        res.status(500).send("Error streaming file");
      });
    });

module.exports = router;