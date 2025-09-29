import React, { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
export default function Home() {
  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [stream, setStream] = useState('')
  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input) return
    setStream('')
    const es = new EventSource(`/api/chat/stream?prompt=${encodeURIComponent(input)}`)
    es.onmessage = (ev) => {
      if (ev.data === '[DONE]') { es.close(); return }
      setStream(prev => prev + ev.data)
    }
    es.onerror = (err) => { console.error(err); es.close() }
    setInput('')
  }
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Next.js AI Chat</h1>
        <div>
          {!session && <button onClick={() => signIn()}>Sign in</button>}
          {session && <button onClick={() => signOut()}>Sign out</button>}
        </div>
      </header>
      <main>
        <form onSubmit={sendMessage} className="space-y-2">
          <textarea value={input} onChange={e => setInput(e.target.value)} className="w-full p-3 border" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white">Send (SSE)</button>
            <a className="px-4 py-2 border" href="/upload">Upload & RAG</a>
          </div>
        </form>
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Assistant (stream)</h2>
          <div className="mt-2 p-4 bg-white border min-h-[120px] whitespace-pre-wrap">{stream || 'No reply yet'}</div>
        </section>
      </main>
    </div>
  )
}
