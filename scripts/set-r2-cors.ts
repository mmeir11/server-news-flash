/**
 * One-time script to set CORS rules on the R2 bucket.
 * Run once: npx ts-node -r tsconfig-paths/register scripts/set-r2-cors.ts
 */
import { PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const accountId = process.env.R2_ACCOUNT_ID!;
const bucket = process.env.R2_BUCKET!;
const rawOrigins = process.env.CORS_ORIGINS ?? 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function main() {
  console.log(`Setting CORS on bucket "${bucket}" for origins:`, allowedOrigins);

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: allowedOrigins,
            AllowedMethods: ['PUT', 'GET', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );

  console.log('CORS rules set successfully.');
}

main().catch((err) => {
  console.error('Failed to set CORS:', err.message);
  process.exit(1);
});
