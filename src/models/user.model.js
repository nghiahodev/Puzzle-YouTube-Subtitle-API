import mongoose, { Schema } from 'mongoose'
import modelConfig from './modelConfig'

const userSchema = new Schema(
  {
    email: {
      type: String,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
  },
  modelConfig,
)

userSchema.path('username').validate(function () {
  if (!this.googleId && !this.username) return false
  return true
}, 'Must have either a googleId or a username.')

const userModel = mongoose.model('User', userSchema)
export default userModel
