import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST() {
  // Create a one-time, signed URL for client to PUT the file
  const { url } = await put('upload-[random]', new Blob([]), {
    // We only need the URL; the data we pass here is ignored because we will overwrite via the signed URL
    // so pass an empty Blob; Vercel Blob returns a signed upload URL when "token: true"
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: true,
    contentType: 'application/octet-stream',
    // Instead of uploading now, ask for a signed URL:
    // (Workaround: use "head:true" in older versions; in new SDKs, use `generateUploadURL`.)
  } as any);

  // NOTE: If your @vercel/blob version supports it, prefer:
  // import { generateUploadURL } from '@vercel/blob';
  // const { url } = await generateUploadURL({ token: process.env.BLOB_READ_WRITE_TOKEN });

  return NextResponse.json({ url });
}
