

Eval_simplify = ->
	push(cadr(p1))
	runUserDefinedSimplifications()
	Eval()
	simplify()

runUserDefinedSimplifications = ->
	# -----------------------
	# unfortunately for the time being user
	# specified simplifications are only
	# run in things which don't contain
	# integrals.
	# Doesn't work yet, could be because of
	# some clobbering as "transform" is called
	# recursively?
	if userSimplificationsInListForm.length != 0 and !Find(cadr(p1), symbol(INTEGRAL))
		originalexpanding = expanding
		expanding = false
		if DEBUG then console.log("runUserDefinedSimplifications passed: " + stack[tos-1].toString())
		Eval()
		if DEBUG then console.log("runUserDefinedSimplifications after eval no expanding: " + stack[tos-1].toString())
		expanding = originalexpanding


		p1 = stack[tos-1]

		if DEBUG then console.log "patterns to be checked: "
		for eachSimplification in userSimplificationsInListForm
			if DEBUG then console.log "..." + eachSimplification

		atLeastOneSuccessInRouldOfRulesApplications = true
		numberOfRulesApplications = 0

		
		while atLeastOneSuccessInRouldOfRulesApplications and numberOfRulesApplications < MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES
			atLeastOneSuccessInRouldOfRulesApplications = false
			numberOfRulesApplications++
			for eachSimplification in userSimplificationsInListForm
				success = true
				eachConsecutiveRuleApplication = 0
				while success and eachConsecutiveRuleApplication < MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE
					eachConsecutiveRuleApplication++
					if DEBUG then console.log "simplify - tos: " + tos + " checking pattern: " + eachSimplification + " on: " + p1
					push_symbol(NIL)
					success = transform(eachSimplification, true)
					if success
						atLeastOneSuccessInRouldOfRulesApplications = true
					p1 = stack[tos-1]
					if DEBUG then console.log "p1 at this stage of simplification: " + p1
				if eachConsecutiveRuleApplication == MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE
					stop("maximum application of single transformation rule exceeded: " + eachSimplification)

		if numberOfRulesApplications == MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES
			stop("maximum application of all transformation rules exceeded ")

		if DEBUG
			console.log "METAX = " + get_binding(symbol(METAX))
			console.log "METAA = " + get_binding(symbol(METAA))
			console.log "METAB = " + get_binding(symbol(METAB))

	# ------------------------

simplifyForCodeGeneration = ->
	save()
	runUserDefinedSimplifications()
	codeGen = true
	# in "codeGen" mode we completely
	# eval and simplify the function bodies
	# because we really want to resolve all
	# the variables indirections and apply
	# all the simplifications we can.
	simplify_main()
	codeGen = false
	restore()

simplify = ->
	save()
	simplify_main()
	restore()

simplify_main = ->
	p1 = pop()

	# when we do code generation, we proceed to
	# fully evaluate and simplify the body of
	# a function, so we resolve all variables
	# indirections and we simplify everything
	# we can given the current assignments.
	if codeGen and car(p1) == symbol(FUNCTION)
		fbody = cadr(p1)		
		push fbody
		# let's simplify the body so we give it a
		# compact form
		eval()
		simplify()
		p3 = pop()

		# replace the evaled body
		args = caddr(p1); # p5 is B

		push_symbol(FUNCTION)
		push p3
		push args
		list(3)
		p1 = pop()

	if (istensor(p1))
		simplify_tensor()
		return

	if (Find(p1, symbol(FACTORIAL)))
		push(p1)
		simfac()
		p2 = pop()
		push(p1)
		rationalize()
		simfac()
		p3 = pop()
		if (count(p2) < count(p3))
			p1 = p2
		else
			p1 = p3

	f10()
	f1()
	f2()
	f3()
	f4()
	f5()
	f9()
	simplify_polarRect()
	if do_simplify_nested_radicals
		# if there is some de-nesting then
		# re-run a simplification because
		# the shape of the expression might
		# have changed significantly.
		# e.g. simplify(14^(1/2) - (16 - 4*7^(1/2))^(1/2))
		# needs some more semplification after the de-nesting.
		if simplify_nested_radicals()
			if DEBUG then console.log("de-nesting successful into: " + p1.toString())
			push(p1)
			simplify()
			return

	simplify_rectToClock()

	push(p1)

