# If the number of args is odd then the last arg is the default result.
# Works like a switch statement. Could also be used for piecewise
# functions? TODO should probably be called "switch"?

Eval_test = ->
  orig = p1
  p1 = cdr(p1)
  while (iscons(p1))

    # odd number of parameters means that the
    # last argument becomes the default case
    # i.e. the one without a test.
    if (cdr(p1) == symbol(NIL))
      push(car(p1)); # default case
      Eval()
      return

    checkResult = isZeroLikeOrNonZeroLikeOrUndetermined car(p1)
    if !checkResult?
      # we couldn't determine the result
      # of a test. This means we can't conclude
      # anything about the result of the
      # overall test, so we must bail
      # with the unevalled test
      push orig
      return
    else if checkResult
      # test succesful, we found out output
      push(cadr(p1))
      Eval()
      return
    else
      # test unsuccessful, continue to the
      # next pair of test,value
      p1 = cddr(p1)


  # no test matched and there was no
  # catch-all case, so we return zero.
  push_integer 0

# we test A==B by first subtracting and checking if we symbolically
# get zero. If not, we evaluate to float and check if we get a zero.
# If we get another NUMBER then we know they are different.
# If we get something else, then we don't know and we return the
# unaveluated test, which is the same as saying "maybe".
Eval_testeq = ->
  # first try without simplifyng both sides
  orig = p1
  push(cadr(p1))
  Eval()
  push(caddr(p1))
  Eval()
  subtract()
  subtractionResult = pop()

  # OK so we are doing something tricky here
  # we are using isZeroLikeOrNonZeroLikeOrUndetermined to check if the result
  # is zero or not zero or unknown.
  # isZeroLikeOrNonZeroLikeOrUndetermined has some routines
  # to determine the zero-ness/non-zero-ness or
  # undeterminate-ness of things so we use
  # that here and down below.
  checkResult = isZeroLikeOrNonZeroLikeOrUndetermined subtractionResult
  if checkResult
    push_integer(0)
    return
  else if checkResult? and !checkResult
    push_integer(1)
    return

  # we didn't get a simple numeric result but
  # let's try again after doing
  # a simplification on both sides
  push(cadr(p1))
  Eval()
  simplify()
  push(caddr(p1))
  Eval()
  simplify()
  subtract()
  subtractionResult = pop()

  checkResult = isZeroLikeOrNonZeroLikeOrUndetermined subtractionResult
  if checkResult
    push_integer(0)
    return
  else if checkResult? and !checkResult
    push_integer(1)
    return

  # if we didn't get to a number then we
  # don't know whether the quantities are
  # different so do nothing
  push orig

# Relational operators expect a numeric result for operand difference.

Eval_testge = ->
  orig = p1
  comparison = cmp_args()

  if !comparison?
    push orig
    return

  if ( comparison >= 0)
    push_integer(1)
  else
    push_integer(0)

Eval_testgt = ->
  orig = p1
  comparison = cmp_args()

  if !comparison?
    push orig
    return

  if ( comparison > 0)
    push_integer(1)
  else
    push_integer(0)

Eval_testle = ->
  orig = p1
  comparison = cmp_args()

  if !comparison?
    push orig
    return

  if ( comparison <= 0)
    push_integer(1)
  else
    push_integer(0)

Eval_testlt = ->
  orig = p1
  comparison = cmp_args()

  if !comparison?
    push orig
    return

  if ( comparison < 0)
    push_integer(1)
  else
    push_integer(0)

# not definition
Eval_not = ->
  wholeAndExpression = p1
  checkResult = isZeroLikeOrNonZeroLikeOrUndetermined cadr(p1)
  if !checkResult?
    # inconclusive test on predicate
    push wholeAndExpression
  else if checkResult
    # true -> false
    push_integer(0)
  else
    # false -> true
    push_integer(1)

### and =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
a,b,...

General description
-------------------
Logical-and of predicate expressions.

###

# and definition
Eval_and = ->
  wholeAndExpression = p1
  andPredicates = cdr(wholeAndExpression)
  somePredicateUnknown = false
  while (iscons(andPredicates))
    # eval each predicate
    checkResult = isZeroLikeOrNonZeroLikeOrUndetermined car(andPredicates)

    if !checkResult?
      # here we have stuff that is not reconducible to any
      # numeric value (or tensor with numeric values) e.g.
      # 'a+b', so it just means that we just don't know the
      # truth value of this particular predicate.
      # We'll track the fact that we found an unknown
      # predicate and we continue with the other predicates.
      # (note that in case some subsequent predicate will be false,
      # it won't matter that we found some unknowns and
      # the whole test will be immediately zero).
      somePredicateUnknown = true
      andPredicates = cdr(andPredicates)

    else if checkResult
      # found a true, move on to the next predicate
      andPredicates = cdr(andPredicates)

    else if !checkResult
      # found a false, enough to falsify everything and return
      push_integer(0)
      return

    # We checked all the predicates and none of them
    # was false. So they were all either true or unknown.
    # Now, if even just one was unknown, we'll have to call this
    # test as inconclusive and return the whole test expression.
    # If all the predicates were known, then we can conclude
    # that the test returns true.
  if somePredicateUnknown
    push wholeAndExpression
  else
    push_integer(1)

# or definition
Eval_or = ->
  wholeOrExpression = p1
  orPredicates = cdr(wholeOrExpression)
  somePredicateUnknown = false
  while (iscons(orPredicates))
    # eval each predicate
    checkResult = isZeroLikeOrNonZeroLikeOrUndetermined car(orPredicates)

    if !checkResult?
      # here we have stuff that is not reconducible to any
      # numeric value (or tensor with numeric values) e.g.
      # 'a+b', so it just means that we just don't know the
      # truth value of this particular predicate.
      # We'll track the fact that we found an unknown
      # predicate and we continue with the other predicates.
      # (note that in case some subsequent predicate will be false,
      # it won't matter that we found some unknowns and
      # the whole test will be immediately zero).
      somePredicateUnknown = true
      orPredicates = cdr(orPredicates)

    else if checkResult
      # found a true, enough to return true
      push_integer(1)
      return

    else if !checkResult
      # found a false, move on to the next predicate
      orPredicates = cdr(orPredicates)

    # We checked all the predicates and none of them
    # was true. So they were all either false or unknown.
    # Now, if even just one was unknown, we'll have to call this
    # test as inconclusive and return the whole test expression.
    # If all the predicates were known, then we can conclude
    # that the test returns false.
  if somePredicateUnknown
    push wholeOrExpression
  else
    push_integer(0)

# use subtract for cases like A < A + 1

# TODO you could be smarter here and
# simplify both sides only in the case
# of "relational operator: cannot determine..."
# a bit like we do in Eval_testeq
cmp_args = ->
  t = 0

  push(cadr(p1))
  Eval()
  simplify()
  push(caddr(p1))
  Eval()
  simplify()
  subtract()
  p1 = pop()

  # try floating point if necessary

  if (p1.k != NUM && p1.k != DOUBLE)
    push(p1)
    yyfloat()
    Eval()
    p1 = pop()

  #console.log "comparison: " + p1.toString()

  if (isZeroAtomOrTensor(p1))
    #console.log "comparison isZero "
    return 0

  switch (p1.k)
    when NUM
      if (MSIGN(p1.q.a) == -1)
        t = -1
      else
        t = 1
    when DOUBLE
      #console.log "comparison p1.d: " + p1.d
      if (p1.d < 0.0)
        t = -1
      else
        t = 1
    else
      #console.log "comparison is null"
      t = null

  return t


