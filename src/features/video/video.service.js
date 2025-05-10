import videoModel from '~/models/video.model'
import videoUtil from './video.util'
import MyError from '~/common/MyError'
import { isEmpty } from 'lodash'
import axios from 'axios'
import { spawn } from 'child_process'
import { GoogleGenerativeAI } from '@google/generative-ai'
import env from '~/config/env'

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

const geminiTranslate = async (textToTranslate) => {
  const prompt = `Translate the following into Vietnamese. Do not change or remove the "§" symbols. Only translate the text between them:\n\n${textToTranslate}`
  try {
    const { response } = await model.generateContent(prompt)
    return response.text().trim()
  } catch (error) {
    throw new MyError(null, null, 'Gemini không hoạt động')
  }
}
const geminiSummary = async (textToSummary) => {
  const prompt = `Summarize the following text into a short paragraph in Vietnamese (no more than 100 words) that explains the content. Insert important English words by enclosing them in double quotes ("") without explaining them:\n\n${textToSummary}`
  try {
    const { response } = await model.generateContent(prompt)
    return response.text().trim()
  } catch (error) {
    throw new MyError(null, null, 'Gemini không hoạt động')
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
    return await ytdlpExec(youtubeId, 20000)
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

  // handle with vttUrl
  const vttUrl = enSubs.find((sub) => sub.ext === 'vtt')?.url
  if (!vttUrl)
    throw new MyError(
      'Video đang có lượt truy cập cao, vui lòng thử lại sau',
      400,
      'Không tìm thấy json3 URL',
    )
  const { data } = await axios.get(vttUrl)
  if (isEmpty(data)) {
    throw new MyError(
      'Video đang có lượt truy cập cao, vui lòng thử lại sau',
      400,
      'Dữ liệu phụ đề trống',
    )
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
        const text = bufferText.replace(/(\(.*?\)|\[.*?\]|\*\*.*?\*\*)/g, '')

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

  const translatedText = await geminiTranslate(validTexts.join('§'))
  const translatedTextSplit = translatedText.split('§')
  if (translatedTextSplit.length !== validTexts.length)
    throw new MyError(null, null, 'Gemini error')
  const summary = await geminiSummary(validTexts.join(' '))
  videoData.summary = summary

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
