import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import env from '~/config/env'
import userModel from '~/models/user.model'
import MyError from '~/utils/MyError'

const googleLogin = async ({ credential }) => {
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
    user = new userModel({
      googleId: sub,
      email,
      name,
      picture,
      role: email === env.ADMIN ? 'admin' : 'user',
    })
    await user.save()
  }

  const expiresIn = '30d'
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000

  const token = jwt.sign({ id: user._id }, env.TOKEN_SECRET, {
    expiresIn,
  })

  return {
    token,
    expiresAt,
    user: {
      id: user._id.toString(),
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
  }
}

const signup = async ({ name, username, password }) => {
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

  const expiresIn = '30d'
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000

  const token = jwt.sign({ id: user._id }, env.TOKEN_SECRET, {
    expiresIn,
  })

  return {
    token,
    expiresAt,
    user: {
      id: user._id.toString(),
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
  }
}

const authService = {
  googleLogin,
  signup,
  login,
}
export default authService
