// Customize MyError from Error
class MyError extends Error {
  constructor(message, httpCode, details) {
    if (typeof message === 'object' && message !== null) {
      message = JSON.stringify(message)
    }
    super(message) // Call the parent class constructor (Error) to inherit all the properties returned by the class Error
    this.httpCode = httpCode
    this.details = details
  }
}

export default MyError