simplify_tensor = ->
	i = 0
	p2 = alloc_tensor(p1.tensor.nelem)
	p2.tensor.ndim = p1.tensor.ndim
	for i in [0...p1.tensor.ndim]
		p2.tensor.dim[i] = p1.tensor.dim[i]
	for i in [0...p1.tensor.nelem]
		push(p1.tensor.elem[i])
		simplify()
		p2.tensor.elem[i] = pop()

	check_tensor_dimensions p2

	if (iszero(p2))
		p2 = zero; # null tensor becomes scalar zero
	push(p2)


# try rationalizing

f1 = ->
	if (car(p1) != symbol(ADD))
		return
	push(p1)
	rationalize()
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2

# try condensing

f2 = ->
	if (car(p1) != symbol(ADD))
		return
	push(p1)
	Condense()
	p2 = pop()
	if (count(p2) <= count(p1))
		p1 = p2

# this simplifies forms like (A-B) / (B-A)

f3 = ->
	push(p1)
	rationalize()
	negate()
	rationalize()
	negate()
	rationalize()
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2


f10 = ->

	carp1 = car(p1)
	miao = cdr(p1)
	if ( carp1 == symbol(MULTIPLY) || isinnerordot(p1))
		# both operands a transpose?

		if (car(car(cdr(p1))) == symbol(TRANSPOSE)) and (car(car(cdr(cdr(p1)))) == symbol(TRANSPOSE))
			if DEBUG then console.log "maybe collecting a transpose " + p1
			a = cadr(car(cdr(p1)))
			b = cadr(car(cdr(cdr(p1))))
			if carp1 == symbol(MULTIPLY)
				push(a)
				push(b)
				multiply()
			else if isinnerordot(p1)
				push(b)
				push(a)
				inner()
			push_integer(1)
			push_integer(2)
			originalexpanding = expanding
			expanding = false
			transpose()
			expanding = originalexpanding

			p2 = pop()
			if (count(p2) < count(p1))
				p1 = p2
			if DEBUG then console.log "collecting a transpose " + p2

# try expanding denominators

f4 = ->
	if (iszero(p1))
		return
	push(p1)
	rationalize()
	inverse()
	rationalize()
	inverse()
	rationalize()
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2

# simplifies trig forms

simplify_trig = ->
	save()
	p1 = pop()
	f5()
	push(p1)
	restore()

f5 = ->
	if (Find(p1, symbol(SIN)) == 0 && Find(p1, symbol(COS)) == 0)
		return

	p2 = p1

	trigmode = 1
	push(p2)
	Eval()
	p3 = pop()

	trigmode = 2
	push(p2)
	Eval()
	p4 = pop()

	trigmode = 0

	if (count(p4) < count(p3) || nterms(p4) < nterms(p3))
		p3 = p4

	if (count(p3) < count(p1) || nterms(p3) < nterms(p1))
		p1 = p3

# if it's a sum then try to simplify each term

f9 = ->
	if (car(p1) != symbol(ADD))
		return
	push_integer(0)
	p2 = cdr(p1)
	while (iscons(p2))
		push(car(p2))
		simplify()
		add()
		p2 = cdr(p2)
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2

# things like 6*(cos(2/9*pi)+i*sin(2/9*pi))
# where we have sin and cos, those might start to
# look better in clock form i.e.  6*(-1)^(2/9) 
simplify_rectToClock = ->
	#debugger

	if (Find(p1, symbol(SIN)) == 0 && Find(p1, symbol(COS)) == 0)
		return

	push(p1)
	Eval()
	clockform()

	p2 = pop(); # put new (hopefully simplified expr) in p2
	if DEBUG then console.log "before simplification clockform: " + p1 + " after: " + p2

	if (count(p2) < count(p1))
		p1 = p2

simplify_polarRect = ->
	push(p1)

	polarRectAMinusOneBase()
	Eval()

	p2 = pop(); # put new (hopefully simplified expr) in p2

	if (count(p2) < count(p1))
		p1 = p2

polarRectAMinusOneBase = ->
	save()
	p1 = pop()
	
	if isimaginaryunit(p1)
		push(p1)
		restore()
		return

	if (equal(car(p1), symbol(POWER)) and isminusone(cadr(p1)) )

		# base we just said is minus 1
		push(one)
		negate()

		# exponent
		push(caddr(p1))
		polarRectAMinusOneBase()
		
		power()
		# try to simplify it using polar and rect
		polar()
		rect()

	else if (iscons(p1))
		h = tos
		while (iscons(p1))
			#console.log("recursing on: " + car(p1).toString())
			push(car(p1))
			polarRectAMinusOneBase()
			#console.log("...transformed into: " + stack[tos-1].toString())
			p1 = cdr(p1)
		list(tos - h)
	else
		push(p1)

	restore()
	return

