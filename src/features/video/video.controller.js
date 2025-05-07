import videoService from './video.service'

const addVideo = async (req, res, next) => {
  try {
    const result = await videoService.addVideo(req.body, req.user)
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const getVideo = async (req, res, next) => {
  try {
    const result = await videoService.getVideoById(req.params.videoId)
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const videoController = {
  addVideo,
  getVideo,
}
export default videoController
