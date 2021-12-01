"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dpow = void 0;
const defs_1 = require("../runtime/defs");
const run_1 = require("../runtime/run");
const add_1 = require("./add");
const bignum_1 = require("./bignum");
const multiply_1 = require("./multiply");
// power function for double precision floating point
function dpow(base, expo) {
    // divide by zero?
    if (base === 0.0 && expo < 0.0) {
        run_1.stop('divide by zero');
    }
    // nonnegative base or integer power?
    if (base >= 0.0 || expo % 1.0 === 0.0) {
        return bignum_1.double(Math.pow(base, expo));
    }
    const result = Math.pow(Math.abs(base), expo);
    const theta = Math.PI * expo;
    let a = 0.0;
    let b = 0.0;
    // this ensures the real part is 0.0 instead of a tiny fraction
    if (expo % 0.5 === 0.0) {
        a = 0.0;
        b = Math.sin(theta);
    }
    else {
        a = Math.cos(theta);
        b = Math.sin(theta);
    }
    return add_1.add(bignum_1.double(a * result), multiply_1.multiply(bignum_1.double(b * result), defs_1.Constants.imaginaryunit));
}
exports.dpow = dpow;
