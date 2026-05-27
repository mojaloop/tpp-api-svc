"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putTransaction = putTransaction;
async function putTransaction(request, h) {
    const id = request.params.id;
    return h.response({
        transactionRequestId: id,
        status: 'ACCEPTED'
    }).code(200);
}
