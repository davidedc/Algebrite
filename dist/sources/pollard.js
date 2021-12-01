"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factor_number = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
const defs_1 = require("../runtime/defs");
const mcmp_1 = require("../runtime/mcmp");
const run_1 = require("../runtime/run");
const bignum_1 = require("./bignum");
const is_1 = require("./is");
const list_1 = require("./list");
const madd_1 = require("./madd");
const mgcd_1 = require("./mgcd");
const mmul_1 = require("./mmul");
const mprime_1 = require("./mprime");
// Factor using the Pollard rho method
let n_factor_number = big_integer_1.default(0);
function factor_number(p1) {
    // 0 or 1?
    if (is_1.equaln(p1, 0) || is_1.equaln(p1, 1) || is_1.equaln(p1, -1)) {
        return p1;
    }
    n_factor_number = p1.q.a;
    const factors = factor_a();
    if (factors.length === 0) {
        //
    }
    if (factors.length === 1) {
        return factors[0];
    }
    if (factors.length > 1) {
        return new defs_1.Cons(defs_1.symbol(defs_1.MULTIPLY), list_1.makeList(...factors));
    }
}
exports.factor_number = factor_number;
// factor using table look-up, then switch to rho method if necessary
// From TAOCP Vol. 2 by Knuth, p. 380 (Algorithm A)
function factor_a() {
    const result = [];
    if (n_factor_number.isNegative()) {
        n_factor_number = bignum_1.setSignTo(n_factor_number, 1);
        result.push(defs_1.Constants.negOne);
    }
    for (let k = 0; k < 10000; k++) {
        result.push(...try_kth_prime(k));
        // if n_factor_number is 1 then we're done
        if (n_factor_number.compare(1) === 0) {
            return result;
        }
    }
    result.push(...factor_b());
    return result;
}
function try_kth_prime(k) {
    const result = [];
    let q;
    const d = bignum_1.mint(defs_1.primetab[k]);
    let count = 0;
    while (true) {
        // if n_factor_number is 1 then we're done
        if (n_factor_number.compare(1) === 0) {
            if (count) {
                result.push(_factor(d, count));
            }
            return result;
        }
        let r;
        [q, r] = Array.from(mmul_1.mdivrem(n_factor_number, d));
        // continue looping while remainder is zero
        if (r.isZero()) {
            count++;
            n_factor_number = q;
        }
        else {
            break;
        }
    }
    if (count) {
        result.push(_factor(d, count));
    }
    // q = n_factor_number/d, hence if q < d then
    // n_factor_number < d^2 so n_factor_number is prime
    if (mcmp_1.mcmp(q, d) === -1) {
        result.push(_factor(n_factor_number, 1));
        n_factor_number = bignum_1.mint(1);
    }
    return result;
}
// From TAOCP Vol. 2 by Knuth, p. 385 (Algorithm B)
function factor_b() {
    const result = [];
    const bigint_one = bignum_1.mint(1);
    let x = bignum_1.mint(5);
    let xprime = bignum_1.mint(2);
    let k = 1;
    let l = 1;
    while (true) {
        if (mprime_1.mprime(n_factor_number)) {
            result.push(_factor(n_factor_number, 1));
            return result;
        }
        while (true) {
            if (defs_1.defs.esc_flag) {
                run_1.stop('esc');
            }
            // g = gcd(x' - x, n_factor_number)
            let t = madd_1.msub(xprime, x);
            t = bignum_1.setSignTo(t, 1);
            const g = mgcd_1.mgcd(t, n_factor_number);
            if (defs_1.MEQUAL(g, 1)) {
                if (--k === 0) {
                    xprime = x;
                    l *= 2;
                    k = l;
                }
                // x = (x ^ 2 + 1) mod n_factor_number
                t = mmul_1.mmul(x, x);
                x = madd_1.madd(t, bigint_one);
                t = mmul_1.mmod(x, n_factor_number);
                x = t;
                continue;
            }
            result.push(_factor(g, 1));
            if (mcmp_1.mcmp(g, n_factor_number) === 0) {
                return result;
            }
            // n_factor_number = n_factor_number / g
            t = mmul_1.mdiv(n_factor_number, g);
            n_factor_number = t;
            // x = x mod n_factor_number
            t = mmul_1.mmod(x, n_factor_number);
            x = t;
            // xprime = xprime mod n_factor_number
            t = mmul_1.mmod(xprime, n_factor_number);
            xprime = t;
            break;
        }
    }
}
function _factor(d, count) {
    let factor = new defs_1.Num(d);
    if (count > 1) {
        factor = list_1.makeList(defs_1.symbol(defs_1.POWER), factor, new defs_1.Num(bignum_1.mint(count)));
    }
    return factor;
}
