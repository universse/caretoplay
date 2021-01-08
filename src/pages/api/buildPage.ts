import { NextApiRequest, NextApiResponse } from 'next'
import got from 'got'

export default async function buildPage(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    await got(`${req.headers.origin}/q/${req.body.quizSetKey}`)
    res.status(200).json({ success: true })
  } catch {
    res.status(500).json({ success: false })
  }
}
