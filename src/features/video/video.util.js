const extractYoutubeId = (url) => {
  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.hostname === 'youtu.be') {
      return parsedUrl.pathname.slice(1)
    }

    if (
      parsedUrl.hostname === 'www.youtube.com' ||
      parsedUrl.hostname === 'youtube.com'
    ) {
      return parsedUrl.searchParams.get('v')
    }

    return null
  } catch (error) {
    return null
  }
}

const parseTime = (str) => {
  const [h, m, s] = str.split(':')
  const [sec, ms = '0'] = s.split('.')
  return (
    parseInt(h) * 3600 +
    parseInt(m) * 60 +
    parseInt(sec) +
    parseInt(ms.padEnd(3, '0')) / 1000
  )
}

const videoUtil = {
  extractYoutubeId,
  parseTime,
}

export default videoUtil
