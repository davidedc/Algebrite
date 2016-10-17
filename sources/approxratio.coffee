###
 Guesses a rational for each float in the passed expression
###


Eval_approxratio = ->
  theArgument = cadr(p1)
  push(theArgument)
  approxratioRecursive()

approxratioRecursive = ->
  i = 0
  save()
  p1 = pop(); # expr
  if (istensor(p1))
    p4 = alloc_tensor(p1.tensor.nelem)
    p4.tensor.ndim = p1.tensor.ndim
    for i in [0...p1.tensor.ndim]
      p4.tensor.dim[i] = p1.tensor.dim[i]
    for i in [0...p1.tensor.nelem]
      push(p1.tensor.elem[i])
      approxratioRecursive()
      p4.tensor.elem[i] = pop()

      check_tensor_dimensions p4

    push(p4)
  else if p1.k == DOUBLE
    push(p1)
    approxOneRatioOnly()
  else if (iscons(p1))
    push(car(p1))
    approxratioRecursive()
    push(cdr(p1))
    approxratioRecursive()
    cons()
  else
    push(p1)
  restore()

approxOneRatioOnly = ->
	zzfloat()
	supposedlyTheFloat = pop()
	if supposedlyTheFloat.k == DOUBLE
    theFloat = supposedlyTheFloat.d
    splitBeforeAndAfterDot = theFloat.toString().split(".")
    if splitBeforeAndAfterDot.length == 2
    	numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    	precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
    	theRatio = floatToRatioRoutine(theFloat,precision)
    	push_rational(theRatio[0], theRatio[1])
    else
      push_integer(theFloat)
    return

	# we didn't manage, just leave unexpressed
	push_symbol(APPROXRATIO)
	push(theArgument)
	list(2)

# original routine by John Kennedy, see
# https://web.archive.org/web/20111027100847/http://homepage.smc.edu/kennedy_john/DEC2FRAC.PDF
# courtesy of Michael Borcherds
# who ported this to JavaScript under MIT licence
# also see
# https://github.com/geogebra/geogebra/blob/master/common/src/main/java/org/geogebra/common/kernel/algos/AlgoFractionText.java
# potential other ways to do this:
#   https://rosettacode.org/wiki/Convert_decimal_number_to_rational
#   http://www.homeschoolmath.net/teaching/rational_numbers.php
#   http://stackoverflow.com/questions/95727/how-to-convert-floats-to-human-readable-fractions

floatToRatioRoutine = (decimal, AccuracyFactor) ->
  FractionNumerator = undefined
  FractionDenominator = undefined
  DecimalSign = undefined
  Z = undefined
  PreviousDenominator = undefined
  ScratchValue = undefined
  ret = [
    0
    0
  ]
  if isNaN(decimal)
    return ret
  # return 0/0 
  if decimal == Infinity
    ret[0] = 1
    ret[1] = 0
    # 1/0
    return ret
  if decimal == -Infinity
    ret[0] = -1
    ret[1] = 0
    # -1/0
    return ret
  if decimal < 0.0
    DecimalSign = -1.0
  else
    DecimalSign = 1.0
  decimal = Math.abs(decimal)
  if Math.abs(decimal - Math.floor(decimal)) < AccuracyFactor
    # handles exact integers including 0 
    FractionNumerator = decimal * DecimalSign
    FractionDenominator = 1.0
    ret[0] = FractionNumerator
    ret[1] = FractionDenominator
    return ret
  if decimal < 1.0e-19
    # X = 0 already taken care of 
    FractionNumerator = DecimalSign
    FractionDenominator = 9999999999999999999.0
    ret[0] = FractionNumerator
    ret[1] = FractionDenominator
    return ret
  if decimal > 1.0e19
    FractionNumerator = 9999999999999999999.0 * DecimalSign
    FractionDenominator = 1.0
    ret[0] = FractionNumerator
    ret[1] = FractionDenominator
    return ret
  Z = decimal
  PreviousDenominator = 0.0
  FractionDenominator = 1.0
  loop
    Z = 1.0 / (Z - Math.floor(Z))
    ScratchValue = FractionDenominator
    FractionDenominator = FractionDenominator * Math.floor(Z) + PreviousDenominator
    PreviousDenominator = ScratchValue
    FractionNumerator = Math.floor(decimal * FractionDenominator + 0.5)
    # Rounding Function
    unless Math.abs(decimal - (FractionNumerator / FractionDenominator)) > AccuracyFactor and Z != Math.floor(Z)
      break
  FractionNumerator = DecimalSign * FractionNumerator
  ret[0] = FractionNumerator
  ret[1] = FractionDenominator
  ret

