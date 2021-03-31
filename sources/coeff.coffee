### coeff =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p,x,n

General description
-------------------
Returns the coefficient of x^n in polynomial p. The x argument can be omitted for polynomials in x.

###



#define P p1
#define X p2
#define N p3

Eval_coeff = ->
  push(cadr(p1));      # 1st arg, p
  Eval()

  push(caddr(p1));    # 2nd arg, x
  Eval()

  push(cadddr(p1));    # 3rd arg, n
  Eval()

  p3 = pop(); # p3 is N
  p2 = pop(); # p2 is X
  p1 = pop(); # p1 is P

  if (p3 == symbol(NIL))   # p3 is N  # only 2 args?
    p3 = p2;  # p2 is X  # p3 is N
    p2 = symbol(SYMBOL_X);  # p2 is X

  push(p1);  # p1 is P      # divide p by x^n
  push(p2);  # p2 is X
  push(p3);  # p3 is N
  power()
  divide()

  push(p2);  # p2 is X      # keep the constant part
  filter()

#-----------------------------------------------------------------------------
#
#  Put polynomial coefficients on the stack
#
#  Input:  as per params
#
#  Output:    Returns number of coefficients on stack
#
#      tos-n    Coefficient of x^0
#
#      tos-1    Coefficient of x^(n-1)
#
#-----------------------------------------------------------------------------

coeff = (variable, polynomial)->

  if DEBUG then console.log "coeff: " + variable + " " + polynomial

  # works like this:
  #   1) find the constant (by just evaluating the pol setting the variable to zero)
  #   2) set aside the found constant: it's one of the coefficients to return
  #   3) take the polynomial and remove the constant
  #   4) divide that by variable, lowering the degree by one
  #   5) go back to 1) until degree is zero

  coeffsCount = 0

  while true

    push(polynomial)
    push(variable)
    push(zero)
    subst()
    Eval()

    constant = pop()
    
    # this will be a coefficient that will be returned
    push(constant)
    coeffsCount++

    push(polynomial)
    push(constant)
    subtract()

    polynomialWithoutConstant = pop()

    if (equal(polynomialWithoutConstant, zero))
      if DEBUG then console.log "coeff: result: " + coeffsCount
      return coeffsCount

    push(polynomialWithoutConstant)
    push(variable)
    prev_expanding = expanding
    expanding = 1
    divide()
    expanding = prev_expanding
    #console.log("just divided: " + stack[tos-1].toString())
    # this is now the new polynomial with degree decreased by 1
    polynomial = pop()


