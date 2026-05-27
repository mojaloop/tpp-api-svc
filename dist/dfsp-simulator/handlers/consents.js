"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putConsent = putConsent;
async function putConsent(request, h) {
    const id = request.params.id;
    return h.response({
        consentId: id,
        status: 'ACCEPTED'
    }).code(200);
}
