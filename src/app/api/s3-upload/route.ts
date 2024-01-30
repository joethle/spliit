import { sanitizeKey } from 'next-s3-upload'
import { POST as route } from 'next-s3-upload/route'

export const POST = route.configure({
  key(req, filename) {
    return sanitizeKey(filename).toLowerCase()
  },
  endpoint: process.env.S3_UPLOAD_ENDPOINT,
  // forcing path style is only necessary for providers other than AWS
  forcePathStyle: !!process.env.S3_UPLOAD_ENDPOINT,
})