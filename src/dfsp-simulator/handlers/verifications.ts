import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putVerification(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putVerificationError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
