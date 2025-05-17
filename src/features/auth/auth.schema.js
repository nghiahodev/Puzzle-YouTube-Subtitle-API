import Joi from 'joi'

const googleOauth = Joi.object({
  credential: Joi.string().required(),
})

const register = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().min(6).alphanum().required(), // Username must be at least 6 characters, only letters and numbers
  password: Joi.string()
    .min(6)
    .pattern(/[a-zA-Z]/)
    .pattern(/[0-9]/)
    .required(), // Password must be at least 6 characters and contain both letters and numbers
})

const login = Joi.object({
  username: Joi.string().min(6).alphanum().required(), // Username must be at least 6 characters, only letters and numbers
  password: Joi.string()
    .min(6)
    .pattern(/[a-zA-Z]/)
    .pattern(/[0-9]/)
    .required(), // Password must be at least 6 characters and contain both letters and numbers
})

const authSchema = {
  googleOauth,
  register,
  login,
}

export default authSchema
