import axios from 'axios'
export async function getEmbedding(text: string): Promise<number[]> {
  const model = process.env.EMBEDDINGS_MODEL || 'text-embedding-3-small'
  const res = await axios.post('https://api.openai.com/v1/embeddings', { input: text, model }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } })
  const vector = res.data.data[0].embedding as number[]
  return vector
}
