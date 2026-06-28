import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putTppAccountsById(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putTppAccountsByIdError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
