import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putServicesByServiceType(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
