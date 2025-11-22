import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import path from "node:path";
import { Readable } from "stream";
dotenv.config();

export const s3 = new S3Client({
  region: process.env.AWS_REGION! || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function downloadRepoFromS3(s3Key: string, outputDir: string) {
  const filePath = path.join(outputDir, "repo.zip");

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: s3Key,
  });

  const response = await s3.send(command);

  // Convert WebStream -> Node Readable
  const bodyStream = Readable.from(response.Body as any);

  const writeStream = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    bodyStream.pipe(writeStream);
    bodyStream.on("end", resolve);
    bodyStream.on("error", reject);
  });

  return filePath;
}
