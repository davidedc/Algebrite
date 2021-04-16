// Bignum power
export function mpow(
  a: bigInt.BigInteger,
  n: number | bigInt.BigInteger
): bigInt.BigInteger {
  return a.pow(n);
}

//if SELFTEST
