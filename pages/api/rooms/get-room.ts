import { NextApiHandler } from 'next'
import { query } from '@/lib/db'

const handler: NextApiHandler = async (req, res) => {
  const { roomId } = req.query
  try {
    if (!roomId) {
      return res.status(400).json({ message: '`id` required' })
    }

    const results = await query(
      `
      SELECT room_id, canvas_image
      FROM rooms
      WHERE room_id = ?
      `,
      roomId
    )
    
    return res.json(results[0])
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
