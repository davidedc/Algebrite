### denominator =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the denominator of expression x.

###


Eval_denominator = ->
  push(cadr(p1))
  Eval()
  denominator()

denominator = ->
  h = 0

  theArgument = pop()
  #console.trace "denominator of: " + theArgument

  if (car(theArgument) == symbol(ADD))
    push(theArgument)
    rationalize()
    theArgument = pop()

  if (car(theArgument) == symbol(MULTIPLY) and !isplusone(car(cdr(theArgument))))
    h = tos
    theArgument = cdr(theArgument)
    while (iscons(theArgument))
      push(car(theArgument))
      denominator()
      theArgument = cdr(theArgument)
    multiply_all(tos - h)
  else if (isrational(theArgument))
    push(theArgument)
    mp_denominator()
  else if (car(theArgument) == symbol(POWER) && isnegativeterm(caddr(theArgument)))
    push(theArgument)
    reciprocate()
  else
    push(one)

