"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qdiv = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const bignum_1 = require("./bignum");
const mgcd_1 = require("./mgcd");
const mmul_1 = require("./mmul");
//  Divide rational numbers
//
//  Input:    p1    dividend
//            p2    divisor
//
//  Output:    quotient
function qdiv(p1, p2) {
    // zero?
    if (defs_1.MZERO(p2.q.a)) {
        run_1.stop('divide by zero');
    }
    if (defs_1.MZERO(p1.q.a)) {
        return defs_1.Constants.zero;
    }
    const aa = mmul_1.mmul(p1.q.a, p2.q.b);
    const bb = mmul_1.mmul(p1.q.b, p2.q.a);
    let c = mgcd_1.mgcd(aa, bb);
    c = bignum_1.makeSignSameAs(c, bb);
    return new defs_1.Num(mmul_1.mdiv(aa, c), mmul_1.mdiv(bb, c));
}
exports.qdiv = qdiv;
