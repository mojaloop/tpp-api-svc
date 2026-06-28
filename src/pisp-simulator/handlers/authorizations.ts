import { Request, ResponseToolkit } from '@hapi/hapi'

export async function postTppAuthorizations(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function getTppAuthorizationsById(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function putTppAuthorizationsByIdError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
