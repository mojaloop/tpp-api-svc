import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putConsent(request: Request, h: ResponseToolkit) {
  const id = request.params.id

  return h.response({
    consentId: id,
    status: 'ACCEPTED'
  }).code(200)
}

export async function putConsents(_request: Request, h: ResponseToolkit) {
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