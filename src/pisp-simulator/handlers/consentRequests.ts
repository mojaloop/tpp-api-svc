import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putTppConsentRequestsById(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function patchTppConsentRequestsById(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function putTppConsentRequestsByIdError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}
