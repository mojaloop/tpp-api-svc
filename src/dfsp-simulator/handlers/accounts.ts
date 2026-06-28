import { Request, ResponseToolkit } from '@hapi/hapi'

export async function postTppAccountsRequest(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}

export async function getTppAccountsByIdAndSignedChallenge(_request: Request, h: ResponseToolkit) {
  return h.response().code(202)
}
