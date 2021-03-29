# Condense an expression by factoring common terms.


Eval_condense = ->
  push(cadr(p1))
  Eval()
  Condense()

Condense = ->
  prev_expanding = expanding
  expanding = 0
  save()
  yycondense()
  restore()
  expanding = prev_expanding

yycondense = ->
  #expanding = 0

  p1 = pop()

  if (car(p1) != symbol(ADD))
    push(p1)
    return

  # get gcd of all terms

  p3 = cdr(p1)
  push(car(p3))
  p3 = cdr(p3)
  while (iscons(p3))
    push(car(p3))
    if DEBUG then console.log "calculating gcd between: " + stack[tos - 1] + " and " + stack[tos - 2]
    gcd()
    if DEBUG then console.log "partial gcd: " + stack[tos - 1]
    p3 = cdr(p3)

  if DEBUG then console.log "condense: this is the gcd of all the terms: " + stack[tos - 1]

  # divide each term by gcd

  inverse()
  p2 = pop()
  push(zero)
  p3 = cdr(p1)
  while (iscons(p3))
    push(p2)
    push(car(p3))
    #multiply()
    multiply_noexpand()
    add()
    p3 = cdr(p3)

  # We multiplied above w/o expanding so some factors cancelled.

  # Now we expand which normalizes the result and, in some cases,
  # simplifies it too (see test case H).

  yyexpand()

  # multiply result by gcd

  push(p2)
  divide()


