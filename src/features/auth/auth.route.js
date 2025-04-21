import express from 'express'
import validate from '~/middlewares/validate'
import authValidation from './auth.validation'
import authController from './auth.controller'

const authRoute = express.Router()

authRoute
  .route('/google-login')
  .post(validate(authValidation.googleLogin), authController.googleLogin)
authRoute
  .route('/signup')
  .post(validate(authValidation.signup), authController.signup)
authRoute
  .route('/login')
  .post(validate(authValidation.login), authController.login)

export default authRoute
