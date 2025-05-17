const errors = {
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    status: 400,
  },

  ROLE_NOT_ALLOWED: {
    code: 'ROLE_NOT_ALLOWED',
    status: 403,
  },

  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    status: 500,
  },

  CONNECTION_UNSTABLE: {
    code: 'CONNECTION_UNSTABLE',
    status: 503,
  },

  TIMEOUT_ERROR: {
    code: 'TIMEOUT_ERROR',
    status: 504,
  },
}

export default errors
