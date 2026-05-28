import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putVerification(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
