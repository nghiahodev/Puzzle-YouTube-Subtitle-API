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
  parseTime,
}

export default videoUtil
