import mongoose, { Schema } from 'mongoose'
import modelConfig from './modelConfig'

const videoSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    youtubeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    categories: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: Object,
      required: true,
      trim: true,
    },
    segments: {
      type: [
        {
          start: {
            type: Number,
            required: true,
            min: 0,
          },
          end: {
            type: Number,
            required: true,
            min: 0,
          },
          text: {
            type: String,
            required: true,
            trim: true,
          },
          translate: {
            type: String,
            trim: true,
          },
          note: {
            type: Object,
            trim: true,
          },
        },
      ],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedUsers: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    state: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
  },
  modelConfig,
)

export default mongoose.model('Video', videoSchema)
