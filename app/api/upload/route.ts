import { put } from '@vercel/blob';

export const runtime = 'nodejs'; // ensures multipart works reliably

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return new Response('No file provided', { status: 400 });
    }

    // Save to Blob; addRandomSuffix prevents name collisions
    const { url } = await put(`uploads/${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true
      // No token needed: uses your project’s server credentials
      // (If you WANT to use your RW token instead, add: token: process.env.BLOB_READ_WRITE_TOKEN)
    });

    return Response.json({ url });
  } catch (e: any) {
    return new Response(e?.message ?? 'Upload error', { status: 500 });
  }
}
