"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcmp = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
// Bignum compare
//  returns
//  -1    a < b
//  0    a = b
//  1    a > b
function mcmp(a, b) {
    return a.compare(b);
}
exports.mcmp = mcmp;
// a is a bigint, n is a normal int
function mcmpint(a, n) {
    const b = big_integer_1.default(n);
    const t = mcmp(a, b);
    return t;
}
