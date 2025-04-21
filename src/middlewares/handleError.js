import _ from 'lodash'

const handleError = (err, req, res, next) => {
  let message = err.message
  try {
    if (_.isString(message)) {
      message = JSON.parse(message)
    }
  } catch {}

  if (_.isEmpty(message)) {
    message = 'Có lỗi xảy ra, vui lòng thử lại!'
  }

  const error = {
    status: 'ERROR',
    message,
  }

  const httpCode = err.httpCode || 500

  console.log(err.stack)
  console.log('Request: ', req.method, req.originalUrl, httpCode)
  if (!_.isEmpty(req.body)) console.log('Body: ', req.body)
  if (!_.isEmpty(req.params)) console.log('Params: ', req.params)
  if (!_.isEmpty(req.query)) console.log('Query: ', req.query)

  return res.status(httpCode).json(error)
}

export default handleError
