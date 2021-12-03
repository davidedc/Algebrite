"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mgcd = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
//-----------------------------------------------------------------------------
//
//  Bignum GCD
//
//  Uses the binary GCD algorithm.
//
//  See "The Art of Computer Programming" p. 338.
//
//  mgcd always returns a positive value
//
//  mgcd(0, 0) = 0
//
//  mgcd(u, 0) = |u|
//
//  mgcd(0, v) = |v|
//
//-----------------------------------------------------------------------------
function mgcd(u, v) {
    return big_integer_1.default.gcd(u, v);
}
exports.mgcd = mgcd;
//if SELFTEST
