import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import errors from '~/common/errors'
import env from '~/config/env'
import userModel from '~/models/user.model'
import HttpError from '~/common/utils/HttpError'
import authErrors from './auth.error'

const googleOauth = async ({ credential }) => {
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)
  let ticket

  try {
    ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    })
  } catch (error) {
    throw new HttpError(errors.SERVER_ERROR)
  }

  if (!ticket) throw new HttpError(authErrors.GOOGLE_AUTH_FAILED)

  const payload = ticket.getPayload()
  const { sub, email, name, picture } = payload

  let user = await userModel.findOne({ googleId: sub })

  if (!user) {
    user = await userModel.create({
      googleId: sub,
      email,
      name,
      picture,
      role: email === env.ADMIN ? 'admin' : 'member',
    })
  }

  const accessToken = jwt.sign({ id: user.id }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign({ id: user.id }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  })

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
  }
}

const register = async ({ name, username, password }) => {
  const isExist = await userModel.findOne({ username })

  if (isExist) throw new HttpError(authErrors.USERNAME_ALREADY_EXISTS)

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = new userModel({
    name,
    username,
    password: hashedPassword,
  })
  await user.save()
}

const login = async ({ username, password }) => {
  const user = await userModel.findOne({ username })

  if (!user) throw new HttpError(authErrors.USERNAME_NOT_FOUND)

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new HttpError(authErrors.INVALID_PASSWORD)

  const accessToken = jwt.sign({ id: user.id }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign({ id: user.id }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
  }
}

const refreshToken = async (refreshToken) => {
  if (!refreshToken) throw new HttpError(authErrors.REFRESH_TOKEN_REQUIRED)

  let decoded
  try {
    decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)
  } catch (err) {
    throw new HttpError(authErrors.INVALID_REFRESH_TOKEN)
  }

  const user = await userModel.findById(decoded.id)
  if (!user) throw new HttpError(authErrors.USERNAME_NOT_FOUND)

  return jwt.sign({ id: user._id }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  })
}

const authService = {
  googleOauth,
  register,
  login,
  refreshToken,
}
export default authService
