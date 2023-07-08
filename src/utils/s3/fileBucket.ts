import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { prismaClient } from '../../prisma';

// Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  region: process.env.S3_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
}) as S3Client;

export const uploadFileToBucket = async ({
  file,
  path,
  acl = 'public-read',
  type,
  userId,
}: {
  file: File | Buffer;
  path: string;
  acl?: 'public-read' | 'private';
  type: string;
  userId: string;
}) => {
  // Step 3: Define the parameters for the object you want to upload.
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `v3rify/${path}`,
    Body: file,
    ACL: acl,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    console.log('Successfully uploaded object: ' + params.Bucket + '/' + params.Key);

    let cdnLink = `https://${params.Bucket}.sgp1.digitaloceanspaces.com/${params.Key}`;

    await prismaClient.uploadedFile.upsert({
      where: {
        path: params.Key,
      },
      create: {
        url: cdnLink,
        type,
        userId,
        path: params.Key,
      },
      update: {
        url: cdnLink,
        type,
        userId,
        path: params.Key,
      },
    });

    cdnLink = `${cdnLink}?seed=${nanoid(3)}`;

    return cdnLink;
  } catch (err) {
    console.log('Error', err);
  }
};
