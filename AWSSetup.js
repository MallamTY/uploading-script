import AWS from "aws-sdk";
import { awsCredentials } from "./config.js";


const s3 = new AWS.S3({
    accessKeyId: awsCredentials.accessKeyId,
    secretAccessKey: awsCredentials.secretAccessKey,
    region: process.env.AWS_REGION,
  });


const uploadImageToS3 = async(imageData, filename, type,res) => {
    try {
        
      const params = {
        ACL: 'public-read',
        Bucket: awsCredentials.bucketName,
        Key: filename,
        Body: imageData,
        ContentType: type
      };

      const response = await s3.upload(params).promise();
      if (response){
          return response;
      }
      console.error(`Error uploading image ${filename} to S3 bucket`);
    } catch (error) {
      console.error(error);
    }
  }

export default uploadImageToS3