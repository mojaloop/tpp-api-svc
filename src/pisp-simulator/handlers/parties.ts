import { Request, ResponseToolkit } from '@hapi/hapi'

export async function getParties(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function putParties(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
