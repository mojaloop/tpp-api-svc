"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionList = exports.BinaryString = void 0;
const joi_1 = __importDefault(require("joi"));
exports.BinaryString = joi_1.default.string()
    .pattern(/^[A-Za-z0-9-_]+[=]{0,2}$/)
    .required();
const ExtensionKey = joi_1.default.string().min(1).max(32).required();
const ExtensionValue = joi_1.default.string().min(1).max(128).required();
const Extension = joi_1.default.object({
    key: ExtensionKey,
    value: ExtensionValue
});
exports.ExtensionList = joi_1.default.object({
    extension: joi_1.default.array().items(Extension).min(1).max(16).required()
});
