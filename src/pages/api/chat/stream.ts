import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
export const config = { api: { bodyParser: false } }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()
  const prompt = typeof req.query.prompt === 'string' ? req.query.prompt : ''
  try {
    const openaiRes = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    }, {
      responseType: 'stream',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
    })
    openaiRes.data.on('data', (chunk: Buffer) => {
      const str = chunk.toString('utf8')
      str.split('\n\n').forEach(line => {
        if (!line.trim()) return
        if (line.startsWith('data:')) {
          const payload = line.replace(/^data:\s*/, '')
          res.write(`data: ${payload}\n\n`)
        }
      })
    })
    openaiRes.data.on('end', () => {
      res.write('data: [DONE]\n\n')
      res.end()
    })
    openaiRes.data.on('error', (err: any) => {
      console.error(err)
      res.write('data: [DONE]\n\n')
      res.end()
    })
  } catch (err: any) {
    console.error('stream error', err?.message || err)
    res.write('data: [DONE]\n\n')
    res.end()
  }
}
