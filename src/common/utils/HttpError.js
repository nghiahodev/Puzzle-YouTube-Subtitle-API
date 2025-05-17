// Customize MyError from Error
class HttpError extends Error {
  constructor(errors, message, details) {
    super(message) // Call the parent class constructor (Error) to inherit all the properties returned by the class Error
    this.code = errors.code
    this.status = errors.status
    this.details = details
  }
}

export default HttpError
