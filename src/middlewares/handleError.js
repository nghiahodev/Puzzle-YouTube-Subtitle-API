import _ from 'lodash'
import errors from '~/common/errors'

const handleError = (err, req, res, next) => {
  const {
    status = errors.SERVER_ERROR.status,
    code = errors.SERVER_ERROR.code,
    message,
    details,
  } = err

  const customError = {
    status,
    code,
    message,
    details,
  }

  const cleanedError = _.omitBy(customError, _.isUndefined)

  console.log('\n\nError:', cleanedError)
  console.log('Request: ', req.method, req.originalUrl, status)
  if (!_.isEmpty(req.body)) console.log('Body: ', req.body)
  if (!_.isEmpty(req.params)) console.log('Params: ', req.params)
  if (!_.isEmpty(req.query)) console.log('Query: ', req.query)
  console.log(err.stack)

  return res.status(status).json(cleanedError)
}

export default handleError