approxTrigonometric = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  for i in [1..13]
    for j in [1..13]
      console.log  "i,j: " + i + "," + j
      fraction = i/j
      hypothesis = Math.sin(Math.PI * fraction)
      console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        console.log  "ratio: " + ratio
        error = (ratio - likelyMultiplier)/likelyMultiplier
      else
        ratio = 1
        likelyMultiplier = 1
        error = theFloat - hypothesis
      console.log  "error: " + error
      # magic number 23 comes from the case sin(pi/10)
      if Math.abs(error) < 23 * precision
        result = likelyMultiplier + " * sin( " + i + "/" + j + " * pi )"
        console.log result + " error: " + error
        return [result, likelyMultiplier, i, j]

  return


testApproxTrigonometric = () ->
  value = 0
  if approxTrigonometric(value)[0] != "0" then console.log "fail testApproxTrigonometric: 0"

  value = 0.0
  if approxTrigonometric(value)[0] != "0" then console.log "fail testApproxTrigonometric: 0.0"

  value = Math.sqrt(2)
  if approxTrigonometric(value)[0] != "2 * sin( 1/4 * pi )" then console.log "fail testApproxTrigonometric: Math.sqrt(2)"

  value = Math.sqrt(3)
  if approxTrigonometric(value)[0] != "2 * sin( 1/3 * pi )" then console.log "fail testApproxTrigonometric: Math.sqrt(3)"

  value = (Math.sqrt(6) - Math.sqrt(2))/4
  if approxTrigonometric(value)[0] != "1 * sin( 1/12 * pi )" then console.log "fail testApproxTrigonometric: (Math.sqrt(6) - Math.sqrt(2))/4"

  value = Math.sqrt(2 - Math.sqrt(2))/2
  if approxTrigonometric(value)[0] != "1 * sin( 1/8 * pi )" then console.log "fail testApproxTrigonometric: Math.sqrt(2 - Math.sqrt(2))/2"

  value = (Math.sqrt(6) + Math.sqrt(2))/4
  if approxTrigonometric(value)[0] != "1 * sin( 5/12 * pi )" then console.log "fail testApproxTrigonometric: (Math.sqrt(6) + Math.sqrt(2))/4"

  value = Math.sqrt(2 + Math.sqrt(3))/2
  if approxTrigonometric(value)[0] != "1 * sin( 5/12 * pi )" then console.log "fail testApproxTrigonometric: Math.sqrt(2 + Math.sqrt(3))/2"

  value = (Math.sqrt(5) - 1)/4
  if approxTrigonometric(value)[0] != "1 * sin( 1/10 * pi )" then console.log "fail testApproxTrigonometric: (Math.sqrt(5) - 1)/4"

  value = Math.sqrt(10 - 2*Math.sqrt(5))/4
  if approxTrigonometric(value)[0] != "1 * sin( 1/5 * pi )" then console.log "fail testApproxTrigonometric: Math.sqrt(10 - 2*Math.sqrt(5))/4"

  # this has a radical form but it's too long to write
  value = Math.sin(Math.PI/7)
  if approxTrigonometric(value)[0] != "1 * sin( 1/7 * pi )" then console.log "fail testApproxTrigonometric: Math.sin(Math.PI/7)"

  # this has a radical form but it's too long to write
  value = Math.sin(Math.PI/9)
  if approxTrigonometric(value)[0] != "1 * sin( 1/9 * pi )" then console.log "fail testApproxTrigonometric: Math.sin(Math.PI/9)"

  for i in [1..13]
    for j in [1..13]
      console.log "testApproxTrigonometric testing: " + "1 * sin( " + i + "/" + j + " * pi )"
      fraction = i/j
      value = Math.sin(Math.PI * fraction)
      returned = approxTrigonometric(value)
      returnedFraction = returned[2]/returned[3]
      returnedValue = returned[1] * Math.sin(Math.PI * returnedFraction)
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail testApproxTrigonometric: " + "1 * sin( " + i + "/" + j + " * pi ) . obtained: " + returned

  for i in [1..13]
    for j in [1..13]
      console.log "testApproxTrigonometric testing with 4 digits: " + "1 * sin( " + i + "/" + j + " * pi )"
      fraction = i/j
      originalValue = Math.sin(Math.PI * fraction)
      value = originalValue.toFixed(4)
      returned = approxTrigonometric(value)
      returnedFraction = returned[2]/returned[3]
      returnedValue = returned[1] * Math.sin(Math.PI * returnedFraction)
      error = Math.abs(originalValue - returnedValue)
      if error > 1e-14
        console.log "fail testApproxTrigonometric with 4 digits: " + "1 * sin( " + i + "/" + j + " * pi ) . obtained: " + returned + " error: " + error

  console.log "testApproxTrigonometric done"

$.approxTrigonometric    = approxTrigonometric 
$.testApproxTrigonometric         = testApproxTrigonometric 
