// Bignum addition and subtraction

//static unsigned int *addf(unsigned int *, unsigned int *)
//static unsigned int *subf(unsigned int *, unsigned int *)

export function madd(
  a: bigInt.BigInteger,
  b: bigInt.BigInteger
): bigInt.BigInteger {
  return a.add(b);
}

export function msub(
  a: bigInt.BigInteger,
  b: bigInt.BigInteger
): bigInt.BigInteger {
  return a.subtract(b);
}

function addf(a, b) {
  return a.add(b);
}

function subf(a, b) {
  return a.subtract(b);
}
