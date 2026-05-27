"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tppAuthorizationsIdPutPayload = exports.tppAuthorizationsIdPutHeaders = void 0;
const joi_1 = __importDefault(require("joi"));
const common_1 = require("./common");
const AuthorizationResponseTypeRejected = joi_1.default.string().valid('REJECTED').required();
const AuthorizationResponseTypeAccepted = joi_1.default.string().valid('ACCEPTED').required();
const SignedPayloadTypeFIDO = joi_1.default.string().valid('FIDO').required();
const SignedPayloadTypeGeneric = joi_1.default.string().valid('GENERIC').required();
const FIDOPublicKeyCredentialAssertion = joi_1.default.object({
    id: joi_1.default.string().min(59).max(118).required(),
    rawId: joi_1.default.string().min(59).max(118).required(),
    response: joi_1.default.object({
        authenticatorData: joi_1.default.string().min(49).max(256).required(),
        clientDataJSON: joi_1.default.string().min(121).max(512).required(),
        signature: joi_1.default.string().min(59).max(256).required(),
        userHandle: joi_1.default.string().min(1).max(88).optional()
    }).required(),
    type: joi_1.default.string().valid('public-key').required()
});
const SignedPayloadFIDO = joi_1.default.object({
    signedPayloadType: SignedPayloadTypeFIDO,
    fidoSignedPayload: FIDOPublicKeyCredentialAssertion.required()
});
const SignedPayloadGeneric = joi_1.default.object({
    signedPayloadType: SignedPayloadTypeGeneric,
    genericSignedPayload: common_1.BinaryString
});
const TppAuthorizationsIDPutResponseRejected = joi_1.default.object({
    responseType: AuthorizationResponseTypeRejected,
    extensionList: common_1.ExtensionList.optional()
});
const TppAuthorizationsIDPutResponseFIDO = joi_1.default.object({
    responseType: AuthorizationResponseTypeAccepted,
    signedPayload: SignedPayloadFIDO.required(),
    extensionList: common_1.ExtensionList.optional()
});
const TppAuthorizationsIDPutResponseGeneric = joi_1.default.object({
    responseType: AuthorizationResponseTypeAccepted,
    signedPayload: SignedPayloadGeneric.required(),
    extensionList: common_1.ExtensionList.optional()
});
exports.tppAuthorizationsIdPutHeaders = joi_1.default.object({
    'content-type': joi_1.default.string().required(),
    'content-length': joi_1.default.string().required(),
    'date': joi_1.default.string().required(),
    'fspiop-source': joi_1.default.string().required(),
    'fspiop-destination': joi_1.default.string().optional(),
    'fspiop-encryption': joi_1.default.string().optional(),
    'fspiop-signature': joi_1.default.string().optional(),
    'fspiop-uri': joi_1.default.string().optional(),
    'fspiop-http-method': joi_1.default.string().optional(),
    'x-forwarded-for': joi_1.default.string().optional()
}).unknown(true);
exports.tppAuthorizationsIdPutPayload = joi_1.default.alternatives().try(TppAuthorizationsIDPutResponseRejected, TppAuthorizationsIDPutResponseFIDO, TppAuthorizationsIDPutResponseGeneric);
