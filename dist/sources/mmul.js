"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mdivrem = exports.mmod = exports.mdiv = exports.mmul = void 0;
// Bignum multiplication and division
function mmul(a, b) {
    return a.multiply(b);
}
exports.mmul = mmul;
function mdiv(a, b) {
    return a.divide(b);
}
exports.mdiv = mdiv;
// a = a + b
/*
static void
addf(unsigned int *a, unsigned int *b, int len)
{
  int i
  long long t = 0; # can be signed or unsigned
  for (i = 0; i < len; i++) {
    t += (long long) a[i] + b[i]
    a[i] = (unsigned int) t
    t >>= 32
  }
}

// a = a - b

static void
subf(unsigned int *a, unsigned int *b, int len)
{
  int i
  long long t = 0; # must be signed
  for (i = 0; i < len; i++) {
    t += (long long) a[i] - b[i]
    a[i] = (unsigned int) t
    t >>= 32
  }
}

// a = b * c

// 0xffffffff + 0xffffffff * 0xffffffff == 0xffffffff00000000

static void
mulf(unsigned int *a, unsigned int *b, int len, unsigned int c)
{
  int i
  unsigned long long t = 0; # must be unsigned
  for (i = 0; i < len; i++) {
    t += (unsigned long long) b[i] * c
    a[i] = (unsigned int) t
    t >>= 32
  }
  a[i] = (unsigned int) t
}
*/
function mmod(a, b) {
    return a.mod(b);
}
exports.mmod = mmod;
// return both quotient and remainder of a/b
// we'd have this method as divmod(number)
// but obviously doesn't change the passed parameters
function mdivrem(a, b) {
    const toReturn = a.divmod(b);
    return [toReturn.quotient, toReturn.remainder];
}
exports.mdivrem = mdivrem;
//if SELFTEST
// small integer tests
