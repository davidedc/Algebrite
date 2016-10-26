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

approx_just_an_integer = 0
approx_sine_of_rational = 1
approx_sine_of_pi_times_rational = 2
approx_rationalOfPi = 3
approx_radicalOfRatio = 4
approx_nothingUseful = 5
approx_ratioOfRadical = 6
approx_rationalOfE = 7
approx_logarithmsOfRationals = 8
approx_rationalsOfLogarithms = 9

approxRationalsOfRadicals = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  # simple radicals.

  bestResultSoFar = null
  minimumComplexity = Number.MAX_VALUE

  for i in [2,3,5,6,7,8,10]
    for j in [1..10]
      #console.log  "i,j: " + i + "," + j
      hypothesis = Math.sqrt(i)/j
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error
      if error < 2 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * sqrt( " + i + " ) / " + j
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_ratioOfRadical, likelyMultiplier, i, j]

  return bestResultSoFar

approxRadicalsOfRationals = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  # simple radicals.

  bestResultSoFar = null
  minimumComplexity = Number.MAX_VALUE

  # this one catches things like Math.sqrt(3/4), but
  # things like Math.sqrt(1/2) are caught by the paragraph
  # above (and in a better form)
  for i in [1,2,3,5,6,7,8,10]
    for j in [1,2,3,5,6,7,8,10]
      #console.log  "i,j: " + i + "," + j
      hypothesis = Math.sqrt(i/j)
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error
      if error < 2 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * (sqrt( " + i + " / " + j + " )"
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_radicalOfRatio, likelyMultiplier, i, j]

  return bestResultSoFar

approxRadicals = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  # simple radicals.

  # we always prefer a rational of a radical of an integer
  # to a radical of a rational. Radicals of rationals generate
  # radicals at the denominator which we'd rather avoid

  approxRationalsOfRadicalsResult = approxRationalsOfRadicals theFloat
  if approxRationalsOfRadicalsResult?
    return approxRationalsOfRadicalsResult

  approxRadicalsOfRationalsResult = approxRadicalsOfRationals theFloat
  if approxRadicalsOfRationalsResult?
    return approxRadicalsOfRationalsResult

  return null

approxLogs = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  # we always prefer a rational of a log to a log of
  # a rational

  approxRationalsOfLogsResult = approxRationalsOfLogs theFloat
  if approxRationalsOfLogsResult?
    return approxRationalsOfLogsResult

  approxLogsOfRationalsResult = approxLogsOfRationals theFloat
  if approxLogsOfRationalsResult?
    return approxLogsOfRationalsResult

  return null

approxRationalsOfLogs = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  bestResultSoFar = null
  minimumComplexity = Number.MAX_VALUE

  # simple rationals of logs
  for i in [2..5]
    for j in [1..5]
      #console.log  "i,j: " + i + "," + j
      hypothesis = Math.log(i)/j
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error

      # it does happen that due to roundings 
      # a "higher multiple" is picked, which is obviously
      # unintended.
      # E.g. 1 * log(1 / 3 ) doesn't match log( 3 ) BUT
      # it matches -5 * log( 3 ) / 5
      # so we avoid any case where the multiplier is a multiple
      # of the divisor.
      if likelyMultiplier != 1 and Math.abs(Math.floor(likelyMultiplier/j)) == Math.abs(likelyMultiplier/j)
        continue

      if error < 2.2 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * log( " + i + " ) / " + j
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_rationalsOfLogarithms, likelyMultiplier, i, j]

  return bestResultSoFar

approxLogsOfRationals = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  bestResultSoFar = null
  minimumComplexity = Number.MAX_VALUE

  # simple logs of rationals
  for i in [1..5]
    for j in [1..5]
      #console.log  "i,j: " + i + "," + j
      hypothesis = Math.log(i/j)
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error
      if error < 1.96 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * log( " + i + " / " + j + " )"
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_logarithmsOfRationals, likelyMultiplier, i, j]

  return bestResultSoFar

approxRationalsOfPowersOfE = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  bestResultSoFar = null
  minimumComplexity = Number.MAX_VALUE

  # simple rationals of a few powers of e
  for i in [1..2]
    for j in [1..12]
      #console.log  "i,j: " + i + "," + j
      hypothesis = Math.pow(Math.E,i)/j
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error
      if error < 2 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * (e ^ " + i + " ) / " + j
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_rationalOfE, likelyMultiplier, i, j]

  return bestResultSoFar

