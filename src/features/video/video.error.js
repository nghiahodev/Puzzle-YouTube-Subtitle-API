const videoErrors = {
  ENGLISH_SUBTITLES_NOT_FOUND: {
    code: 'ENGLISH_SUBTITLES_NOT_FOUND',
    status: 400,
  },
  INVALID_START_TIME: {
    code: 'INVALID_START_TIME',
    status: 400,
  },
  INVALID_END_TIME: {
    code: 'INVALID_END_TIME',
    status: 400,
  },

  YOUTUBE_VIDEO_NOT_FOUND: {
    code: 'YOUTUBE_VIDEO_NOT_FOUND',
    status: 404,
  },
  VIDEO_NOT_FOUND: {
    code: 'VIDEO_NOT_FOUND',
    status: 404,
  },
  SEGMENT_NOT_FOUND: {
    code: 'SEGMENT_NOT_FOUND',
    status: 404,
  },

  VIDEO_ALREADY_EXISTS: {
    code: 'VIDEO_ALREADY_EXISTS',
    status: 409,
  },
}

export default videoErrors
