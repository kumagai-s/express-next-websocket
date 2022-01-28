import { NextApiHandler } from 'next'
import { useRouter } from 'next/router'
import { query } from '../../../../lib/db'

const handler: NextApiHandler = async (req, res) => {
  const router = useRouter()
  const { id } = router.query
  try {
    if (!id) {
      return res.status(400).json({ message: '`id` is required' })
    }
    if (typeof parseInt(id.toString()) !== 'number') {
      return res.status(400).json({ message: '`id` must be a number' })
    }

    const results = await query(
      `
      SELECT *
      FROM rooms
      WHERE id = ?
      `,
      id
    )

    return res.json(results)
  } catch (e) {
    res.status(500).json({ message: e.message })
  }
}

export default handler

