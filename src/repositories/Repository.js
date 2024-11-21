import axios from 'axios'

const baseDomain = 'https://api.asyncz.com'
const photoBase = 'https://api.asyncz.com'

export const customHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

export const baseUrl = `${baseDomain}`
export const mediaBase = `${photoBase}`
export const thumbnailBase = `${photoBase}/photo.php?w=600&h=450&zc=1&src=`
export const squareThumbnailBase = `${photoBase}/photo.php?w=400&h=400&zc=1&src=`

export default axios.create({
  baseUrl,
  headers: customHeaders
})

export const serializeQuery = (query) => {
  return Object.keys(query)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
    .join('&')
}
