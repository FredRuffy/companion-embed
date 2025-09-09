'use client';

import { useState } from 'react';

export default function Page() {
  const [status, setStatus] = useState<'idle'|'signing'|'uploading'|'done'|'error'>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('signing');
    setErr(null);
    setUrl(null);

    try {
      // Ask our API for a one-time upload URL
      const r = await fetch('/api/upload', { method: 'POST' });
      if (!r.ok) throw new Error('Failed to get upload URL');
      const { url: uploadUrl }:{url:string} = await r.json();

      // Upload straight from the browser to Vercel Blob
      setStatus('uploading');
      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type || 'application/octet-stream' },
        body: file
      });

      if (!upload.ok) throw new Error('Upload failed');

      // The Blob URL is in the Location header
      const blobUrl = upload.headers.get('location');
      if (!blobUrl) throw new Error('Missing blob URL');
      setUrl(blobUrl);
      setStatus('done');
    } catch (e:any) {
      setErr(e.message || 'Something went wrong');
      setStatus('error');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <main style={{ width: 'min(800px, 92vw)', textAlign: 'center' }}>
      <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 40px)' }}>Upload a file</h1>
      <p style={{ opacity: .8, marginTop: 8 }}>PDF, images, etc. (max 100MB by default)</p>

      <div style={{ marginTop: 16 }}>
        <input
          type="file"
          onChange={onChange}
          aria-label="Choose a file to upload"
          style={{ display: 'inline-block' }}
        />
      </div>

      <p style={{ marginTop: 16 }}>
        {status === 'idle' && 'Ready.'}
        {status === 'signing' && 'Preparing secure upload…'}
        {status === 'uploading' && 'Uploading…'}
        {status === 'done' && 'Upload complete!'}
        {status === 'error' && `Error: ${err}`}
      </p>

      {url && (
        <p style={{ marginTop: 12, wordBreak: 'break-all' }}>
          File URL: <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#9cf' }}>{url}</a>
        </p>
      )}
    </main>
  );
}
