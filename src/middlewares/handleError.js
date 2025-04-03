const handleError = (err, req, res) => {
  let message = err.message
  try {
    if (typeof message === 'string') {
      message = JSON.parse(message)
    }
  } catch {
    console.error('Failed to parse error message:', error)
  }

  const error = {
    status: 'ERROR',
    message,
  }

  const httpCode = err.httpCode || 500

  // Log additional ìnfomation to facilitate error detection and troubeshooting
  console.log('Error: ', err.stack)
  console.log('Request: ', req.method, req.originalUrl, httpCode)
  console.log('Body: ', req.body)
  console.log('Params: ', req.params)
  console.log('Query: ', req.query)

  return res.status(httpCode).json(error)
}

export default handleError
