import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
//    fs = fileSystem


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)return null

        //upload the file
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })

        //file uploaded
        console.log("FILE HAS BEEN UPLOADED ON CLOUDINARY",response.url);
        return response;

    } catch (error) {
        
        // remove the file synchronously, saved on localpath if the upload failed
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {uploadOnCloudinary}