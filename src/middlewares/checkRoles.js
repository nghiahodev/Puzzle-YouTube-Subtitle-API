import errors from '~/common/errors'
import HttpError from '~/common/utils/HttpError'

const checkRoles = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next()
    } else throw new HttpError(errors.ROLE_NOT_ALLOWED)
  }
}

export default checkRoles
