import videoModel from '~/models/video.model'
import videoUtil from './video.util'
import { isEmpty } from 'lodash'
import axios from 'axios'
import { spawn } from 'child_process'
import { GoogleGenerativeAI } from '@google/generative-ai'
import env from '~/config/env'
import HttpError from '~/common/utils/HttpError'
import errors from '~/common/errors'
import videoErrors from './video.error'

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const geminiTranslate = async (textToTranslate) => {
  const prompt = `Translate the following text into Vietnamese. Each line is separated by a newline (\n). Do not merge or remove any lines. Only translate the text on each line individually, and preserve the line order and count exactly:\n\n${textToTranslate}`
  try {
    const { response } = await model.generateContent(prompt)
    return response.text().trim()
  } catch (error) {
    throw new HttpError(errors.SERVER_ERROR)
  }
}
const geminiSummary = async (textToSummary) => {
  const prompt = `Summarize the following text into a short paragraph in Vietnamese (no more than 100 words) that explains the content:\n\n${textToSummary}`
  try {
    const { response } = await model.generateContent(prompt)
    return response.text().trim()
  } catch (error) {
    throw new HttpError(errors.SERVER_ERROR)
  }
}

const ytdlpExec = (youtubeId, timeoutMs = 30000) => {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn('yt-dlp', [
      '--skip-download',
      '--print-json',
      '--quiet',
      '--no-warnings',
      '--no-check-certificate',
      '--no-call-home',
      '--no-playlist',
      '--no-check-format',
      youtubeId,
    ])

    let output = ''
    let hasExited = false

    const timeout = setTimeout(() => {
      if (!hasExited) {
        ytdlp.kill('SIGKILL')
        const error = new Error()
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
    return await ytdlpExec(youtubeId)
  } catch (error) {
    if (error.code === 'TIMEOUT') throw new HttpError(errors.TIMEOUT_ERROR)
    else throw new HttpError(videoErrors.YOUTUBE_VIDEO_NOT_FOUND)
  }
}

const addVideo = async ({ youtubeId }, user) => {
  const videoExists = await videoModel.findOne({ youtubeId })
  if (videoExists) throw new HttpError(videoErrors.VIDEO_ALREADY_EXISTS)

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
    throw new HttpError(videoErrors.ENGLISH_SUBTITLES_NOT_FOUND)
  }

  // handle with vttUrl
  const vttUrl = enSubs.find((sub) => sub.ext === 'vtt')?.url
  if (!vttUrl) throw new HttpError(errors.CONNECTION_UNSTABLE)

  const { data } = await axios.get(vttUrl)
  if (isEmpty(data)) {
    throw new HttpError(errors.CONNECTION_UNSTABLE)
  }

  const validTexts = []
  const lines = data.split('\n')
  let start = 0
  let end = 0
  let collectingText = false
  let bufferText = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.includes('-->')) {
      const times = line.split('-->')
      const startStr = times[0].trim()
      const endStr = times[1].trim().split(' ')[0]

      start = +videoUtil.parseTime(startStr).toFixed(3)
      end = +videoUtil.parseTime(endStr).toFixed(3)
      collectingText = true
      bufferText = ''
      continue
    }

    if (collectingText) {
      if (line === '') {
        const text = bufferText
          .replace(/(\(.*?\)|\[.*?\]|\*\*.*?\*\*)/g, '')
          .replace(/\n/g, '')

        if (!/^[^a-zA-Z0-9]*$/.test(text)) {
          videoData.segments.push({ start, end, text })
          validTexts.push(text)
        }

        collectingText = false
        bufferText = ''
      } else {
        bufferText += (bufferText ? ' ' : '') + line
      }
    }
  }

  // handle with json3
  // const json3Url = enSubs.find((sub) => sub.ext === 'json3')?.url

  // if (!json3Url)
  //   throw new MyError(
  //     'Không thể lấy phụ đề từ video, vui lòng chọn video khác',
  //     400,
  //     'Không tìm thấy json3 URL',
  //   )

  // const { data } = await axios.get(json3Url)
  // const events = data?.events
  // if (isEmpty(events)) {
  //   throw new MyError(
  //     'Không thể lấy phụ đề từ video, vui lòng chọn video khác',
  //     400,
  //     'Không tìm thấy phụ đề',
  //   )
  // }

  // const validTexts = []
  // for (let i = 0; i < events.length; i++) {
  //   const event = events[i]
  //   if (isEmpty(event.segs) || isEmpty(event.segs[0]?.utf8)) continue

  //   const text = event.segs[0].utf8
  //     .replace(/\n/g, ' ') // Remove line breaks
  //     .replace(/(\(.*?\)|\[.*?\]|\*\*.*?\*\*)/g, '') // Remove annotations or formatting (e.g. bold, parentheses, brackets)
  //     .trim() // Trim leading and trailing whitespace

  //   if (/^[^a-zA-Z0-9]*$/.test(text)) {
  //     event.invalid = true
  //     continue
  //   }

  //   const start = +(event.tStartMs / 1000).toFixed(3)
  //   const duration = +(event.dDurationMs / 1000).toFixed(3)
  //   const end = +(start + duration).toFixed(3)

  //   let segment = {}

  //   segment.start = start
  //   segment.text = text
  //   segment.end = end
  //   videoData.segments.push(segment)
  //   validTexts.push(text)
  // }

  const translatedText = await geminiTranslate(validTexts.join('\n'))
  const translatedTextSplit = translatedText.split('\n')
  if (translatedTextSplit.length !== validTexts.length)
    throw new HttpError(errors.SERVER_ERROR, 'Translation using Gemini failed')
  const summary = await geminiSummary(validTexts.join(' '))
  videoData.summary = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: summary,
          },
        ],
      },
    ],
  }

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
    throw new HttpError(videoErrors.VIDEO_NOT_FOUND)
  }
  return video
}

const editSegment = async ({ videoId, segmentId }, segmentData) => {
  const video = await videoModel.findById(videoId, { segments: 1 })
  if (!video) throw new HttpError(videoErrors.VIDEO_NOT_FOUND)

  const index = video.segments.findIndex((s) => s.id === segmentId)
  if (index === -1) throw new HttpError(videoErrors.SEGMENT_NOT_FOUND)

  const prevSegment = video.segments[index - 1]
  const nextSegment = video.segments[index + 1]

  if (prevSegment && segmentData.start < prevSegment.end) {
    throw new HttpError(
      videoErrors.INVALID_START_TIME,
      'Start must be greater than or equal to the End of the previous segment',
    )
  }
  if (nextSegment && segmentData.end > nextSegment.start) {
    throw new HttpError(
      videoErrors.INVALID_END_TIME,
      'End must be less than or equal to the Start of the next segment',
    )
  }

  return await videoModel.updateOne(
    { _id: videoId, 'segments._id': segmentId },
    {
      $set: {
        'segments.$.start': segmentData.start,
        'segments.$.end': segmentData.end,
        'segments.$.text': segmentData.text,
        'segments.$.translate': segmentData.translate,
        'segments.$.note': segmentData.note,
      },
    },
  )
}

const videoService = {
  addVideo,
  getVideoById,
  editSegment,
}
export default videoService
