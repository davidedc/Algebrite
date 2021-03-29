# Greatest common denominator
# can also be run on polynomials, however
# it works only on the integers and it works
# by factoring the polynomials (not Euclidean algorithm)

Eval_gcd = ->
  p1 = cdr(p1)
  push(car(p1))
  Eval()
  p1 = cdr(p1)
  while (iscons(p1))
    push(car(p1))
    Eval()
    gcd()
    p1 = cdr(p1)

gcd = ->
  prev_expanding = expanding
  save()
  gcd_main()
  restore()
  expanding = prev_expanding

gcd_main = ->
  expanding = 1

  p2 = pop()
  p1 = pop()

  if DEBUG then console.log "gcd_main: p1: " + p1 + " p2: " + p2

  if (equal(p1, p2))
    push(p1)
    return

  if (isrational(p1) && isrational(p2))
    push(p1)
    push(p2)
    gcd_numbers()
    return


  if (polyVar = areunivarpolysfactoredorexpandedform(p1, p2))
    gcd_polys(polyVar)
    return


  if (car(p1) == symbol(ADD) && car(p2) == symbol(ADD))
    gcd_sum_sum()
    return

  if (car(p1) == symbol(ADD))
    gcd_sum(p1)
    p1 = pop()

  if (car(p2) == symbol(ADD))
    gcd_sum(p2)
    p2 = pop()

  if (car(p1) == symbol(MULTIPLY))
    gcd_sum_product()
    return

  if (car(p2) == symbol(MULTIPLY))
    gcd_product_sum()
    return

  if (car(p1) == symbol(MULTIPLY) && car(p2) == symbol(MULTIPLY))
    gcd_product_product()
    return

  gcd_powers_with_same_base()


areunivarpolysfactoredorexpandedform = (p1, p2) ->
  if DEBUG then console.log "areunivarpolysfactoredorexpandedform: p1: " + p1 + " p2: " + p2
  if polyVar = isunivarpolyfactoredorexpandedform(p1)
    if isunivarpolyfactoredorexpandedform(p2,polyVar)
      return polyVar
  return false

gcd_polys = (polyVar) ->
  if DEBUG then console.log "gcd_polys: p1: " + p1 + " polyVar: " + polyVar
  # gcd of factors
  push(p1)
  push polyVar
  factorpoly()
  p1 = pop()
  push(p2)
  push polyVar
  factorpoly()
  p2 = pop()
  if DEBUG then console.log "GCD: factored polys:"
  if DEBUG then console.log "  p1:" + p1.toString()
  if DEBUG then console.log "  p2:" + p2.toString()

  # In case one of two polynomials can be factored,
  # (and only in that case), then
  # we'll need to run gcd_factors on the two polynomials.
  # (In case neither of them can be factored there is no gcd).
  # However, gcd_factors expects two _products_ , and
  # in case _one_ of the polynomials can't be factored it will look
  # like a sum instead of a product.
  # So, we'll have to make that sum to look like a factor:
  # let's just turn it into a product with 1.
  
  # in case one of the two polys has been factored...
  if car(p1) == symbol(MULTIPLY) or car(p2) == symbol(MULTIPLY)

    # then make sure that if one of them is a single
    # factor, we take the sum and wrap it into a
    # multiplication by 1

    if car(p1) != symbol(MULTIPLY)
      push_symbol(MULTIPLY);
      push(p1);
      push(one);
      list(3);
      p1 = pop()

    if car(p2) != symbol(MULTIPLY)
      push_symbol(MULTIPLY);
      push(p2);
      push(one);
      list(3);
      p2 = pop()

  if (car(p1) == symbol(MULTIPLY) && car(p2) == symbol(MULTIPLY))
    gcd_product_product()
    return

  gcd_powers_with_same_base()

  return true


gcd_product_product = ->
  push(one)
  p3 = cdr(p1)
  while (iscons(p3))
    p4 = cdr(p2)
    while (iscons(p4))
      push(car(p3))
      push(car(p4))
      gcd()
      multiply()
      p4 = cdr(p4)
    p3 = cdr(p3)


gcd_powers_with_same_base = ->

  if (car(p1) == symbol(POWER))
    p3 = caddr(p1) # exponent
    p1 = cadr(p1) # base
  else
    p3 = one

  if (car(p2) == symbol(POWER))
    p4 = caddr(p2) # exponent
    p2 = cadr(p2) # base
  else
    p4 = one

  if (!equal(p1, p2))
    push(one)
    return

  # are both exponents numerical?

  if (isNumericAtom(p3) && isNumericAtom(p4))
    push(p1)
    if (lessp(p3, p4))
      push(p3)
    else
      push(p4)
    power()
    return

  # are the exponents multiples of eah other?

  push(p3)
  push(p4)
  divide()

  p5 = pop()

  if (isNumericAtom(p5))

    push(p1)

    # choose the smallest exponent

    if (car(p3) == symbol(MULTIPLY) && isNumericAtom(cadr(p3)))
      p5 = cadr(p3)
    else
      p5 = one

    if (car(p4) == symbol(MULTIPLY) && isNumericAtom(cadr(p4)))
      p6 = cadr(p4)
    else
      p6 = one

    if (lessp(p5, p6))
      push(p3)
    else
      push(p4)

    power()
    return

  push(p3)
  push(p4)
  subtract()

  p5 = pop()

  if (!isNumericAtom(p5))
    push(one)
    return

  # can't be equal because of test near beginning

  push(p1)

  if (isnegativenumber(p5))
    push(p3)
  else
    push(p4)

  power()

# in this case gcd is used as a composite function, i.e. gcd(gcd(gcd...

gcd_sum_sum = ->
  if (length(p1) != length(p2))
    push(one)
    return

  p3 = cdr(p1)
  push(car(p3))
  p3 = cdr(p3)
  while (iscons(p3))
    push(car(p3))
    gcd()
    p3 = cdr(p3)
  p3 = pop()

  p4 = cdr(p2)
  push(car(p4))
  p4 = cdr(p4)
  while (iscons(p4))
    push(car(p4))
    gcd()
    p4 = cdr(p4)
  p4 = pop()

  push(p1)
  push(p3)
  divide()
  p5 = pop()

  push(p2)
  push(p4)
  divide()
  p6 = pop()

  if (equal(p5, p6))
    push(p5)
    push(p3)
    push(p4)
    gcd()
    multiply()
  else
    push(one)

gcd_sum = (p) ->
  p = cdr(p)
  push(car(p))
  p = cdr(p)
  while (iscons(p))
    push(car(p))
    gcd()
    p = cdr(p)

gcd_sum_product = ->
  push(one)
  p3 = cdr(p1)
  while (iscons(p3))
    push(car(p3))
    push(p2)
    gcd()
    multiply()
    p3 = cdr(p3)

gcd_product_sum = ->
  push(one)
  p4 = cdr(p2)
  while (iscons(p4))
    push(p1)
    push(car(p4))
    gcd()
    multiply()
    p4 = cdr(p4)


