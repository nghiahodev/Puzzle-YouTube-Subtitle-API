import Joi from 'joi'
import mongoose from 'mongoose'

const objectIdSchema = () =>
  Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid')
    }
    return value
  })

const getVideo = Joi.object({
  videoId: objectIdSchema,
})

const addVideo = Joi.object({
  youtubeId: Joi.string()
    .pattern(/^[\w-]{11}$/)
    .required(),
})

const editSegmentParams = Joi.object({
  videoId: objectIdSchema,
  segmentId: objectIdSchema,
})

const editSegmentBody = Joi.object({
  start: Joi.number().min(0).required(),
  end: Joi.number().min(0).required(),
  text: Joi.string().trim().required(),
  translate: Joi.string().trim().required(),
  note: Joi.object().optional(),
})
  .custom((value, helpers) => {
    if (value.start > value.end) {
      return helpers.message('The start time must be earlier than the end time')
    }
    return value
  })
  .prefs({ stripUnknown: true })

const videoSchema = {
  getVideo,
  addVideo,
  editSegmentParams,
  editSegmentBody,
}

export default videoSchema
