"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postTppAccountsRequest = postTppAccountsRequest;
async function postTppAccountsRequest(request, h) {
    const id = request.params.id;
    return h.response({
        status: 'ACCEPTED'
    }).code(200);
}
