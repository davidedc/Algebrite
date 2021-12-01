"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qmul = void 0;
const defs_1 = require("../runtime/defs");
const bignum_1 = require("./bignum");
const mgcd_1 = require("./mgcd");
const mmul_1 = require("./mmul");
//  Multiply rational numbers
//
//  Input:    p1    multiplicand
//            p2    multiplier
//
//  Output:    product
function qmul(p1, p2) {
    // zero?
    if (defs_1.MZERO(p1.q.a) || defs_1.MZERO(p2.q.a)) {
        return defs_1.Constants.zero;
    }
    const aa = mmul_1.mmul(p1.q.a, p2.q.a);
    const bb = mmul_1.mmul(p1.q.b, p2.q.b);
    let c = mgcd_1.mgcd(aa, bb);
    c = bignum_1.makeSignSameAs(c, bb);
    return new defs_1.Num(mmul_1.mdiv(aa, c), mmul_1.mdiv(bb, c));
}
exports.qmul = qmul;
