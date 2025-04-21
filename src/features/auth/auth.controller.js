import authService from './auth.service'

const googleLogin = async (req, res, next) => {
  try {
    const result = await authService.googleLogin(req.body)
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body)
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const authController = {
  googleLogin,
  signup,
  login,
}
export default authController
