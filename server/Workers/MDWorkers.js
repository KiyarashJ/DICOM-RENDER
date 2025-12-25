const {parentPort , workerData} = require("worker_threads");
const fs = require("fs");
const dcmjs = require("dcmjs");
const dicomFilePath = workerData;

console.log(`worker data${dicomFilePath}`);


try {
    const data = fs.readFileSync(dicomFilePath)
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    console.log(`byteOffset : ${data.byteOffset}\n data offset + bytelength : ${data.byteOffset + data.byteLength}`);
    // read this arrayBuffer file by dcmjs
    const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
    // process image with naturailzeDataset method of dcm js dictionarymeta of dicom
    let dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict)
    console.log(`dataset : ${JSON.stringify(dataset)}`);
    
    // extracting metadata
    dataset = JSON.stringify(dataset)
    parentPort.postMessage(dataset)
} catch (error) {
    parentPort.postMessage({err : error.message})
}

