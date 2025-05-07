import _ from 'lodash'

const handleError = (err, req, res, next) => {
  let message = err.message
  try {
    if (_.isString(message)) {
      message = JSON.parse(message)
    }
  } catch {}

  if (_.isEmpty(message)) {
    message = 'Lỗi server, vui lòng thử lại sau'
  }

  const resError = {
    status: 'ERROR',
    message,
    details: err.details || '',
  }

  const httpCode = err.httpCode || 500

  console.log(resError)
  console.log('Request: ', req.method, req.originalUrl, httpCode)
  if (!_.isEmpty(req.body)) console.log('Body: ', req.body)
  if (!_.isEmpty(req.params)) console.log('Params: ', req.params)
  if (!_.isEmpty(req.query)) console.log('Query: ', req.query)

  return res.status(httpCode).json(resError)
}

export default handleError
