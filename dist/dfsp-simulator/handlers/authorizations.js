"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putAuthorization = putAuthorization;
async function putAuthorization(request, h) {
    const id = request.params.id;
    return h.response({
        authorizationId: id,
        status: 'VERIFIED',
        authenticationInfo: {
            authentication: 'OTP',
            authenticationValue: '123456'
        }
    }).code(200);
}
