import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import env from '~/config/env'
import userModel from '~/models/user.model'
import MyError from '~/common/MyError'

const googleOauth = async ({ credential }) => {
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  if (!ticket) throw new MyError('Không thể xác thực tài khoản Google', 401)

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
      id: user._id.toString(),
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
  }
}

const register = async ({ name, username, password }) => {
  const isExist = await userModel.findOne({ username })
  if (isExist) throw new MyError('Tên đăng nhập đã tồn tại', 409)
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

  if (!user) throw new MyError('Tên đăng nhập không tồn tại', 401)

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new MyError('Sai mật khẩu', 401)

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
      id: user._id.toString(),
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
  }
}

const refreshToken = async (refreshToken) => {
  if (!refreshToken)
    throw new MyError('Bạn chưa đăng nhập', 401, 'Không có refresh token')

  let decoded
  try {
    decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)
  } catch (err) {
    throw new MyError('Hết phiên đăng nhập', 403, 'Refresh token đã hết hạn')
  }

  const user = await userModel.findById(decoded.id)
  if (!user) throw new MyError('Tài khoản không tồn tại', 404)

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
