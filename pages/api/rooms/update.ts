import { NextApiHandler } from 'next'
import { query } from '@/lib/db'

const handler: NextApiHandler = async (req, res) => {
  const { roomId, canvasImage } = req.body
  try {
    if (!canvasImage) {
      return res
        .status(400)
        .json({ message: '`canvasImage` is required' })
    }
    const base64Decode = Buffer.from(canvasImage, 'base64')

    const results = await query(
      `
      UPDATE rooms
      SET canvas_image = ?
      WHERE room_id = ?
      `,
      [base64Decode, roomId]
    )

    return res.json(results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
