const authErrors = {
  REFRESH_TOKEN_REQUIRED: {
    code: 'REFRESH_TOKEN_REQUIRED',
    status: 400,
  },

  GOOGLE_AUTH_FAILED: {
    code: 'GOOGLE_AUTH_FAILED',
    status: 401,
  },
  INVALID_PASSWORD: {
    code: 'INVALID_PASSWORD',
    status: 401,
  },
  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    status: 401,
  },

  USERNAME_NOT_FOUND: {
    code: 'USERNAME_NOT_FOUND',
    status: 404,
  },

  USERNAME_ALREADY_EXISTS: {
    code: 'USERNAME_ALREADY_EXISTS',
    status: 409,
  },
}

export default authErrors
