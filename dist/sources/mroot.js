"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mroot = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
const mcmp_1 = require("../runtime/mcmp");
const run_1 = require("../runtime/run");
const bignum_1 = require("./bignum");
const mpow_1 = require("./mpow");
//-----------------------------------------------------------------------------
//
//  Bignum root
//
//  Returns null pointer if not perfect root.
//
//  The sign of the radicand is ignored.
//
//-----------------------------------------------------------------------------
function mroot(n, index) {
    n = n.abs();
    if (index === 0) {
        run_1.stop('root index is zero');
    }
    // count number of bits
    let k = 0;
    while (n.shiftRight(k).toJSNumber() > 0) {
        k++;
    }
    if (k === 0) {
        return bignum_1.mint(0);
    }
    // initial guess
    k = Math.floor((k - 1) / index);
    const j = Math.floor(k / 32 + 1);
    let x = big_integer_1.default(j);
    for (let i = 0; i < j; i++) {
        // zero-out the ith bit
        x = x.and(big_integer_1.default(1).shiftLeft(i).not());
    }
    while (k >= 0) {
        // set the kth bit
        x = x.or(big_integer_1.default(1).shiftLeft(k));
        const y = mpow_1.mpow(x, index);
        switch (mcmp_1.mcmp(y, n)) {
            case 0:
                return x;
            case 1:
                //mp_clr_bit(x, k)
                // clear the kth bit
                x = x.and(big_integer_1.default(1).shiftLeft(k).not());
                break;
        }
        k--;
    }
    return 0;
}
exports.mroot = mroot;
//if SELFTEST
