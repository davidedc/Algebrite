###
Transform an expression using a pattern. The
pattern can come from the integrals table or
the user-defined patterns.

The expression and free variable are on the stack.

The argument s is a null terminated list of transform rules.

For example, see the itab (integrals table)

Internally, the following symbols are used:

	F	input expression

	X	free variable, i.e. F of X

	A	template expression

	B	result expression

	C	list of conditional expressions

Puts the final expression on top of stack
(whether it's transformed or not) and returns
true is successful, false if not.


###



# p1 and p2 are tmps

#define F p3
#define X p4
#define A p5
#define B p6
#define C p7

transform = (s, generalTransform) ->
	transform_h = 0

	save()

	p1 = null

	p4 = pop() # X i.e. free variable
	p3 = pop() # F i.e. input expression

	if true
		console.log "         !!!!!!!!!   transform on: " + p3


	# save symbol context in case Eval(B) below calls transform

	saveMetaBindings()

	set_binding(symbol(METAX), p4)

	# put constants in F(X) on the stack

	transform_h = tos
	push_integer(1)
	push(p3)
	push(p4)
	polyform(); # collect coefficients of x, x^2, etc.
	push(p4)
	
	bookmarkTosToPrintDecomps = tos - 2
	decomp(generalTransform)
	numberOfDecomps = tos - bookmarkTosToPrintDecomps

	if true
		console.log "	" + numberOfDecomps + " decomposed elements ====== "
		for i in [0...numberOfDecomps]
			console.log "	decomposition element " + i + ": " + stack[tos-1-i]

	transformationSuccessful = false

	eachTransformEntry = s
	if generalTransform
		if DEBUG then console.log "applying transform: " + eachTransformEntry
		if DEBUG then console.log "scanning table entry " + eachTransformEntry

		push eachTransformEntry

		push symbol(SYMBOL_A_UNDERSCORE)
		push symbol(METAA)
		subst()

		push symbol(SYMBOL_B_UNDERSCORE)
		push symbol(METAB)
		subst()

		push symbol(SYMBOL_X_UNDERSCORE)
		push symbol(METAX)
		subst()

		p1 = pop()

		p5 = car(p1)
		if DEBUG then console.log "template expression: " + p5
		p6 = cadr(p1)
		p7 = cddr(p1)

		###
		p5 = p1.tensor.elem[0]
		p6 = p1.tensor.elem[1]
		for i in [2..(p1.tensor.elem.length-1)]
			push p1.tensor.elem[i]
		list(p1.tensor.elem.length - 2)
		p7 = pop()
		###


		#if f_equals_a(transform_h, generalTransform)
		# then there is a successful transformation,
		# and transformed result is in p6
		# otherwise...

		if (f_equals_a(transform_h, generalTransform))
			transformationSuccessful = true
		else
			# the match failed but perhaps we can match
			# something lower down in the tree, so
			# let's recurse the tree

			if true then console.log "p3 at this point: " + p3

			transformedTerms = []

			if DEBUG then console.log "car(p3): " + car(p3)
			restTerm = p3

			if iscons(restTerm)
				transformedTerms.push car(p3)
				restTerm = cdr(p3)

			while (iscons(restTerm))
				secondTerm = car(restTerm)
				restTerm = cdr(restTerm)

				if DEBUG then console.log "tos before recursive transform: " + tos
				
				push(secondTerm)
				push_symbol(NIL)
				if DEBUG then console.log "testing: " + secondTerm
				#if (secondTerm+"") == "eig(A x,transpose(A x))()"
				#	debugger
				if true then console.log "about to try to simplify other term: " + secondTerm
				success = transform(s, generalTransform)					
				transformationSuccessful = transformationSuccessful or success

				transformedTerms.push pop()

				if true then console.log "tried to simplify other term: " + secondTerm + " ...successful?: " + success + " ...transformed: " + transformedTerms[transformedTerms.length-1]


			# recreate the tree we were passed,
			# but with all the terms being transformed
			if transformedTerms.length != 0
				for i in transformedTerms
					push i
				list(transformedTerms.length)
				p6 = pop()



	else # "integrals" mode
		for eachTransformEntry in s
			if DEBUG then console.log "scanning table entry " + eachTransformEntry
			if eachTransformEntry
				scan_meta(eachTransformEntry)
				p1 = pop()

				p5 = cadr(p1)
				p6 = caddr(p1)
				p7 = cdddr(p1)

				###
				p5 = p1.tensor.elem[0]
				p6 = p1.tensor.elem[1]
				for i in [2..(p1.tensor.elem.length-1)]
					push p1.tensor.elem[i]
				list(p1.tensor.elem.length - 2)
				p7 = pop()
				###


				if (f_equals_a(transform_h, generalTransform))
					# there is a successful transformation,
					# transformed result is in p6
					transformationSuccessful = true
					break




	tos = transform_h


	if transformationSuccessful
		#console.log "transformation successful"
		# a transformation was successful
		push(p6)
		Eval()
		p1 = pop()
		#console.log "...into: " + p1
		transformationSuccessful = true
	else
		# transformations failed
		if generalTransform
			# result = original expression
			p1 = p3
		else
			p1 = symbol(NIL)

	restoreMetaBindings()

	push(p1)

	restore()
	return transformationSuccessful

saveMetaBindings = ->
	push(get_binding(symbol(METAA)))
	push(get_binding(symbol(METAB)))
	push(get_binding(symbol(METAX)))


restoreMetaBindings = ->
	set_binding(symbol(METAX), pop())
	set_binding(symbol(METAB), pop())
	set_binding(symbol(METAA), pop())

# search for a METAA and METAB such that F = A

f_equals_a = (h, generalTransform) ->
	fea_i = 0
	fea_j = 0
	for fea_i in [h...tos]

		# constants might end up matching to become
		# a more complex expression that gives out their
		# value, we want to avoid that
		if generalTransform and isnum(stack[fea_i])
			continue

		set_binding(symbol(METAA), stack[fea_i])
		if DEBUG
			console.log "binding METAA to " + get_binding(symbol(METAA))
		for fea_j in [h...tos]

			# constants might end up matching to become
			# a more complex expression that gives out their
			# value, we want to avoid that
			if generalTransform and isnum(stack[fea_j])
				continue

			set_binding(symbol(METAB), stack[fea_j])
			if DEBUG
				console.log "binding METAB to " + get_binding(symbol(METAB))

			# now test all the conditions (it's an and between them)
			p1 = p7
			while (iscons(p1))
				push(car(p1))
				Eval()
				p2 = pop()
				if (iszero(p2))
					break
				p1 = cdr(p1)

			if (iscons(p1))
				# conditions are not met,
				# skip to the next binding of metas
				continue
			push(p3);			# F = A?
			if DEBUG then console.log "about to evaluate template expression: " + p5 + " binding METAA to " + get_binding(symbol(METAA))
			push(p5)
			if generalTransform
				originalexpanding = expanding
				expanding = false
			Eval()
			if generalTransform
				expanding = originalexpanding
			if DEBUG
				console.log "comparing " + stack[tos-1] + " to: " + stack[tos-2]
			subtract()
			p1 = pop()
			if (iszero(p1))
				if DEBUG
					console.log "binding METAA to " + get_binding(symbol(METAA))
					console.log "binding METAB to " + get_binding(symbol(METAB))
					console.log "comparing " + p3 + " to: " + p5
				return 1;		# yes
	return 0;					# no
