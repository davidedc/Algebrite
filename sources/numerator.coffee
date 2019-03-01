

Eval_numerator = ->
  push(cadr(p1))
  Eval()
  numerator()

numerator = ->
  h = 0

  theArgument = pop()


  if (car(theArgument) == symbol(ADD))
    push(theArgument)
    #console.trace "rationalising "
    rationalize()
    theArgument = pop()
    #console.log "rationalised: " + theArgument

  if (car(theArgument) == symbol(MULTIPLY) and !isplusone(car(cdr(theArgument))))
    h = tos
    theArgument = cdr(theArgument)
    #console.log "theArgument inside multiply: " + theArgument
    #console.log "first term: " + car(theArgument)

    while (iscons(theArgument))
      push(car(theArgument))
      numerator()
      theArgument = cdr(theArgument)
    multiply_all(tos - h)
  else if (isrational(theArgument))
    push(theArgument)
    mp_numerator()
  else if (car(theArgument) == symbol(POWER) && isnegativeterm(caddr(theArgument)))
    push(one)
  else 
    push(theArgument)
