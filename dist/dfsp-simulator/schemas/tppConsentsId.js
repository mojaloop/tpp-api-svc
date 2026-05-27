"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tppConsentsIdPutPayload = exports.tppConsentsIdPutHeaders = void 0;
const joi_1 = __importDefault(require("joi"));
const common_1 = require("./common");
const AccountAddress = joi_1.default.string()
    .pattern(/^([0-9A-Za-z_~\-\.]+[0-9A-Za-z_~\-])$/)
    .min(1)
    .max(1023)
    .required();
const ScopeAction = joi_1.default.string().valid('ACCOUNTS_GET_BALANCE', 'ACCOUNTS_TRANSFER', 'ACCOUNTS_STATEMENT');
const Scope = joi_1.default.object({
    address: AccountAddress,
    actions: joi_1.default.array().items(ScopeAction).min(1).max(32).required()
});
const ConsentStatusIssued = joi_1.default.string().valid('ISSUED');
const CredentialType = joi_1.default.string().valid('FIDO', 'GENERIC').required();
const GenericCredential = joi_1.default.object({
    publicKey: common_1.BinaryString,
    signature: common_1.BinaryString
});
const FIDOPublicKeyCredentialAttestation = joi_1.default.object({
    id: joi_1.default.string().min(59).max(118).required(),
    rawId: joi_1.default.string().min(59).max(118).optional(),
    response: joi_1.default.object({
        clientDataJSON: joi_1.default.string().min(121).max(512).required(),
        attestationObject: joi_1.default.string().min(306).max(2048).required()
    }).required(),
    type: joi_1.default.string().valid('public-key').required()
});
const SignedCredential = joi_1.default.object({
    credentialType: CredentialType,
    status: joi_1.default.string().valid('PENDING').required(),
    genericPayload: GenericCredential.optional(),
    fidoPayload: FIDOPublicKeyCredentialAttestation.optional()
});
const VerifiedCredential = joi_1.default.object({
    credentialType: CredentialType,
    status: joi_1.default.string().valid('VERIFIED').required(),
    genericPayload: GenericCredential.optional(),
    fidoPayload: FIDOPublicKeyCredentialAttestation.optional()
});
// note: spec leaves genericPayload and fidoPayload both optional with no
// "exactly one" rule, so neither/both currently pass. ask daniel before tightening.
const ConsentsIDPutResponseSigned = joi_1.default.object({
    status: ConsentStatusIssued.optional(),
    scopes: joi_1.default.array().items(Scope).required(),
    credential: SignedCredential.required(),
    extensionList: common_1.ExtensionList.optional()
});
const ConsentsIDPutResponseVerified = joi_1.default.object({
    status: ConsentStatusIssued.optional(),
    scopes: joi_1.default.array().items(Scope).required(),
    credential: VerifiedCredential.required(),
    extensionList: common_1.ExtensionList.optional()
});
exports.tppConsentsIdPutHeaders = joi_1.default.object({
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
exports.tppConsentsIdPutPayload = joi_1.default.alternatives().try(ConsentsIDPutResponseSigned, ConsentsIDPutResponseVerified);
