const validateSchema = (schema, data) => {
  if (!schema) return []
  const { error } = schema.validate(data, { abortEarly: false })
  return error ? error.details.map((d) => d.message) : []
}

const validate = (schemas) => {
  return (req, res, next) => {
    const validationErrors = [
      ...validateSchema(schemas.body, req.body),
      ...validateSchema(schemas.params, req.params),
      ...validateSchema(schemas.query, req.query),
    ]

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Dữ liệu đầu vào không hợp lệ',
        details: validationErrors,
      })
    }

    next()
  }
}

export default validate
