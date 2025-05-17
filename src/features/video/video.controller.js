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
const editSegment = async (req, res, next) => {
  try {
    const result = await videoService.editSegment(req.params, req.body)
    return res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

const videoController = {
  addVideo,
  getVideo,
  editSegment,
}
export default videoController
