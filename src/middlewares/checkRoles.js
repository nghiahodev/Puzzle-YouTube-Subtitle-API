import MyError from '~/common/MyError'

const checkRoles = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next()
    } else throw new MyError('Tài khoản không được cấp quyền', 403)
  }
}

export default checkRoles
