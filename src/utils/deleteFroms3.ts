// src/utils/deleteFromS3.ts
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3.js";


export const deleteFromS3 = async (key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    return {
      success: true,
      message: "File deleted from S3",
      key,
    };
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw error;
  }
};
