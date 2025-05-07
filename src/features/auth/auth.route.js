import express from 'express'
import validate from '~/middlewares/validate'
import authSchema from './auth.schema'
import authController from './auth.controller'

const authRoute = express.Router()

authRoute.post(
  '/oauth/google',
  validate({ body: authSchema.googleOauth }),
  authController.googleOauth,
)
authRoute.post(
  '/register',
  validate({ body: authSchema.register }),
  authController.register,
)
authRoute.post(
  '/login',
  validate({ body: authSchema.login }),
  authController.login,
)
authRoute.get('/refresh-token', authController.refreshToken)

export default authRoute
