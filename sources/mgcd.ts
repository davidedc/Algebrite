import bigInt from 'big-integer';

//-----------------------------------------------------------------------------
//
//  Bignum GCD
//
//  Uses the binary GCD algorithm.
//
//  See "The Art of Computer Programming" p. 338.
//
//  mgcd always returns a positive value
//
//  mgcd(0, 0) = 0
//
//  mgcd(u, 0) = |u|
//
//  mgcd(0, v) = |v|
//
//-----------------------------------------------------------------------------
export function mgcd(
  u: bigInt.BigNumber,
  v: bigInt.BigNumber
): bigInt.BigInteger {
  return bigInt.gcd(u, v);
}

//if SELFTEST
