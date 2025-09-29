import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import prisma from '../../../lib/prisma'
import { getEmbedding } from '../../../lib/embeddings'
export const config = { api: { bodyParser: false } }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'upload error' })
    const f: any = files.file
    const buffer = fs.readFileSync(f.filepath)
    let text = ''
    if (f.mimetype === 'application/pdf') {
      const data = await pdf(buffer)
      text = data.text
    } else if (f.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const m = await mammoth.extractRawText({ buffer })
      text = m.value
    } else {
      text = buffer.toString('utf8')
    }
    const chunks = []
    for (let i = 0; i < text.length; i += 1000) chunks.push(text.slice(i, i + 1000))
    for (const c of chunks) {
      const vector = await getEmbedding(c)
      await prisma.embedding.create({ data: { text: c, vector } })
    }
    res.json({ message: 'uploaded and embedded', chunks: chunks.length })
  })
}
