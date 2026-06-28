import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putConsent(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putConsents(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function patchConsent(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function putConsentError(_request: Request, h: ResponseToolkit) {
  return h.response().code(200)
}

export async function postConsentRequest(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function getConsentRequest(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function patchConsentRequest(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}