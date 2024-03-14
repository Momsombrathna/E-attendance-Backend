import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

if (s3Client) {
  console.log("S3 Client is ready...");
} else {
  console.log("S3 CLient  is not ready...");
}

export default s3Client;
