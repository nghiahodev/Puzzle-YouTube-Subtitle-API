import authService from './auth.service'

const googleOauth = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.googleOauth(
      req.body,
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({ token: accessToken, user })
  } catch (error) {
    next(error)
  }
}

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body)
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body,
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'Strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    return res.status(201).json({ token: accessToken, user })
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken
    const accessToken = await authService.refreshToken(refreshToken)
    return res.json({ accessToken })
  } catch (error) {
    next(error)
  }
}

const authController = {
  googleOauth,
  register,
  login,
  refreshToken,
}
export default authController