approxRationalsOfPowersOfPI = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision
  bestResultSoFar = null

  # here we do somethng a little special: since
  # the powers of pi can get quite big, there might
  # be multiple hypothesis where more of the
  # magnitude is shifted to the multiplier, and some
  # where more of the magnitude is shifted towards the
  # exponent of pi. So we prefer the hypotheses with the
  # lower multiplier since it's likely to insert more
  # information.
  minimumComplexity = Number.MAX_VALUE

  # simple rationals of a few powers of PI
  for i in [1..5]
    for j in [1..12]
      #console.log  "i,j: " + i + "," + j
      hypothesis = Math.pow(Math.PI,i)/j
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error
      if error < 2 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * (pi ^ " + i + " ) / " + j + " )"
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_rationalOfPi, likelyMultiplier, i, j]

  #console.log "approxRationalsOfPowersOfPI returning: " + bestResultSoFar
  return bestResultSoFar

approxTrigonometric = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  # we always prefer a sin of a rational without the PI

  approxSineOfRationalsResult = approxSineOfRationals theFloat
  if approxSineOfRationalsResult?
    return approxSineOfRationalsResult

  approxSineOfRationalMultiplesOfPIResult = approxSineOfRationalMultiplesOfPI theFloat
  if approxSineOfRationalMultiplesOfPIResult?
    return approxSineOfRationalMultiplesOfPIResult

  return null

approxSineOfRationals = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  bestResultSoFar = null
  minimumComplexity = Number.MAX_VALUE

  # we only check very simple rationals because they begin to get tricky
  # quickly, also they collide often with the "rational of pi" hypothesis.
  # For example sin(11) is veeery close to 1 (-0.99999020655)
  # (see: http://mathworld.wolfram.com/AlmostInteger.html )
  # we stop at rationals that mention up to 10
  for i in [1..4]
    for j in [1..4]
      #console.log  "i,j: " + i + "," + j
      fraction = i/j
      hypothesis = Math.sin(fraction)
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error
      if error < 2 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * sin( " + i + "/" + j + " )"
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_sine_of_rational, likelyMultiplier, i, j]

  return bestResultSoFar

approxSineOfRationalMultiplesOfPI = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  bestResultSoFar = null
  minimumComplexity = Number.MAX_VALUE

  # check rational multiples of pi
  for i in [1..13]
    for j in [1..13]
      #console.log  "i,j: " + i + "," + j
      fraction = i/j
      hypothesis = Math.sin(Math.PI * fraction)
      #console.log  "hypothesis: " + hypothesis
      if Math.abs(hypothesis) > 1e-10
        ratio =  theFloat/hypothesis
        likelyMultiplier = Math.round(ratio)
        #console.log  "ratio: " + ratio
        error = Math.abs(1 - ratio/likelyMultiplier)
      else
        ratio = 1
        likelyMultiplier = 1
        error = Math.abs(theFloat - hypothesis)
      #console.log  "error: " + error
      # magic number 23 comes from the case sin(pi/10)
      if error < 23 * precision
        complexity = simpleComplexityMeasure likelyMultiplier, i, j
        if complexity < minimumComplexity
          #console.log "MINIMUM MULTIPLIER SO FAR"
          minimumComplexity = complexity
          result = likelyMultiplier + " * sin( " + i + "/" + j + " * pi )"
          #console.log result + " error: " + error
          bestResultSoFar = [result, approx_sine_of_pi_times_rational, likelyMultiplier, i, j]

  return bestResultSoFar

