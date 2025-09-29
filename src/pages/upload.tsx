import React, { useState } from 'react'
export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setMessage(data.message || 'done')
  }
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Upload documents for RAG</h1>
      <form onSubmit={submit} className="mt-4 space-y-2">
        <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <button className="px-4 py-2 bg-slate-800 text-white">Upload</button>
      </form>
      <div className="mt-4">{message}</div>
    </div>
  )
}
