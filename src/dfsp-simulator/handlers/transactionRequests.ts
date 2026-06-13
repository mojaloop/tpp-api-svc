import { Request, ResponseToolkit } from '@hapi/hapi'

export async function postTransactionRequest(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}