nterms = (p) ->
	if (car(p) != symbol(ADD))
		return 1
	else
		return length(p) - 1

simplify_nested_radicals = ->
	if recursionLevelNestedRadicalsRemoval > 0
		if DEBUG then console.log("denesting bailing out because of too much recursion")
		return false

	push(p1)
	somethingSimplified = take_care_of_nested_radicals()


	# in this paragraph we check whether we can collect
	# common factors without complicating the expression
	# in particular we want to avoid 
	# collecting radicals like in this case where
	# we collect sqrt(2):
	#   2-2^(1/2) into 2^(1/2)*(-1+2^(1/2))
	# but we do like to collect other non-radicals e.g.
	#   17/2+3/2*5^(1/2) into 1/2*(17+3*5^(1/2))
	# so what we do is we count the powers and we check
	# which version has the least number of them.
	simplificationWithoutCondense = stack[tos-1]

	prev_expanding = expanding
	expanding = 0
	yycondense()
	expanding = prev_expanding

	simplificationWithCondense = pop()
	#console.log("occurrences of powers in " + simplificationWithoutCondense + " :" + countOccurrencesOfSymbol(symbol(POWER),simplificationWithoutCondense))
	#console.log("occurrences of powers in " + simplificationWithCondense + " :" + countOccurrencesOfSymbol(symbol(POWER),simplificationWithCondense))

	if (countOccurrencesOfSymbol(symbol(POWER),simplificationWithoutCondense) < countOccurrencesOfSymbol(symbol(POWER),simplificationWithCondense))
		push(simplificationWithoutCondense)
	else
		push(simplificationWithCondense)


	# we got out result, wrap up
	p1 = pop()
	return somethingSimplified

