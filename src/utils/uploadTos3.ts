import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3.js";

export const uploadToS3 = async (buffer: Buffer, key: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: "application/zip",
  });

  await s3.send(command);

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
