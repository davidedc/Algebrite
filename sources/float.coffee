

Eval_float = ->
	evaluatingAsFloats++
	push(cadr(p1))
	Eval()
	yyfloat()
	Eval(); # normalize
	evaluatingAsFloats--

checkFloatHasWorkedOutCompletely = (nodeToCheck) ->
	numberOfPowers = countOccurrencesOfSymbol(symbol(POWER),nodeToCheck)
	numberOfPIs = countOccurrencesOfSymbol(symbol(PI),nodeToCheck)
	numberOfEs = countOccurrencesOfSymbol(symbol(E),nodeToCheck)
	numberOfMults = countOccurrencesOfSymbol(symbol(MULTIPLY),nodeToCheck)
	numberOfSums = countOccurrencesOfSymbol(symbol(ADD),nodeToCheck)
	if DEBUG
		console.log "     ... numberOfPowers: " + numberOfPowers
		console.log "     ... numberOfPIs: " + numberOfPIs
		console.log "     ... numberOfEs: " + numberOfEs
		console.log "     ... numberOfMults: " + numberOfMults
		console.log "     ... numberOfSums: " + numberOfSums
	if numberOfPowers > 1 or numberOfPIs > 0 or numberOfEs > 0 or numberOfMults > 1 or numberOfSums > 1
		stop("float: some unevalued parts in " + nodeToCheck)

zzfloat = ->
	save()
	evaluatingAsFloats++
	#p1 = pop()
	#push(cadr(p1))
	#push(p1)
	Eval()
	yyfloat()
	Eval(); # normalize
	evaluatingAsFloats--
	restore()
	# zzfloat doesn't necessarily result in a double
	# , for example if there are variables. But
	# in many of the tests there should be indeed
	# a float, this line comes handy to highlight
	# when that doesn't happen for those tests.
	#checkFloatHasWorkedOutCompletely(stack[tos-1])

yyfloat = ->
	i = 0
	h = 0
	evaluatingAsFloats++
	save()
	p1 = pop()
	if (iscons(p1))
		h = tos
		while (iscons(p1))
			push(car(p1))
			yyfloat()
			p1 = cdr(p1)
		list(tos - h)
	else if (p1.k == TENSOR)
		push(p1)
		copy_tensor()
		p1 = pop()
		for i in [0...p1.tensor.nelem]
			push(p1.tensor.elem[i])
			yyfloat()
			p1.tensor.elem[i] = pop()
		push(p1)
	else if (p1.k == NUM)
		push(p1)
		bignum_float()
	else if (p1 == symbol(PI))
		push_double(Math.PI)
	else if (p1 == symbol(E))
		push_double(Math.E)
	else
		push(p1)
	restore()
	evaluatingAsFloats--

