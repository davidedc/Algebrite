# Factor a polynomial

factorpoly = ->
  if DEBUG then console.log "factorpoly: " + stack[tos-1].toString() + " " + stack[tos-2].toString()

  save()

  variable = pop()
  polynomial = pop()

  if !Find(polynomial, variable) or
   !ispolyexpandedform(polynomial, variable) or
   !issymbol(variable)
    push(polynomial)

  else
    yyfactorpoly(variable, polynomial)

  restore()

#-----------------------------------------------------------------------------
#
#  Input:    tos-2    true polynomial
#
#      tos-1    free variable
#
#  Output:    factored polynomial on stack
#
#-----------------------------------------------------------------------------

yyfactorpoly = (variable, polynomial) ->

  if DEBUG
    firstParam = variable
    secondParam = polynomial
    console.log "yyfactorpoly: " + firstParam + " " + secondParam


  save()

  h = tos

  if (isfloating(polynomial))
    stop("floating point numbers in polynomial")

  polycoeff = tos

  factpoly_expo = coeff(variable, polynomial) - 1

  if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " factpoly_expo before rationalize_coefficients: " + factpoly_expo
  partOfPolynomialFactoredSoFar = rationalize_coefficients(h)
  if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " factpoly_expo  after rationalize_coefficients: " + factpoly_expo

  # for univariate polynomials we could do factpoly_expo > 1

  whichRootsAreWeFinding = "real"
  remainingPoly = null
  while (factpoly_expo > 0)
    if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " factpoly_expo inside while loop: " + factpoly_expo

    if (isZeroAtomOrTensor(stack[polycoeff+0]))
      if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " isZeroAtomOrTensor"
      A = one
      B = zero
    else
      #console.log("trying to find a " + whichRootsAreWeFinding + " root")
      if whichRootsAreWeFinding == "real"
        [foundRealRoot,A,B] = get_factor_from_real_root(variable, factpoly_expo, polycoeff)
      else if whichRootsAreWeFinding == "complex"
        [foundComplexRoot,A] = get_factor_from_complex_root(remainingPoly, factpoly_expo, polycoeff)

    if whichRootsAreWeFinding == "real"
      if foundRealRoot == 0
        whichRootsAreWeFinding = "complex"
        continue
      else
        # build the 1-degree polynomial out of the
        # real solution that was just found.
        push(A) # A
        push(variable) # x
        multiply()
        push(B) # B
        add()
        AxPlusB = pop()

        if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " success\nFACTOR=" + AxPlusB

        # factor out negative sign (not req'd because A > 1)
        #if 0
        ###
        if (isnegativeterm(A))
          push(AxPlusB)
          negate()
          AxPlusB = pop()
          push(partOfPolynomialFactoredSoFar)
          negate_noexpand()
          partOfPolynomialFactoredSoFar = pop()
        ###
        #endif
        
        # partOfPolynomialFactoredSoFar is the part of the polynomial that was factored so far,
        # add the newly found factor to it. Note that we are not actually
        # multiplying the polynomials fully, we are just leaving them
        # expressed as (P1)*(P2), we are not expanding the product.
        push(partOfPolynomialFactoredSoFar)
        push(AxPlusB)
        multiply_noexpand()
        partOfPolynomialFactoredSoFar = pop()

        # ok now on stack we have the coefficients of the
        # remaining part of the polynomial still to factor.
        # Divide it by the newly-found factor so that
        # the stack then contains the coefficients of the
        # polynomial part still left to factor.
        yydivpoly(factpoly_expo, polycoeff, A, B)

        while (factpoly_expo and isZeroAtomOrTensor(stack[polycoeff+factpoly_expo]))
          factpoly_expo--

        push(zero)
        for i in [0..factpoly_expo]
          push(stack[polycoeff+i])
          push(variable) # the free variable
          push_integer(i)
          power()
          multiply()
          add()
        remainingPoly = pop()
        #console.log("real branch remainingPoly: " + remainingPoly)

    else if whichRootsAreWeFinding == "complex"
      if foundComplexRoot == 0
        break
      else
        # build the 2-degree polynomial out of the
        # real solution that was just found.
        push(A) # A
        push(variable) # x
        subtract()
        #console.log("first factor: " + stack[tos-1].toString())

        push(A) # A
        conjugate()
        push(variable) # x
        subtract()
        #console.log("second factor: " + stack[tos-1].toString())

        multiply()

        #if (factpoly_expo > 0 && isnegativeterm(stack[polycoeff+factpoly_expo]))
        #  negate()
        #  negate_noexpand()
          
        secondDegreePloly = pop()

        if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " success\nFACTOR=" + secondDegreePloly

        # factor out negative sign (not req'd because A > 1)
        #if 0
        ###
        if (isnegativeterm(A))
          push(secondDegreePloly)
          negate()
          secondDegreePloly = pop()
          push(partOfPolynomialFactoredSoFar)
          negate_noexpand()
          partOfPolynomialFactoredSoFar = pop()
        ###
        #endif
        
        # partOfPolynomialFactoredSoFar is the part of the polynomial that was factored so far,
        # add the newly found factor to it. Note that we are not actually
        # multiplying the polynomials fully, we are just leaving them
        # expressed as (P1)*(P2), we are not expanding the product.

        push(partOfPolynomialFactoredSoFar)
        previousFactorisation = pop()

        #console.log("previousFactorisation: " + previousFactorisation)

        push(partOfPolynomialFactoredSoFar)
        push(secondDegreePloly)
        multiply_noexpand()
        partOfPolynomialFactoredSoFar = pop()

        #console.log("new prospective factorisation: " + partOfPolynomialFactoredSoFar)


        # build the polynomial of the unfactored part
        #console.log("build the polynomial of the unfactored part factpoly_expo: " + factpoly_expo)
        
        if !remainingPoly?
          push(zero)
          for i in [0..factpoly_expo]
            push(stack[polycoeff+i])
            push(variable) # the free variable
            push_integer(i)
            power()
            multiply()
            add()
          remainingPoly = pop()
        #console.log("original polynomial (dividend): " + remainingPoly)

        dividend = remainingPoly
        #push(dividend)
        #degree()
        #startingDegree = pop()
        push(dividend)

        #console.log("dividing " + stack[tos-1].toString() + " by " + secondDegreePloly)
        push(secondDegreePloly) # divisor
        push(variable) # X
        divpoly()
        remainingPoly = pop()

        push(remainingPoly)
        push(secondDegreePloly) # divisor
        multiply()
        checkingTheDivision = pop()

        if !equal(checkingTheDivision, dividend)

          #push(dividend)
          #gcd_sum()
          #console.log("gcd top of stack: " + stack[tos-1].toString())


          if DEBUG then console.log("we found a polynomial based on complex root and its conj but it doesn't divide the poly, quitting")
          if DEBUG then console.log("so just returning previousFactorisation times dividend: " + previousFactorisation + " * " + dividend)
          push(previousFactorisation)
          push(dividend)

          prev_expanding = expanding
          expanding = 0
          yycondense()
          expanding = prev_expanding

          multiply_noexpand()
          partOfPolynomialFactoredSoFar = pop()
          stack[h] = partOfPolynomialFactoredSoFar
          moveTos h + 1
          restore()
          return

        #console.log("result: (still to be factored) " + remainingPoly)

        #push(remainingPoly)
        #degree()
        #remainingDegree = pop()

        ###
        if compare_numbers(startingDegree, remainingDegree)
          # ok even if we found a complex root that
          # together with the conjugate generates a poly in Z,
          # that doesn't mean that the division would end up in Z.
          # Example: 1+x^2+x^4+x^6 has +i and -i as one of its roots
          # so a factor is 1+x^2 ( = (x+i)*(x-i))
          # BUT 
        ###


        for i in [0..factpoly_expo]
          pop()

        coeff(variable, remainingPoly)


        factpoly_expo -= 2
        #console.log("factpoly_expo: " + factpoly_expo)


  if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " building the remaining unfactored part of the polynomial"

  push(zero)
  for i in [0..factpoly_expo]
    push(stack[polycoeff+i])
    push(variable) # the free variable
    push_integer(i)
    power()
    multiply()
    add()
  polynomial = pop()

  if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " remaining unfactored part of the polynomial: " + polynomial.toString()

  push(polynomial)

  prev_expanding = expanding
  expanding = 0
  yycondense()
  expanding = prev_expanding

  polynomial = pop()
  if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " new poly with extracted common factor: " + polynomial.toString()
  #debugger

  # factor out negative sign

  if (factpoly_expo > 0 && isnegativeterm(stack[polycoeff+factpoly_expo]))
    push(polynomial)
    #prev_expanding = expanding
    #expanding = 1
    negate()
    #expanding = prev_expanding
    polynomial = pop()
    push(partOfPolynomialFactoredSoFar)
    negate_noexpand()
    partOfPolynomialFactoredSoFar = pop()

  push(partOfPolynomialFactoredSoFar)
  push(polynomial)
  multiply_noexpand()
  partOfPolynomialFactoredSoFar = pop()

  if DEBUG then console.log "yyfactorpoly: " + firstParam + " " + secondParam + " result: " + partOfPolynomialFactoredSoFar

  stack[h] = partOfPolynomialFactoredSoFar

  moveTos h + 1

  restore()

