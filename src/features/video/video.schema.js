import Joi from 'joi'
import mongoose from 'mongoose'

const getVideo = Joi.object({
  videoId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid')
      }
      return value
    })
    .messages({
      'string.empty': 'ID video không được để trống.',
      'any.required': 'ID video là bắt buộc.',
      'any.invalid': 'ID video không hợp lệ.',
    }),
})

const addVideo = Joi.object({
  youtubeUrl: Joi.string()
    .uri()
    .required()
    .custom((value, helpers) => {
      try {
        const url = new URL(value)

        const isYoutubeHost =
          url.hostname === 'www.youtube.com' ||
          url.hostname === 'youtube.com' ||
          url.hostname === 'youtu.be'

        if (!isYoutubeHost) {
          return helpers.error('any.invalid')
        }

        let youtubeId = ''

        if (url.hostname === 'youtu.be') {
          youtubeId = url.pathname.slice(1)
        } else {
          youtubeId = url.searchParams.get('v') || ''
        }

        const isValidYoutubeId = /^[\w-]{11}$/.test(youtubeId)

        if (!isValidYoutubeId) {
          return helpers.error('any.invalid')
        }

        return value
      } catch (err) {
        return helpers.error('any.invalid')
      }
    })
    .messages({
      'any.required': 'URL video là bắt buộc',
      'string.empty': 'URL video không được để trống',
      'string.uri': 'Phải là một URL hợp lệ',
      'any.invalid': 'URL phải là liên kết hợp lệ đến một video YouTube',
    }),
})

const videoSchema = {
  getVideo,
  addVideo,
}

export default videoSchema
