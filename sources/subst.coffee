###
  Substitute new expr for old expr in expr.

  Input:  push  expr

    push  old expr

    push  new expr

  Output:  Result on stack
###



subst = ->
  save()
  newExpr = pop(); # new expr
  oldExpr = pop(); # old expr
  if (oldExpr == symbol(NIL) || newExpr == symbol(NIL))
    restore()
    return
  expr = pop(); # expr
  if (istensor(expr))
    newTensor = alloc_tensor(expr.tensor.nelem)
    newTensor.tensor.ndim = expr.tensor.ndim
    for i in [0...expr.tensor.ndim]
      newTensor.tensor.dim[i] = expr.tensor.dim[i]
    for i in [0...expr.tensor.nelem]
      push(expr.tensor.elem[i])
      push(oldExpr)
      push(newExpr)
      subst()
      newTensor.tensor.elem[i] = pop()

      check_tensor_dimensions newTensor

    push(newTensor)
  else if (equal(expr, oldExpr))
    push(newExpr)
  else if (iscons(expr))
    push(car(expr))
    push(oldExpr)
    push(newExpr)
    subst()
    push(cdr(expr))
    push(oldExpr)
    push(newExpr)
    subst()
    cons()
  else
    push(expr)
  restore()