rationalize_coefficients = (h) ->

  # LCM of all polynomial coefficients

  ratio = one
  for i in [h...tos]
    push(stack[i])
    denominator()
    push(ratio)
    lcm()
    ratio = pop()

  # multiply each coefficient by RESULT

  for i in [h...tos]
    push(ratio)
    push(stack[i])
    multiply()
    stack[i] = pop()

  # reciprocate RESULT

  push(ratio)
  reciprocate()
  ratioInverse = pop()
  if DEBUG then console.log "rationalize_coefficients result: " + ratioInverse.toString()
  return ratioInverse

get_factor_from_real_root = (variable, factpoly_expo, polycoeff)->

  if DEBUG then console.log "get_factor_from_real_root"

  i = 0
  j = 0
  h = 0
  a0 = 0
  an = 0
  na0 = 0
  nan = 0

  if DEBUG
    push(zero)
    for i in [0..factpoly_expo]
      push(stack[polycoeff+i])
      push(variable)
      push_integer(i)
      power()
      multiply()
      add()
    polynomial = pop()
    console.log("POLY=" + polynomial)

  h = tos

  an = tos
  push(stack[polycoeff+factpoly_expo])

  divisors_onstack()

  nan = tos - an

  a0 = tos
  push(stack[polycoeff+0])
  divisors_onstack()
  na0 = tos - a0

  if DEBUG
    console.log("divisors of base term")
    for i in [0...na0]
      console.log(", " + stack[a0 + i])
    console.log("divisors of leading term")
    for i in [0...nan]
      console.log(", " + stack[an + i])

  # try roots

  for rootsTries_i in [0...nan]
    for rootsTries_j in [0...na0]

      #if DEBUG then console.log "nan: " + nan + " na0: " + na0 + " i: " + rootsTries_i + " j: " + rootsTries_j

      testNumerator = stack[an + rootsTries_i]
      testDenominator = stack[a0 + rootsTries_j]

      push(testDenominator)
      push(testNumerator)
      divide()
      negate()
      testValue = pop()

      evalPolyResult = Evalpoly(factpoly_expo, polycoeff, testValue)

      if DEBUG
        console.log("try A=" + testNumerator)
        console.log(", B=" + testDenominator)
        console.log(", root " + variable)
        console.log("=-B/A=" + testValue)
        console.log(", POLY(" + testValue)
        console.log(")=" + evalPolyResult)

      if (isZeroAtomOrTensor(evalPolyResult))
        moveTos h
        if DEBUG then console.log "get_factor_from_real_root returning 1"
        return [1, testNumerator, testDenominator]

      push(testDenominator)
      negate()
      testDenominator = pop()

      push(testValue)
      negate()
      testValue = pop()

      evalPolyResult = Evalpoly(factpoly_expo, polycoeff, testValue)

      if DEBUG
        console.log("try A=" + testNumerator)
        console.log(", B=" + testDenominator)
        console.log(", root " + variable)
        console.log("=-B/A=" + testValue)
        console.log(", POLY(" + testValue)
        console.log(")=" + evalPolyResult)

      if (isZeroAtomOrTensor(evalPolyResult))
        moveTos h
        if DEBUG then console.log "get_factor_from_real_root returning 1"
        return [1, testNumerator, testDenominator]

  moveTos h

  if DEBUG then console.log "get_factor_from_real_root returning"
  return [0, null, null]

