const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    if (error) {
      return res.status(400).json({
        message: 'Xác thực dữ liệu thất bại',
        details: error.details.map((detail) => detail.message),
      })
    }
    next()
  }
}

export default validate
