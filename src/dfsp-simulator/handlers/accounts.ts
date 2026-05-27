import { Request, ResponseToolkit } from '@hapi/hapi'

export async function postTppAccountsRequest(request: Request, h: ResponseToolkit) {
  const id = request.params.id

  return h.response({
    status: 'ACCEPTED'
  }).code(200)
}