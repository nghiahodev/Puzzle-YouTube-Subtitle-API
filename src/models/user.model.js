import mongoose, { Schema } from 'mongoose'
import modelConfig from './modelConfig'

const userSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
  },
  modelConfig,
)

// Require either googleId or username
userSchema.path('username').validate(function () {
  if (!this.googleId && !this.username) {
    return false
  }
  return true
}, 'Must have either a googleId or a username.')

const userModel = mongoose.model('User', userSchema)
export default userModel
