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

const videoUtil = {
  extractYoutubeId,
}

export default videoUtil
