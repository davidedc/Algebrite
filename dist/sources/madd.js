"use strict";
// Bignum addition and subtraction
Object.defineProperty(exports, "__esModule", { value: true });
exports.msub = exports.madd = void 0;
//static unsigned int *addf(unsigned int *, unsigned int *)
//static unsigned int *subf(unsigned int *, unsigned int *)
function madd(a, b) {
    return a.add(b);
}
exports.madd = madd;
function msub(a, b) {
    return a.subtract(b);
}
exports.msub = msub;
function addf(a, b) {
    return a.add(b);
}
function subf(a, b) {
    return a.subtract(b);
}
