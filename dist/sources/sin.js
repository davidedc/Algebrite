"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sine = exports.Eval_sin = void 0;
const defs_1 = require("../runtime/defs");
const stack_1 = require("../runtime/stack");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const cos_1 = require("./cos");
const eval_1 = require("./eval");
const is_1 = require("./is");
const list_1 = require("./list");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
// Sine function of numerical and symbolic arguments
function Eval_sin(p1) {
    const result = sine(eval_1.Eval(defs_1.cadr(p1)));
    stack_1.push(result);
}
exports.Eval_sin = Eval_sin;
function sine(p1) {
    if (defs_1.isadd(p1)) {
        // sin of a sum can be further decomposed into
        //sin(alpha+beta) = sin(alpha)*cos(beta)+sin(beta)*cos(alpha)
        return sine_of_angle_sum(p1);
    }
    return sine_of_angle(p1);
}
exports.sine = sine;
//console.log "sine end ---- "
// Use angle sum formula for special angles.
// decompose sum sin(alpha+beta) into
// sin(alpha)*cos(beta)+sin(beta)*cos(alpha)
function sine_of_angle_sum(p1) {
    let p2 = defs_1.cdr(p1);
    while (defs_1.iscons(p2)) {
        const B = defs_1.car(p2);
        if (is_1.isnpi(B)) {
            const A = add_1.subtract(p1, B);
            return add_1.add(multiply_1.multiply(sine(A), cos_1.cosine(B)), multiply_1.multiply(cos_1.cosine(A), sine(B)));
        }
        p2 = defs_1.cdr(p2);
    }
    return sine_of_angle(p1);
}
function sine_of_angle(p1) {
    if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCSIN)) {
        return defs_1.cadr(p1);
    }
    if (defs_1.isdouble(p1)) {
        let d = Math.sin(p1.d);
        if (Math.abs(d) < 1e-10) {
            d = 0.0;
        }
        return bignum_1.double(d);
    }
    // sine function is antisymmetric, sin(-x) = -sin(x)
    if (is_1.isnegative(p1)) {
        return multiply_1.negate(sine(multiply_1.negate(p1)));
    }
    // sin(arctan(x)) = x / sqrt(1 + x^2)
    // see p. 173 of the CRC Handbook of Mathematical Sciences
    if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCTAN)) {
        return multiply_1.multiply(defs_1.cadr(p1), power_1.power(add_1.add(defs_1.Constants.one, power_1.power(defs_1.cadr(p1), bignum_1.integer(2))), bignum_1.rational(-1, 2)));
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
        return list_1.makeList(defs_1.symbol(defs_1.SIN), p1);
    }
    // values of some famous angles. Many more here:
    // https://en.wikipedia.org/wiki/Trigonometric_constants_expressed_in_real_radicals
    switch (n % 360) {
        case 0:
        case 180:
            return defs_1.Constants.zero;
        case 30:
        case 150:
            return bignum_1.rational(1, 2);
        case 210:
        case 330:
            return bignum_1.rational(-1, 2);
        case 45:
        case 135:
            return multiply_1.multiply(bignum_1.rational(1, 2), power_1.power(bignum_1.integer(2), bignum_1.rational(1, 2)));
        case 225:
        case 315:
            return multiply_1.multiply(bignum_1.rational(-1, 2), power_1.power(bignum_1.integer(2), bignum_1.rational(1, 2)));
        case 60:
        case 120:
            return multiply_1.multiply(bignum_1.rational(1, 2), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
        case 240:
        case 300:
            return multiply_1.multiply(bignum_1.rational(-1, 2), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
        case 90:
            return defs_1.Constants.one;
        case 270:
            return defs_1.Constants.negOne;
        default:
            return list_1.makeList(defs_1.symbol(defs_1.SIN), p1);
    }
}
