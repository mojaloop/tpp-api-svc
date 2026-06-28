import { Request, ResponseToolkit } from '@hapi/hapi'

export async function postTransfer(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}
