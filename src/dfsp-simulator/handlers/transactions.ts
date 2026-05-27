import { Request, ResponseToolkit } from '@hapi/hapi'

export async function putTransaction(request: Request, h: ResponseToolkit) {
  const id = request.params.id

  return h.response({
    transactionRequestId: id,
    status: 'ACCEPTED'
  }).code(200)
}