import { NextApiHandler } from 'next'
import { useRouter } from 'next/router'
import { query } from '../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
  const router = useRouter()
  const { id } = router.query
  const { canvas_data, background_image_path } = req.body
  try {
    if (!id) {
      return res
        .status(400)
        .json({ message: '`id` is required' })
    }

    const results = await query(
      `
      UPDATE rooms
      SET canvas_data = ?, background_image_path = ?
      WHERE id = ?
      `,
      [canvas_data, background_image_path, id]
    )

    return res.json(results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler
