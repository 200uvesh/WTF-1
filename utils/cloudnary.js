//Cloudnary Logic  :-

require("dotenv").config();
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

// upload file on cloudnary
exports.uploadOnCloudinary = async (filePaths) => {
  try {
    if (!filePaths) return null;

    if (typeof filePaths === "string") {
      // Single file upload
      const response = await cloudinary.uploader.upload(filePaths, {
        resource_type: "auto",
      });
      console.log("File uploaded successfully to Cloudinary:", response.url);
      return response;
    } else if (Array.isArray(filePaths)) {
      // Multiple file upload
      const uploadResults = [];

      for (const filePath of filePaths) {
        const response = await cloudinary.uploader.upload(filePath, {
          resource_type: "auto",
        });
        uploadResults.push(response);
        console.log("File uploaded successfully to Cloudinary:", response.url);
      }

      return uploadResults;
    } else {
      console.log(
        "Invalid input. Please provide a file path or an array of file paths."
      );
      return null;
    }
  } catch (error) {
    console.log("Something went wrong:", error);
    return null;
  }
};

// for delete file  from cloudnary
exports.deleteOnCloudnary = async (localFilePath) => {
  try {
    // console.log(localFilePath)
    const result = await cloudinary.uploader.destroy(localFilePath);
    // console.log("Image Deleted Sucessfully : " , result)
    return result;
  } catch (error) {
    // console.log("Something went wrong on deleting image  :"  , error)
  }
};

// cloudinary.uploader.upload( `cloudinary://${process.env.api_key}:${process.env.api_secret}@${process.env.cloud_name}`,
//   { public_id: "olympic_flag" },
//   function(error, result) {console.log(result); });

//export CLOUDINARY_URL=cloudinary://823317268528185:KFufg2IoLMRFBnrDccF0ldJVwa8@doyzrpatw
