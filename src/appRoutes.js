import express from 'express'
import authRoute from './features/auth/auth.route'

const router = express.Router()

router.get('/ping', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() })
})

router.use('/auth', authRoute)

export default router
