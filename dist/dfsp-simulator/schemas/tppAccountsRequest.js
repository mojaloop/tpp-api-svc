"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tppAccountsRequestPostPayload = exports.tppAccountsRequestPostHeaders = void 0;
const joi_1 = __importDefault(require("joi"));
const CorrelationId = joi_1.default.string()
    .pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    .required();
const PartyIdentifier = joi_1.default.string().min(1).max(128).required();
const ConsentRequestChannelType = joi_1.default.string().valid('WEB', 'OTP');
const AuthChannels = joi_1.default.array()
    .items(ConsentRequestChannelType)
    .min(1)
    .max(256)
    .required();
const Uri = joi_1.default.string()
    .pattern(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/)
    .min(1)
    .max(512)
    .required();
exports.tppAccountsRequestPostHeaders = joi_1.default.object({
    'content-type': joi_1.default.string().required(),
    'date': joi_1.default.string().required(),
    'fspiop-source': joi_1.default.string().required(),
    'accept': joi_1.default.string().required(),
    'fspiop-destination': joi_1.default.string().optional(),
    'fspiop-encryption': joi_1.default.string().optional(),
    'fspiop-signature': joi_1.default.string().optional(),
    'fspiop-uri': joi_1.default.string().optional(),
    'fspiop-http-method': joi_1.default.string().optional(),
    'x-forwarded-for': joi_1.default.string().optional()
}).unknown(true);
exports.tppAccountsRequestPostPayload = joi_1.default.object({
    accountRequestId: CorrelationId,
    partyIdentifier: PartyIdentifier,
    authChannels: AuthChannels,
    callbackUri: Uri
});
