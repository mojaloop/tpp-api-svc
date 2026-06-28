import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putTppTransactionRequestsById(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putTppTransactionRequestsByIdError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
