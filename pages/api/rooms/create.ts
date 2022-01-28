import { NextApiHandler } from 'next'
import { query } from '../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
  const { room_code, canvas_data, background_image_path } = req.body
  try {
    if (!room_code) {
      return res
        .status(400)
        .json({ message: '`room_code` are both required' })
    }

    const results = await query(
      `
      INSERT INTO rooms (room_code, canvas_data, background_image_path)
      VALUES (?, ?, ?)
      `,
      [room_code, canvas_data, background_image_path]
    )

    return res.json(results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
