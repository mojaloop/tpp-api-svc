import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putAuthorization(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putAuthorizationError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}