"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerDfspSimulator;
const routes_1 = __importDefault(require("./routes"));
function registerDfspSimulator(server) {
    (0, routes_1.default)(server);
}
