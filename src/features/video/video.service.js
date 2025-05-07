import videoModel from '~/models/video.model'
import videoUtil from './video.util'
import MyError from '~/common/MyError'
import { isEmpty } from 'lodash'
import axios from 'axios'
import { translate } from '@vitalets/google-translate-api'
import { spawn } from 'child_process'

const googleTranslate = async (textToTranslate) => {
  try {
    const { text } = await translate(textToTranslate, { to: 'vi' })
    return text
  } catch (error) {
    console.error(error)
    throw new MyError(null, null, 'Google translate không hoạt động')
  }
}

const ytdlpExec = (youtubeId, timeoutMs = 10000) => {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', [
      '--skip-download',
      '--print-json',
      '--quiet',
      '--no-warnings',
      youtubeId,
    ])

    let output = ''
    let hasExited = false

    const timeout = setTimeout(() => {
      if (!hasExited) {
        ytdlp.kill('SIGKILL')
        const error = new Error(`TIMEOUT ${timeoutMs}ms`)
        error.code = 'TIMEOUT'
        reject(error)
      }
    }, timeoutMs)

    ytdlp.stdout.on('data', (data) => {
      output += data.toString()
    })

    ytdlp.stderr.on('data', (data) => {
      console.error('stderr:', data.toString())
    })

    ytdlp.on('close', (code) => {
      hasExited = true
      clearTimeout(timeout)

      if (code === 0) {
        try {
          const json = JSON.parse(output)
          resolve(json)
        } catch (error) {
          reject(new Error('FAILED'))
        }
      } else {
        reject(new Error('FAILED'))
      }
    })
  })
}

const fetchVideo = async (youtubeId) => {
  try {
    return await ytdlpExec(youtubeId, 10000)
  } catch (error) {
    if (error.code === 'TIMEOUT')
      throw new MyError(
        'Hệ thống đang phản hồi chậm, vui lòng thử lại sau',
        504,
        error.message,
      )
    else throw new MyError('Video không có sẵn, vui lòng chọn video khác', 400)
  }
}

const addVideo = async ({ youtubeUrl }, user) => {
  const youtubeId = videoUtil.extractYoutubeId(youtubeUrl)
  const videoExists = await videoModel.findOne({ youtubeId })
  if (videoExists) throw new MyError('Video đã tồn tại', 400)

  const {
    id,
    title,
    duration,
    thumbnail,
    categories,
    subtitles = {},
  } = await fetchVideo(youtubeId)

  const videoData = {
    youtubeId: id,
    title,
    duration,
    thumbnail,
    categories,
    segments: [],
  }

  const enSubs = Object.entries(subtitles).find(([key]) =>
    key.startsWith('en'),
  )?.[1]

  if (!enSubs || enSubs.length === 0) {
    throw new MyError(
      'Video không có phụ đề tiếng Anh, vui lòng chọn video khác',
      400,
    )
  }

  const json3Url = enSubs.find((sub) => sub.ext === 'json3')?.url

  if (!json3Url)
    throw new MyError(
      'Không thể lấy phụ đề từ video, vui lòng chọn video khác',
      400,
      'Không tìm thấy json3 URL',
    )

  const { data } = await axios.get(json3Url)
  const events = data?.events
  if (isEmpty(events)) {
    throw new MyError(
      'Không thể lấy phụ đề từ video, vui lòng chọn video khác',
      400,
      'Không tìm thấy phụ đề',
    )
  }

  let textToTranslate = ''
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    if (isEmpty(event.segs) || isEmpty(event.segs[0]?.utf8)) continue

    const text = event.segs[0].utf8
      .replace(/\n/g, ' ') // Remove line breaks
      .replace(/(\(.*?\)|\[.*?\]|\*\*.*?\*\*)/g, '') // Remove annotations or formatting (e.g. bold, parentheses, brackets)
      .trim() // Trim leading and trailing whitespace

    if (/^[^a-zA-Z0-9]*$/.test(text)) {
      event.invalid = true
      continue
    }

    const start = +(event.tStartMs / 1000).toFixed(3)
    const duration = +(event.dDurationMs / 1000).toFixed(3)
    const end = +(start + duration).toFixed(3)

    let segment = {}

    segment.start = start
    segment.text = text
    segment.end = end
    videoData.segments.push(segment)
    textToTranslate += text + (i < events.length - 1 ? '\n' : '')
  }

  const translatedText = await googleTranslate(textToTranslate)
  const translatedTextSplit = translatedText.split('\n')
  if (translatedTextSplit.length !== videoData.segments.length)
    throw new MyError(null, null, 'Google translate error')

  translatedTextSplit.forEach((text, index) => {
    videoData.segments[index].translate = text
  })

  await videoModel.create({
    userId: user._id,
    ...videoData,
  })
}

const getVideoById = async (id) => {
  const video = await videoModel.findById(id)
  if (!video) {
    throw new MyError('Video not found', 404)
  }
  return video
}
const videoService = {
  addVideo,
  getVideoById,
}
export default videoService
