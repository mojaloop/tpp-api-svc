import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putAuthorization(request: Request, h: ResponseToolkit) {
  const id = request.params.id

  return h.response({
    authorizationId: id,
    status: 'VERIFIED',
    authenticationInfo: {
      authentication: 'OTP',
      authenticationValue: '123456'
    }
  }).code(200)
}