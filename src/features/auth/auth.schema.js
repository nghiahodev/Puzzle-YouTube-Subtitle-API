import Joi from 'joi'

const googleOauth = Joi.object({
  credential: Joi.string().required().messages({
    'any.required': 'Thông tin xác thực là bắt buộc',
    'string.empty': 'Thông tin xác thực không được để trống',
  }),
})

const register = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Tên là bắt buộc',
    'string.empty': 'Tên không được để trống',
  }),
  username: Joi.string().required().messages({
    'any.required': 'Tên người dùng là bắt buộc',
    'string.empty': 'Tên người dùng không được để trống',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
    'string.empty': 'Mật khẩu không được để trống',
  }),
})

const login = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Tên người dùng là bắt buộc',
    'string.empty': 'Tên người dùng không được để trống',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc',
    'string.empty': 'Mật khẩu không được để trống',
  }),
})

const authSchema = {
  googleOauth,
  register,
  login,
}

export default authSchema