take_care_of_nested_radicals = ->
	if recursionLevelNestedRadicalsRemoval > 0
		if DEBUG then console.log("denesting bailing out because of too much recursion")
		return false


	save()
	p1 = pop()
	#console.log("take_care_of_nested_radicals p1: " + p1.toString())
	
	if equal(car(p1), symbol(POWER))

		#console.log("ok it's a power ")
		base = cadr(p1)
		exponent = caddr(p1)
		#console.log("possible double radical base: " + base)
		#console.log("possible double radical exponent: " + exponent)

		if !isminusone(exponent) and equal(car(base), symbol(ADD)) and isfraction(exponent) and (equalq(exponent,1,3) or equalq(exponent,1,2))

			#console.log("ok there is a radix with a term inside")
			firstTerm = cadr(base)
			push(firstTerm)
			take_care_of_nested_radicals()
			pop()
			secondTerm = caddr(base)
			push(secondTerm)
			take_care_of_nested_radicals()
			pop()

			#console.log("possible double radical term1: " + firstTerm)
			#console.log("possible double radical term2: " + secondTerm)

			numberOfTerms = 0
			countingTerms = base
			while (cdr(countingTerms) != symbol(NIL))
				numberOfTerms++
				countingTerms = cdr(countingTerms)
			#console.log("number of terms: " + numberOfTerms)
			if numberOfTerms > 2
				#console.log("too many terms under outer radix ")
				push(p1)
				restore()
				return false


			# list here all the factors
			commonInnerExponent = null
			commonBases = []
			termsThatAreNotPowers = []
			if (car(secondTerm) == symbol(MULTIPLY))
				# product of factors
				secondTermFactor = cdr(secondTerm)
				if iscons(secondTermFactor)
					while (iscons(secondTermFactor))
						#console.log("second term factor BIS: " + car(secondTermFactor).toString())
						potentialPower = car(secondTermFactor)
						if (car(potentialPower) == symbol(POWER)) 
							innerbase = cadr(potentialPower)
							innerexponent = caddr(potentialPower)
							if equalq(innerexponent,1,2)
								#console.log("tackling double radical 1: " + p1.toString())
								if !commonInnerExponent?
									commonInnerExponent = innerexponent
									commonBases.push(innerbase)
								else
									if equal(innerexponent, commonInnerExponent)
										#console.log("common base: " + innerbase.toString())
										commonBases.push(innerbase)
									else
										#console.log("no common bases here ")
								#console.log("this one is a power base: " + innerbase + " , exponent: " + innerexponent)
						else
							termsThatAreNotPowers.push(potentialPower)
						secondTermFactor = cdr(secondTermFactor)
			else if (car(secondTerm) == symbol(POWER)) 
				innerbase = cadr(secondTerm)
				innerexponent = caddr(secondTerm)
				if !commonInnerExponent? and equalq(innerexponent,1,2)
					#console.log("tackling double radical 2: " + p1.toString())
					commonInnerExponent = innerexponent
					commonBases.push(innerbase)

			
			if commonBases.length == 0
				push(p1)
				restore()
				return false

			A = firstTerm
			#console.log("A: " + A.toString())

			push_integer(1)
			for i in commonBases
				push(i)
				multiply()
				#console.log("basis with common exponent: " + i.toString())
			C = pop()
			#console.log("C: " + C.toString())
			
			push_integer(1)
			for i in termsThatAreNotPowers
				push(i)
				multiply()
				#console.log("terms that are not powers: " + i.toString())
			B = pop()
			#console.log("B: " + B.toString())


			if equalq(exponent,1,3)
				push(A)
				negate()
				push(C)
				multiply()
				push(B)
				divide()    # 4th coeff
				#console.log("constant coeff " + stack[tos-1].toString())
				checkSize = pop()
				push(checkSize)
				real()
				yyfloat()
				if Math.abs(pop().d) > Math.pow(2, 32)
					push(p1)
					restore()
					return false
				push(checkSize)

				push_integer(3)
				push(C)
				multiply()   # 3rd coeff
				#console.log("next coeff " + stack[tos-1].toString())
				checkSize = pop()
				push(checkSize)
				real()
				yyfloat()
				if Math.abs(pop().d) > Math.pow(2, 32)
					pop()
					push(p1)
					restore()
					return false
				push(checkSize)

				push(symbol(SECRETX))
				multiply()


				push_integer(-3)
				push(A)
				multiply()
				push(B)
				divide()  # 2nd coeff
				checkSize = pop()
				push(checkSize)
				real()
				yyfloat()
				if Math.abs(pop().d) > Math.pow(2, 32)
					pop()
					pop()
					push(p1)
					restore()
					return false
				push(checkSize)

				#console.log("next coeff " + stack[tos-1].toString())
				push(symbol(SECRETX))
				push_integer(2)
				power()
				multiply()

				push_integer(1) # 1st coeff
				#console.log("next coeff " + stack[tos-1].toString())
				push(symbol(SECRETX))
				push_integer(3)
				power()
				multiply()

				add()
				add()
				add()
			
			else if equalq(exponent,1,2)
				push(C) # 3th coeff
				checkSize = pop()
				push(checkSize)
				real()
				yyfloat()
				if Math.abs(pop().d) > Math.pow(2, 32)
					push(p1)
					restore()
					return false
				push(checkSize)
				#console.log("constant coeff " + stack[tos-1].toString())

				push_integer(-2)
				push(A)
				multiply()
				push(B)
				divide()  # 2nd coeff
				checkSize = pop()
				push(checkSize)
				real()
				yyfloat()
				if Math.abs(pop().d) > Math.pow(2, 32)
					pop()
					push(p1)
					restore()
					return false
				push(checkSize)

				#console.log("next coeff " + stack[tos-1].toString())
				push(symbol(SECRETX))
				multiply()


				push_integer(1) # 1st coeff
				#console.log("next coeff " + stack[tos-1].toString())
				push(symbol(SECRETX))
				push_integer(2)
				power()
				multiply()

				add()
				add()

			#console.log("whole polynomial: " + stack[tos-1].toString())

			push(symbol(SECRETX))


			recursionLevelNestedRadicalsRemoval++
			#console.log("invoking roots at recursion level: " + recursionLevelNestedRadicalsRemoval)
			roots()
			recursionLevelNestedRadicalsRemoval--
			if equal(stack[tos-1], symbol(NIL))
				if DEBUG then console.log("roots bailed out because of too much recursion")
				pop()
				push(p1)
				restore()
				return false

			#console.log("all solutions: " + stack[tos-1].toString())

			# exclude the solutions with radicals
			possibleSolutions = []
			for eachSolution in stack[tos-1].tensor.elem
				if !Find(eachSolution, symbol(POWER))
					possibleSolutions.push(eachSolution)

			pop() # popping the tensor with the solutions

			#console.log("possible solutions: " + possibleSolutions.toString())
			if possibleSolutions.length == 0
				push(p1)
				restore()
				return false

			possibleRationalSolutions = []
			realOfpossibleRationalSolutions = []
			#console.log("checking the one with maximum real part ")
			for i in possibleSolutions
				push(i)
				real()
				yyfloat()
				possibleRationalSolutions.push(i)
				realOfpossibleRationalSolutions.push(pop().d)

			whichRationalSolution = realOfpossibleRationalSolutions.indexOf(Math.max.apply(Math, realOfpossibleRationalSolutions))
			SOLUTION = possibleRationalSolutions[whichRationalSolution]
			#console.log("picked solution: " + SOLUTION)

			
			###
			#possibleNewExpressions = []
			#realOfPossibleNewExpressions = []
			# pick the solution which cubic root has no radicals
			lowercase_b = null
			for SOLUTION in possibleSolutions
				console.log("testing solution: " + SOLUTION.toString())

				debugger
				if equalq(exponent,1,3)
					push(A)
					push(SOLUTION)
					push_integer(3)
					power()
					push_integer(3)
					push(C)
					multiply()
					push(SOLUTION)
					multiply()
					add()
					divide()
					console.log("argument of cubic root: " + stack[tos-1].toString())
					push_rational(1,3)
					power()
				else if equalq(exponent,1,2)
					push(A)
					push(SOLUTION)
					push_integer(2)
					power()
					push(C)
					add()
					divide()
					console.log("argument of cubic root: " + stack[tos-1].toString())
					push_rational(1,2)
					power()
				console.log("b is: " + stack[tos-1].toString())

				lowercase_b = pop()

				if !Find(lowercase_b, symbol(POWER))
					break
			###

			if equalq(exponent,1,3)
				push(A)
				push(SOLUTION)
				push_integer(3)
				power()
				push_integer(3)
				push(C)
				multiply()
				push(SOLUTION)
				multiply()
				add()
				divide()
				#console.log("argument of cubic root: " + stack[tos-1].toString())
				push_rational(1,3)
				power()
			else if equalq(exponent,1,2)
				push(A)
				push(SOLUTION)
				push_integer(2)
				power()
				push(C)
				add()
				divide()
				#console.log("argument of cubic root: " + stack[tos-1].toString())
				push_rational(1,2)
				power()
			#console.log("b is: " + stack[tos-1].toString())

			lowercase_b = pop()


			if !lowercase_b?
				push(p1)
				restore()
				return false

			push(lowercase_b)
			push(SOLUTION)
			multiply()
			

			if equalq(exponent,1,3)
				#console.log("a is: " + stack[tos-1].toString())

				lowercase_a = pop()

				push(lowercase_b)
				push(C)
				push_rational(1,2)
				power()
				multiply()

				push(lowercase_a)
				add()
				simplify()
			else if equalq(exponent,1,2)
				#console.log("a could be: " + stack[tos-1].toString())

				lowercase_a = pop()

				push(lowercase_b)
				push(C)
				push_rational(1,2)
				power()
				multiply()

				push(lowercase_a)
				add()
				simplify()
				possibleNewExpression = pop()
				#console.log("verifying if  " + possibleNewExpression + " is positive")
				push(possibleNewExpression)
				real()
				yyfloat()
				possibleNewExpressionValue = pop()
				if !isnegativenumber(possibleNewExpressionValue)
					#console.log("... it is positive")
					push(possibleNewExpression)
				else
					#console.log("... it is NOT positive")
					push(lowercase_b)
					negate()
					lowercase_b = pop()

					push(lowercase_a)
					negate()
					lowercase_a = pop()


					push(lowercase_b)
					push(C)
					push_rational(1,2)
					power()
					multiply()

					push(lowercase_a)
					add()
					simplify()
					# possibleNewExpression is now at top of stack


			#console.log("potential new expression: " + stack[tos-1].toString())
			p1 = pop()
			#newExpression = pop()
			#debugger
			#push(newExpression)
			#real()
			#yyfloat()
			#possibleNewExpressions.push(newExpression)
			#realOfPossibleNewExpressions.push(pop().d)

			#whichExpression = realOfPossibleNewExpressions.indexOf(Math.max.apply(Math, realOfPossibleNewExpressions))
			#p1 = possibleNewExpressions[whichExpression]
			#console.log("final new expression: " + p1.toString())

			push(p1)
			restore()
			return true



		else
			push(p1)
			restore()
			return false

	else if (iscons(p1))
		h = tos
		anyRadicalSimplificationWorked = false
		while (iscons(p1))
			#console.log("recursing on: " + car(p1).toString())
			push(car(p1))
			anyRadicalSimplificationWorked = anyRadicalSimplificationWorked or take_care_of_nested_radicals()
			#console.log("...transformed into: " + stack[tos-1].toString())
			p1 = cdr(p1)
		list(tos - h)
		restore()
		return anyRadicalSimplificationWorked
	else
		push(p1)
		restore()
		return false

	throw new Error("control flow should never reach here")