get_factor_from_complex_root = (remainingPoly, factpoly_expo, polycoeff) ->

  i = 0
  j = 0
  h = 0
  a0 = 0
  an = 0
  na0 = 0
  nan = 0

  if factpoly_expo <= 2
    if DEBUG then console.log("no more factoring via complex roots to be found in polynomial of degree <= 2")
    return [0,null]

  if DEBUG then console.log("complex root finding for POLY=" + remainingPoly)

  h = tos
  an = tos

  # trying -1^(2/3) which generates a polynomial in Z
  # generates x^2 + 2x + 1
  push_integer(-1)
  push_rational(2,3)
  power()
  rect()
  testValue = pop()
  if DEBUG then console.log("complex root finding: trying with " + testValue)
  push(testValue)
  evalPolyResult = Evalpoly(factpoly_expo, polycoeff, testValue)
  if DEBUG then console.log("complex root finding result: " + evalPolyResult)
  if (isZeroAtomOrTensor(evalPolyResult))
    moveTos h
    if DEBUG then console.log "get_factor_from_complex_root returning 1"
    return [1,testValue]

  # trying 1^(2/3) which generates a polynomial in Z
  # http://www.wolframalpha.com/input/?i=(1)%5E(2%2F3)
  # generates x^2 - 2x + 1
  push_integer(1)
  push_rational(2,3)
  power()
  rect()
  testValue = pop()
  if DEBUG then console.log("complex root finding: trying with " + testValue)
  push(testValue)
  evalPolyResult = Evalpoly(factpoly_expo, polycoeff, testValue)
  if DEBUG then console.log("complex root finding result: " + evalPolyResult)
  if (isZeroAtomOrTensor(evalPolyResult))
    moveTos h
    if DEBUG then console.log "get_factor_from_complex_root returning 1"
    return [1,testValue]


  # trying some simple complex numbers. All of these
  # generate polynomials in Z
  for rootsTries_i in [-10..10]
    for rootsTries_j in [1..5]
      push_integer(rootsTries_i)
      push_integer(rootsTries_j)
      push(imaginaryunit)
      multiply()
      add()
      rect()
      testValue = pop()
      if DEBUG then console.log("complex root finding: trying simple complex combination " + testValue)


      push(testValue)

      evalPolyResult = Evalpoly(factpoly_expo, polycoeff, testValue)

      #console.log("complex root finding result: " + evalPolyResult)
      if (isZeroAtomOrTensor(evalPolyResult))
        moveTos h
        if DEBUG then console.log "found complex root: " + evalPolyResult
        return [1,testValue]

  moveTos h

  if DEBUG then console.log "get_factor_from_complex_root returning 0"
  return [0,null]

#-----------------------------------------------------------------------------
#
#  Divide a polynomial by Ax+B
#
#  Input:  on stack:  polycoeff  Dividend coefficients
#
#      factpoly_expo   as parameter
#
#      A    as parameter
#
#      B    as parameter
#
#  Output:   on stack: polycoeff  Contains quotient coefficients
#
#-----------------------------------------------------------------------------

yydivpoly = (factpoly_expo, polycoeff, A, B) ->
  Q = zero
  for i in [factpoly_expo...0]
    push(stack[polycoeff+i])
    stack[polycoeff+i] = Q
    push(A)
    divide()
    Q = pop()
    push(stack[polycoeff+i - 1])
    push(Q)
    push(B)
    multiply()
    subtract()
    stack[polycoeff+i - 1] = pop()
  stack[polycoeff+0] = Q
  if DEBUG then console.log "yydivpoly Q: " + Q.toString()

Evalpoly = (factpoly_expo, polycoeff, evaluateAt) ->
  push(zero)
  for i in [factpoly_expo..0]
    push(evaluateAt)
    multiply()
    push(stack[polycoeff+i])
    #if DEBUG
    #  console.log("Evalpoly top of stack:")
    #  console.log stack[tos-i].toString()
    add()
  return pop()

