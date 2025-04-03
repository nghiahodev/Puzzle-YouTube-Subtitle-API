// Customize MyError from Error
class MyError extends Error {
  constructor(message, httpCode) {
    if (typeof message === 'object' && message !== null) {
      message = JSON.stringify(message)
    }
    super(message) // Call the parent class constructor (Error) to inherit all the properties returned by the class Error
    this.httpCode = httpCode
  }
}

export default MyError
