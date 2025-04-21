import Joi from 'joi'

const googleLogin = Joi.object({
  credential: Joi.string().required().messages({
    'any.required': 'Vui lòng cung cấp credential',
    'string.empty': 'Credential không được để trống',
  }),
})

const signup = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập tên',
    'string.empty': 'Tên không được để trống',
  }),
  username: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập tên đăng nhập',
    'string.empty': 'Tên đăng nhập không được để trống',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập mật khẩu',
    'string.empty': 'Mật khẩu không được để trống',
  }),
})

const login = Joi.object({
  username: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập tên đăng nhập',
    'string.empty': 'Tên đăng nhập không được để trống',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập mật khẩu',
    'string.empty': 'Mật khẩu không được để trống',
  }),
})

const authValidation = {
  googleLogin,
  signup,
  login,
}

export default authValidation
