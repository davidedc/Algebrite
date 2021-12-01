"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eval_tan = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const bignum_1 = require("./bignum");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
// Tangent function of numerical and symbolic arguments
function Eval_tan(p1) {
    const result = tangent(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_tan = Eval_tan;
function tangent(p1) {
    if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCTAN)) {
        return defs_1.cadr(p1);
    }
    if (defs_1.isdouble(p1)) {
        let d = Math.tan(p1.d);
        if (Math.abs(d) < 1e-10) {
            d = 0.0;
        }
        return bignum_1.double(d);
    }
    // tan function is antisymmetric, tan(-x) = -tan(x)
    if (is_1.isnegative(p1)) {
        return multiply_1.negate(tangent(multiply_1.negate(p1)));
    }
    // multiply by 180/pi to go from radians to degrees.
    // we go from radians to degrees because it's much
    // easier to calculate symbolic results of most (not all) "classic"
    // angles (e.g. 30,45,60...) if we calculate the degrees
    // and the we do a switch on that.
    // Alternatively, we could look at the fraction of pi
    // (e.g. 60 degrees is 1/3 pi) but that's more
    // convoluted as we'd need to look at both numerator and
    // denominator.
    const n = bignum_1.nativeInt(multiply_1.divide(multiply_1.multiply(p1, bignum_1.integer(180)), defs_1.Constants.Pi()));
    // most "good" (i.e. compact) trigonometric results
    // happen for a round number of degrees. There are some exceptions
    // though, e.g. 22.5 degrees, which we don't capture here.
    if (n < 0 || isNaN(n)) {
        return list_1.makeList(defs_1.symbol(defs_1.TAN), p1);
    }
    switch (n % 360) {
        case 0:
        case 180:
            return defs_1.Constants.zero;
        case 30:
        case 210:
            return multiply_1.multiply(bignum_1.rational(1, 3), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
        case 150:
        case 330:
            return multiply_1.multiply(bignum_1.rational(-1, 3), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
        case 45:
        case 225:
            return defs_1.Constants.one;
        case 135:
        case 315:
            return defs_1.Constants.negOne;
        case 60:
        case 240:
            return power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2));
        case 120:
        case 300:
            return multiply_1.negate(power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
        default:
            return list_1.makeList(defs_1.symbol(defs_1.TAN), p1);
    }
}
