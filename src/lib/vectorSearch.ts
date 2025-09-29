import prisma from './prisma'
function dot(a: number[], b: number[]) { return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0) }
function norm(a: number[]) { return Math.sqrt(a.reduce((s, v) => s + v * v, 0)) }
export async function semanticSearch(queryVec: number[], topK = 5) {
  const all = await prisma.embedding.findMany()
  const scored = all.map(e => ({ ...e, score: dot(queryVec, e.vector) / (norm(queryVec) * norm(e.vector)) }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}
