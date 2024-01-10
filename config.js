import dotenv from "dotenv";

dotenv.config();

export const MONGO_URI = process.env.MONGO_URI
export const awsCredentials = Object.freeze({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_BUCKET_NAME
  })
  