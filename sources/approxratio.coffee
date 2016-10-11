###
 Guesses a rational for a given float.
###

Eval_approxratio = ->
	theArgument = cadr(p1)
	push(theArgument)
	zzfloat()
	supposedlyTheFloat = pop()
	if supposedlyTheFloat.k == DOUBLE
    theFloat = supposedlyTheFloat.d
    splitBeforeAndAfterDot = theFloat.toString().split(".")
    if splitBeforeAndAfterDot.length == 2
    	numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    	precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
    	theRatio = approxratio(theFloat,precision)
    	push_rational(theRatio[0], theRatio[1])
    else
      push_integer(theFloat)
    return

	# we didn't manage, just leave unexpressed
	push_symbol(APPROXRATIO)
	push(theArgument)
	list(2)


# courtesy of Michael Borcherds
# who ported this to JavaScript under MIT licence
# also see
# https://github.com/geogebra/geogebra/blob/master/common/src/main/java/org/geogebra/common/kernel/algos/AlgoFractionText.java
# potential other ways to do this:
#   https://rosettacode.org/wiki/Convert_decimal_number_to_rational
#   http://www.homeschoolmath.net/teaching/rational_numbers.php
#   http://stackoverflow.com/questions/95727/how-to-convert-floats-to-human-readable-fractions

approxratio = (decimal, AccuracyFactor) ->
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