approxAll = (theFloat) ->
  splitBeforeAndAfterDot = theFloat.toString().split(".")

  if splitBeforeAndAfterDot.length == 2
    numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length
    precision = 1/Math.pow(10,numberOfDigitsAfterTheDot)
  else
    return ["" + Math.floor(theFloat), approx_just_an_integer, Math.floor(theFloat), 1, 2]

  console.log "precision: " + precision

  constantsSumMin = Number.MAX_VALUE
  constantsSum = 0
  bestApproxSoFar = null

  LOG_EXPLANATIONS = true

  approxRadicalsResult = approxRadicals theFloat
  if approxRadicalsResult?
    constantsSum = simpleComplexityMeasure approxRadicalsResult
    if constantsSum < constantsSumMin
      if LOG_EXPLANATIONS then console.log "better explanation by approxRadicals: " + approxRadicalsResult + " complexity: " + constantsSum
      constantsSumMin = constantsSum
      bestApproxSoFar = approxRadicalsResult
    else
      if LOG_EXPLANATIONS then console.log "subpar explanation by approxRadicals: " + approxRadicalsResult + " complexity: " + constantsSum

  approxLogsResult =  approxLogs(theFloat)
  if approxLogsResult?
    constantsSum = simpleComplexityMeasure approxLogsResult
    if constantsSum < constantsSumMin
      if LOG_EXPLANATIONS then console.log "better explanation by approxLogs: " + approxLogsResult + " complexity: " + constantsSum
      constantsSumMin = constantsSum
      bestApproxSoFar = approxLogsResult
    else
      if LOG_EXPLANATIONS then console.log "subpar explanation by approxLogs: " + approxLogsResult + " complexity: " + constantsSum

  approxRationalsOfPowersOfEResult = approxRationalsOfPowersOfE(theFloat)
  if approxRationalsOfPowersOfEResult?
    constantsSum = simpleComplexityMeasure approxRationalsOfPowersOfEResult
    if constantsSum < constantsSumMin
      if LOG_EXPLANATIONS then console.log "better explanation by approxRationalsOfPowersOfE: " + approxRationalsOfPowersOfEResult + " complexity: " + constantsSum
      constantsSumMin = constantsSum
      bestApproxSoFar = approxRationalsOfPowersOfEResult
    else
      if LOG_EXPLANATIONS then console.log "subpar explanation by approxRationalsOfPowersOfE: " + approxRationalsOfPowersOfEResult + " complexity: " + constantsSum

  approxRationalsOfPowersOfPIResult = approxRationalsOfPowersOfPI(theFloat)
  if approxRationalsOfPowersOfPIResult?
    constantsSum = simpleComplexityMeasure approxRationalsOfPowersOfPIResult
    if constantsSum < constantsSumMin
      if LOG_EXPLANATIONS then console.log "better explanation by approxRationalsOfPowersOfPI: " + approxRationalsOfPowersOfPIResult + " complexity: " + constantsSum
      constantsSumMin = constantsSum
      bestApproxSoFar = approxRationalsOfPowersOfPIResult
    else
      if LOG_EXPLANATIONS then console.log "subpar explanation by approxRationalsOfPowersOfPI: " + approxRationalsOfPowersOfPIResult + " complexity: " + constantsSum

  approxTrigonometricResult = approxTrigonometric(theFloat)
  if approxTrigonometricResult?
    constantsSum = simpleComplexityMeasure approxTrigonometricResult
    if constantsSum < constantsSumMin
      if LOG_EXPLANATIONS then console.log "better explanation by approxTrigonometric: " + approxTrigonometricResult + " complexity: " + constantsSum
      constantsSumMin = constantsSum
      bestApproxSoFar = approxTrigonometricResult
    else
      if LOG_EXPLANATIONS then console.log "subpar explanation by approxTrigonometric: " + approxTrigonometricResult + " complexity: " + constantsSum


  return bestApproxSoFar

simpleComplexityMeasure = (aResult, b, c) ->

  theSum = null

  if aResult instanceof Array

    # we want PI and E to somewhat increase the
    # complexity of the expression, so basically they count
    # more than any integer lower than 3, i.e. we consider
    # 1,2,3 to be more fundamental than PI or E.
    switch aResult[1]
      when approx_sine_of_pi_times_rational
        theSum = 4
      # exponents of PI and E need to be penalised as well
      # otherwise they come to explain any big number
      # so we count them just as much as the multiplier
      when approx_rationalOfPi
        theSum = Math.pow(4,Math.abs(aResult[3])) * Math.abs(aResult[2])
      when approx_rationalOfE
        theSum = Math.pow(3,Math.abs(aResult[3])) * Math.abs(aResult[2])
      else theSum = 0

    theSum += Math.abs(aResult[2]) * (Math.abs(aResult[3]) + Math.abs(aResult[4]))
  else
    theSum += Math.abs(aResult) * (Math.abs(b) + Math.abs(c))
  
  # heavily discount unit constants

  if aResult[2] == 1
    theSum -= 1
  else
    theSum += 1

  if aResult[3] == 1
    theSum -= 1
  else
    theSum += 1

  if aResult[4] == 1
    theSum -= 1
  else
    theSum += 1

  if theSum < 0
    theSum = 0

  return theSum


