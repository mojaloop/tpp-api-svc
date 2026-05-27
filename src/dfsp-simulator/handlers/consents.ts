import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putConsent(request: Request, h: ResponseToolkit) {
  const id = request.params.id

  return h.response({
    consentId: id,
    status: 'ACCEPTED'
  }).code(200)
}