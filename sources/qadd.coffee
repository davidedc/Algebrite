#  Add rational numbers
#
#  Input:    tos-2    addend
#
#      tos-1    addend
#
#  Output:    sum on stack



qadd = ->
  # a, qadd_ab, b, qadd_ba, c are all bigNum
  # we are adding the fractions qadd_frac1 + qadd_frac2 i.e.
  # qadd_frac1.q.a/qadd_frac1.q.b + qadd_frac2.q.a/qadd_frac2.q.b

  qadd_frac2 = pop()
  qadd_frac1 = pop()

  qadd_ab = mmul(qadd_frac1.q.a, qadd_frac2.q.b)
  qadd_ba = mmul(qadd_frac1.q.b, qadd_frac2.q.a)

  qadd_numerator = madd(qadd_ab, qadd_ba)

  #mfree(qadd_ab)
  #mfree(qadd_ba)

  # zero?

  if (MZERO(qadd_numerator))
    #console.log "qadd IS ZERO"
    #mfree(qadd_numerator)
    push(zero)
    return

  qadd_denominator = mmul(qadd_frac1.q.b, qadd_frac2.q.b)

  gcdBetweenNumeratorAndDenominator = mgcd(qadd_numerator, qadd_denominator)
  #console.log "gcd("+qadd_numerator+","+qadd_denominator+"): " + gcdBetweenNumeratorAndDenominator

  gcdBetweenNumeratorAndDenominator = makeSignSameAs(gcdBetweenNumeratorAndDenominator,qadd_denominator)

  #console.log "qadd qadd_denominator: " + qadd_denominator
  #console.log "qadd gcdBetweenNumeratorAndDenominator: " + gcdBetweenNumeratorAndDenominator

  resultSum = new U()

  resultSum.k = NUM

  resultSum.q.a = mdiv(qadd_numerator, gcdBetweenNumeratorAndDenominator)
  resultSum.q.b = mdiv(qadd_denominator, gcdBetweenNumeratorAndDenominator)

  #console.log "qadd resultSum.q.a: " + resultSum.q.a
  #console.log "qadd resultSum.q.b: " + resultSum.q.b

  #mfree(qadd_numerator)
  #mfree(qadd_denominator)
  #mfree(gcdBetweenNumeratorAndDenominator)

  push(resultSum)
  #console.log "qadd result: " + resultSum