testApprox = () ->

  for i in [2,3,5,6,7,8,10]
    for j in [2,3,5,6,7,8,10]
      if i == j then continue # this is just 1
      console.log "testapproxRadicals testing: " + "1 * sqrt( " + i + " ) / " + j
      fraction = i/j
      value = Math.sqrt(i)/j
      returned = approxRadicals(value)
      returnedValue = returned[2] * Math.sqrt(returned[3])/returned[4]
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail testapproxRadicals: " + "1 * sqrt( " + i + " ) / " + j + " . obtained: " + returned

  for i in [2,3,5,6,7,8,10]
    for j in [2,3,5,6,7,8,10]
      if i == j then continue # this is just 1
      console.log "testapproxRadicals testing with 4 digits: " + "1 * sqrt( " + i + " ) / " + j
      fraction = i/j
      originalValue = Math.sqrt(i)/j
      value = originalValue.toFixed(4)
      returned = approxRadicals(value)
      returnedValue = returned[2] * Math.sqrt(returned[3])/returned[4]
      if Math.abs(originalValue - returnedValue) > 1e-15
        console.log "fail testapproxRadicals with 4 digits: " + "1 * sqrt( " + i + " ) / " + j + " . obtained: " + returned

  for i in [2,3,5,6,7,8,10]
    for j in [2,3,5,6,7,8,10]
      if i == j then continue # this is just 1
      console.log "testapproxRadicals testing: " + "1 * sqrt( " + i + " / " + j + " )"
      fraction = i/j
      value = Math.sqrt(i/j)
      returned = approxRadicals(value)
      if returned?
        returnedValue = returned[2] * Math.sqrt(returned[3]/returned[4])
        if returned[1] == approx_radicalOfRatio and Math.abs(value - returnedValue) > 1e-15
          console.log "fail testapproxRadicals: " + "1 * sqrt( " + i + " / " + j + " ) . obtained: " + returned

  for i in [1,2,3,5,6,7,8,10]
    for j in [1,2,3,5,6,7,8,10]
      if i == 1 and j == 1 then continue
      console.log "testapproxRadicals testing with 4 digits:: " + "1 * sqrt( " + i + " / " + j + " )"
      fraction = i/j
      originalValue = Math.sqrt(i/j)
      value = originalValue.toFixed(4)
      returned = approxRadicals(value)
      returnedValue = returned[2] * Math.sqrt(returned[3]/returned[4])
      if returned[1] == approx_radicalOfRatio and Math.abs(originalValue - returnedValue) > 1e-15
        console.log "fail testapproxRadicals with 4 digits:: " + "1 * sqrt( " + i + " / " + j + " ) . obtained: " + returned

  for i in [1..5]
    for j in [1..5]
      console.log "testApproxAll testing: " + "1 * log(" + i + " ) / " + j
      fraction = i/j
      value = Math.log(i)/j
      returned = approxAll(value)
      returnedValue = returned[2] * Math.log(returned[3])/returned[4]
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail testApproxAll: " + "1 * log(" + i + " ) / " + j + " . obtained: " + returned

  for i in [1..5]
    for j in [1..5]
      console.log "testApproxAll testing with 4 digits: " + "1 * log(" + i + " ) / " + j
      fraction = i/j
      originalValue = Math.log(i)/j
      value = originalValue.toFixed(4)
      returned = approxAll(value)
      returnedValue = returned[2] * Math.log(returned[3])/returned[4]
      if Math.abs(originalValue - returnedValue) > 1e-15
        console.log "fail testApproxAll with 4 digits: " + "1 * log(" + i + " ) / " + j +  " . obtained: " + returned

  for i in [1..5]
    for j in [1..5]
      console.log "testApproxAll testing: " + "1 * log(" + i + " / " + j + " )"
      fraction = i/j
      value = Math.log(i/j)
      returned = approxAll(value)
      returnedValue = returned[2] * Math.log(returned[3]/returned[4])
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail testApproxAll: " + "1 * log(" + i + " / " + j + " )" + " . obtained: " + returned

  for i in [1..5]
    for j in [1..5]
      console.log "testApproxAll testing with 4 digits: " + "1 * log(" + i + " / " + j + " )"
      fraction = i/j
      originalValue = Math.log(i/j)
      value = originalValue.toFixed(4)
      returned = approxAll(value)
      returnedValue = returned[2] * Math.log(returned[3]/returned[4])
      if Math.abs(originalValue - returnedValue) > 1e-15
        console.log "fail testApproxAll with 4 digits: " + "1 * log(" + i + " / " + j + " )" +  " . obtained: " + returned

  for i in [1..2]
    for j in [1..12]
      console.log "testApproxAll testing: " + "1 * (e ^ " + i + " ) / " + j
      fraction = i/j
      value = Math.pow(Math.E,i)/j
      returned = approxAll(value)
      returnedValue = returned[2] * Math.pow(Math.E,returned[3])/returned[4]
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail testApproxAll: " + "1 * (e ^ " + i + " ) / " + j + " . obtained: " + returned

  for i in [1..2]
    for j in [1..12]
      console.log "approxRationalsOfPowersOfE testing with 4 digits: " + "1 * (e ^ " + i + " ) / " + j
      fraction = i/j
      originalValue = Math.pow(Math.E,i)/j
      value = originalValue.toFixed(4)
      returned = approxRationalsOfPowersOfE(value)
      returnedValue = returned[2] * Math.pow(Math.E,returned[3])/returned[4]
      if Math.abs(originalValue - returnedValue) > 1e-15
        console.log "fail approxRationalsOfPowersOfE with 4 digits: " + "1 * (e ^ " + i + " ) / " + j + " . obtained: " + returned

  for i in [1..2]
    for j in [1..12]
      console.log "testApproxAll testing: " + "1 * pi ^ " + i + " / " + j
      fraction = i/j
      value = Math.pow(Math.PI,i)/j
      returned = approxAll(value)
      returnedValue = returned[2] * Math.pow(Math.PI,returned[3])/returned[4]
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail testApproxAll: " + "1 * pi ^ " + i + " / " + j + " ) . obtained: " + returned

  for i in [1..2]
    for j in [1..12]
      console.log "approxRationalsOfPowersOfPI testing with 4 digits: " + "1 * pi ^ " + i + " / " + j
      fraction = i/j
      originalValue = Math.pow(Math.PI,i)/j
      value = originalValue.toFixed(4)
      returned = approxRationalsOfPowersOfPI(value)
      returnedValue = returned[2] * Math.pow(Math.PI,returned[3])/returned[4]
      if Math.abs(originalValue - returnedValue) > 1e-15
        console.log "fail approxRationalsOfPowersOfPI with 4 digits: " + "1 * pi ^ " + i + " / " + j + " ) . obtained: " + returned

  for i in [1..4]
    for j in [1..4]
      console.log "testApproxAll testing: " + "1 * sin( " + i + "/" + j + " )"
      fraction = i/j
      value = Math.sin(fraction)
      returned = approxAll(value)
      returnedFraction = returned[3]/returned[4]
      returnedValue = returned[2] * Math.sin(returnedFraction)
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail testApproxAll: " + "1 * sin( " + i + "/" + j + " ) . obtained: " + returned

  # 5 digits create no problem
  for i in [1..4]
    for j in [1..4]
      console.log "testApproxAll testing with 5 digits: " + "1 * sin( " + i + "/" + j + " )"
      fraction = i/j
      originalValue = Math.sin(fraction)
      value = originalValue.toFixed(5)
      returned = approxAll(value)
      if !returned?
        console.log "fail testApproxAll with 5 digits: " + "1 * sin( " + i + "/" + j + " ) . obtained:  undefined "
      returnedFraction = returned[3]/returned[4]
      returnedValue = returned[2] * Math.sin(returnedFraction)
      error = Math.abs(originalValue - returnedValue)
      if error > 1e-14
        console.log "fail testApproxAll with 5 digits: " + "1 * sin( " + i + "/" + j + " ) . obtained: " + returned + " error: " + error

  # 4 digits create two collisions
  for i in [1..4]
    for j in [1..4]

      console.log "testApproxAll testing with 4 digits: " + "1 * sin( " + i + "/" + j + " )"
      fraction = i/j
      originalValue = Math.sin(fraction)
      value = originalValue.toFixed(4)
      returned = approxAll(value)
      if !returned?
        console.log "fail testApproxAll with 4 digits: " + "1 * sin( " + i + "/" + j + " ) . obtained:  undefined "
      returnedFraction = returned[3]/returned[4]
      returnedValue = returned[2] * Math.sin(returnedFraction)
      error = Math.abs(originalValue - returnedValue)
      if error > 1e-14
        console.log "fail testApproxAll with 4 digits: " + "1 * sin( " + i + "/" + j + " ) . obtained: " + returned + " error: " + error

  value = 0
  if approxAll(value)[0] != "0" then console.log "fail testApproxAll: 0"

  value = 0.0
  if approxAll(value)[0] != "0" then console.log "fail testApproxAll: 0.0"

  value = 0.00
  if approxAll(value)[0] != "0" then console.log "fail testApproxAll: 0.00"

  value = 0.000
  if approxAll(value)[0] != "0" then console.log "fail testApproxAll: 0.000"

  value = 0.0000
  if approxAll(value)[0] != "0" then console.log "fail testApproxAll: 0.0000"

  value = 1
  if approxAll(value)[0] != "1" then console.log "fail testApproxAll: 1"

  value = 1.0
  if approxAll(value)[0] != "1" then console.log "fail testApproxAll: 1.0"

  value = 1.00
  if approxAll(value)[0] != "1" then console.log "fail testApproxAll: 1.00"

  value = 1.000
  if approxAll(value)[0] != "1" then console.log "fail testApproxAll: 1.000"

  value = 1.0000
  if approxAll(value)[0] != "1" then console.log "fail testApproxAll: 1.0000"

  value = 1.00000
  if approxAll(value)[0] != "1" then console.log "fail testApproxAll: 1.00000"

  value = Math.sqrt(2)
  if approxAll(value)[0] != "1 * sqrt( 2 ) / 1" then console.log "fail testApproxAll: Math.sqrt(2)"

  value = 1.41
  if approxAll(value)[0] != "1 * sqrt( 2 ) / 1" then console.log "fail testApproxAll: 1.41"

  # if we narrow down to a particular family then we can get
  # an OK guess even with few digits, expecially for really "famous" numbers

  value = 1.4
  if approxRadicals(value)[0] != "1 * sqrt( 2 ) / 1" then console.log "fail approxRadicals: 1.4"

  value = 0.6
  if approxLogs(value)[0] != "1 * log( 2 ) / 1" then console.log "fail approxLogs: 0.6"

  value = 0.69
  if approxLogs(value)[0] != "1 * log( 2 ) / 1" then console.log "fail approxLogs: 0.69"

  value = 0.7
  if approxLogs(value)[0] != "1 * log( 2 ) / 1" then console.log "fail approxLogs: 0.7"

  value = 1.09
  if approxLogs(value)[0] != "1 * log( 3 ) / 1" then console.log "fail approxLogs: 1.09"

  value = 1.09
  if approxAll(value)[0] != "1 * log( 3 ) / 1" then console.log "fail approxAll: 1.09"

  value = 1.098
  if approxAll(value)[0] != "1 * log( 3 ) / 1" then console.log "fail approxAll: 1.098"

  value = 1.1
  if approxAll(value)[0] != "1 * log( 3 ) / 1" then console.log "fail approxAll: 1.1"

  value = 1.11
  if approxAll(value)[0] != "1 * log( 3 ) / 1" then console.log "fail approxAll: 1.11"

  value = Math.sqrt(3)
  if approxAll(value)[0] != "1 * sqrt( 3 ) / 1" then console.log "fail testApproxAll: Math.sqrt(3)"

  value = 1.0000
  if approxAll(value)[0] != "1" then console.log "fail testApproxAll: 1.0000"


  value = 3.141592
  if approxAll(value)[0] != "1 * (pi ^ 1 ) / 1 )" then console.log "fail testApproxAll: 3.141592"

  value = 31.41592
  if approxAll(value)[0] != "10 * (pi ^ 1 ) / 1 )" then console.log "fail testApproxAll: 31.41592"

  value = 314.1592
  if approxAll(value)[0] != "100 * (pi ^ 1 ) / 1 )" then console.log "fail testApproxAll: 314.1592"

  value = 31415926.53589793
  if approxAll(value)[0] != "10000000 * (pi ^ 1 ) / 1 )" then console.log "fail testApproxAll: 31415926.53589793"

  value = Math.sqrt(2)
  if approxTrigonometric(value)[0] != "2 * sin( 1/4 * pi )" then console.log "fail approxTrigonometric: Math.sqrt(2)"

  value = Math.sqrt(3)
  if approxTrigonometric(value)[0] != "2 * sin( 1/3 * pi )" then console.log "fail approxTrigonometric: Math.sqrt(3)"

  value = (Math.sqrt(6) - Math.sqrt(2))/4
  if approxAll(value)[0] != "1 * sin( 1/12 * pi )" then console.log "fail testApproxAll: (Math.sqrt(6) - Math.sqrt(2))/4"

  value = Math.sqrt(2 - Math.sqrt(2))/2
  if approxAll(value)[0] != "1 * sin( 1/8 * pi )" then console.log "fail testApproxAll: Math.sqrt(2 - Math.sqrt(2))/2"

  value = (Math.sqrt(6) + Math.sqrt(2))/4
  if approxAll(value)[0] != "1 * sin( 5/12 * pi )" then console.log "fail testApproxAll: (Math.sqrt(6) + Math.sqrt(2))/4"

  value = Math.sqrt(2 + Math.sqrt(3))/2
  if approxAll(value)[0] != "1 * sin( 5/12 * pi )" then console.log "fail testApproxAll: Math.sqrt(2 + Math.sqrt(3))/2"

  value = (Math.sqrt(5) - 1)/4
  if approxAll(value)[0] != "1 * sin( 1/10 * pi )" then console.log "fail testApproxAll: (Math.sqrt(5) - 1)/4"

  value = Math.sqrt(10 - 2*Math.sqrt(5))/4
  if approxAll(value)[0] != "1 * sin( 1/5 * pi )" then console.log "fail testApproxAll: Math.sqrt(10 - 2*Math.sqrt(5))/4"

  # this has a radical form but it's too long to write
  value = Math.sin(Math.PI/7)
  if approxAll(value)[0] != "1 * sin( 1/7 * pi )" then console.log "fail testApproxAll: Math.sin(Math.PI/7)"

  # this has a radical form but it's too long to write
  value = Math.sin(Math.PI/9)
  if approxAll(value)[0] != "1 * sin( 1/9 * pi )" then console.log "fail testApproxAll: Math.sin(Math.PI/9)"

  value = 1836.15267
  if approxRationalsOfPowersOfPI(value)[0] != "6 * (pi ^ 5 ) / 1 )" then console.log "fail approxRationalsOfPowersOfPI: 1836.15267"


  for i in [1..13]
    for j in [1..13]
      console.log "approxTrigonometric testing: " + "1 * sin( " + i + "/" + j + " * pi )"
      fraction = i/j
      value = Math.sin(Math.PI * fraction)
      # we specifically search for sines of rational multiples of PI
      # because too many of them would be picked up as simple
      # rationals.
      returned = approxTrigonometric(value)
      returnedFraction = returned[3]/returned[4]
      returnedValue = returned[2] * Math.sin(Math.PI * returnedFraction)
      if Math.abs(value - returnedValue) > 1e-15
        console.log "fail approxTrigonometric: " + "1 * sin( " + i + "/" + j + " * pi ) . obtained: " + returned

  for i in [1..13]
    for j in [1..13]

      # with four digits, there are two collisions with the
      # "simple fraction" argument hypotesis, which we prefer since
      # it's a simpler expression, so let's skip those
      # two tests
      if i == 5 and j == 11 or
       i == 6 and j == 11
        continue

      console.log "approxTrigonometric testing with 4 digits: " + "1 * sin( " + i + "/" + j + " * pi )"
      fraction = i/j
      originalValue = Math.sin(Math.PI * fraction)
      value = originalValue.toFixed(4)
      # we specifically search for sines of rational multiples of PI
      # because too many of them would be picked up as simple
      # rationals.
      returned = approxTrigonometric(value)
      returnedFraction = returned[3]/returned[4]
      returnedValue = returned[2] * Math.sin(Math.PI * returnedFraction)
      error = Math.abs(originalValue - returnedValue)
      if error > 1e-14
        console.log "fail approxTrigonometric with 4 digits: " + "1 * sin( " + i + "/" + j + " * pi ) . obtained: " + returned + " error: " + error

  console.log "testApprox done"

$.approxRadicals     = approxRadicals 
$.approxRationalsOfLogs = approxRationalsOfLogs
$.approxAll             = approxAll 
$.testApprox            = testApprox
