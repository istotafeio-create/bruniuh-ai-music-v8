import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} em falta.`);
  return value;
}

function client() {
  const accountId = env("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY")
    }
  });
}

export async function putAudio(
  key: string,
  body: Uint8Array | Buffer,
  contentType: string
) {
  await client().send(new PutObjectCommand({
    Bucket: env("R2_BUCKET"),
    Key: key,
    Body: body,
    ContentType: contentType
  }));
}

export async function signedAudioUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key
    }),
    { expiresIn }
  );
}

export async function deleteAudio(key: string) {
  await client().send(new DeleteObjectCommand({
    Bucket: env("R2_BUCKET"),
    Key: key
  }));
}
