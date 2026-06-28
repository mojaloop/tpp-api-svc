import { Request, ResponseToolkit } from '@hapi/hapi'

export async function postTppConsents(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function getTppConsentsById(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}
