import { NextApiHandler } from 'next'
import { nanoid } from 'nanoid'
import { query } from '@/lib/db'

const handler: NextApiHandler = async (req, res) => {
  try {
    let roomId = nanoid(43);

    const results = await query(
      `
      INSERT INTO rooms (room_id)
      VALUES (?)
      `,
      [roomId]
    )
    
    return res.json({ roomId: roomId })
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
