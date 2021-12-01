"use strict";
// Bignum prime test (returns 1 if prime, 0 if not)
Object.defineProperty(exports, "__esModule", { value: true });
exports.mprime = void 0;
// Uses Algorithm P (probabilistic primality test) from p. 395 of
// "The Art of Computer Programming, Volume 2" by Donald E. Knuth.
function mprime(n) {
    return n.isProbablePrime();
}
exports.mprime = mprime;
//if SELFTEST
