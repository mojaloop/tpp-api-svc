import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putTppAccountsRequestById(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putTppAccountsRequestByIdError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
