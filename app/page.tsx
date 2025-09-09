'use client';

import { useState } from 'react';

export default function Page() {
  const [status, setStatus] = useState<'idle'|'uploading'|'done'|'error'>('idle');
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading'); setErr(null); setUrl(null);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!r.ok) throw new Error(await r.text());
      const { url } = await r.json();
      setUrl(url);
      setStatus('done');
    } catch (e: any) {
      setErr(e.message || 'Upload failed');
      setStatus('error');
    } finally {
      e.target.value = '';
    }
  }

  return (
    <main style={{ width: 'min(800px, 92vw)', textAlign: 'center' }}>
      <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 40px)' }}>Upload a file</h1>
      <p style={{ opacity: .8, marginTop: 8 }}>Select any file (public link after upload).</p>

      <div style={{ marginTop: 16 }}>
        <input type="file" onChange={onChange} aria-label="Choose a file to upload" />
      </div>

      <p style={{ marginTop: 16 }}>
        {status === 'idle' && 'Ready.'}
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
