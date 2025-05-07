import express from 'express'
import videoController from './video.controller'
import passportJWT from '~/middlewares/passport'
import checkRoles from '~/middlewares/checkRoles'
import videoSchema from './video.schema'
import validate from '~/middlewares/validate'

const videoRoute = express.Router()

videoRoute.post(
  '',
  passportJWT,
  checkRoles('admin'),
  validate({ body: videoSchema.addVideo }),
  videoController.addVideo,
)
videoRoute.get(
  '/:videoId',
  passportJWT,
  validate({ params: videoSchema.getVideo }),
  videoController.getVideo,
)

export default videoRoute
