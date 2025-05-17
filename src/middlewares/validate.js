import errors from '~/common/errors'
import HttpError from '~/common/utils/HttpError'

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
      throw new HttpError(errors.VALIDATION_FAILED, validationErrors)
    }
    next()
  }
}

export default validate
2
