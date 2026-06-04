import { Request, ResponseToolkit } from '@hapi/hapi'

export async function getHealth(_request: Request, h: ResponseToolkit) {
  return h.response({ status: 'OK' }).code(200)
}
