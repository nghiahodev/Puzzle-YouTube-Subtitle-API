import express from 'express'

const router = express.Router()

router.get('/ping', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() })
})

export default router
