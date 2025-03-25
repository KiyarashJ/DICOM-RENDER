const dicomSchema = require("../Models/dicomReader")
const fs = require("fs")
exports.dicomRender = async (req , res , next) => {
    try {

        const { imageId } = req.params;
    console.log(`\nimageId: ${imageId}\n`);
    
    const findDicomFile = await dicomSchema.findOne({where: {filename: imageId}})
    console.log(`\nfindDicomFile : ${JSON.stringify(findDicomFile)}\n`);
    
    if (!findDicomFile) {
        return res.status(404).json({ error: "فایل پیدا نشد!" });
    }
    const streamFile = fs.createReadStream(findDicomFile.filePath)
    console.log(`\nfindDicomFile.filePath: ${findDicomFile.filePath}\nmetdata : ${findDicomFile.allMetaData}`);
    console.log(`\nstreamFile ${JSON.stringify(streamFile)}\n`);
    
    streamFile.pipe(res)
    streamFile.on('error' , err => {
        console.log(`error is here : ${err}`);
        return res.json({msg : 'خطایی در جریان ارسال داده ها رخ داد' , err})
    })
    res.setHeader("X-Metadata", findDicomFile.allMetaData);
    res.setHeader("Content-Type", "application/dicom");
    streamFile.on('end' , () => console.log(`successfully sent !!`))
    

    } catch (error) {
        return res.json({err})
    }
    
}
