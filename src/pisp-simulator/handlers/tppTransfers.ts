import { Request, ResponseToolkit } from '@hapi/hapi'

export async function getTppTransfersById(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function postTppTransfers(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function putTppTransfersById(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putTppTransfersByIdError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
