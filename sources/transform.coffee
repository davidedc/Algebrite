###
Transform an expression using table look-up

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

	if DEBUG
		console.log "         !!!!!!!!!   transform on: " + p3


	# save symbol context in case Eval(B) below calls transform

	push(get_binding(symbol(METAA)))
	push(get_binding(symbol(METAB)))
	push(get_binding(symbol(METAX)))

	set_binding(symbol(METAX), p4)

	# put constants in F(X) on the stack

	transform_h = tos
	push_integer(1)
	push(p3)
	push(p4)
	polyform(); # collect coefficients of x, x^2, etc.
	push(p4)
	decomp(generalTransform)

	if DEBUG
		for i in [1...tos]
			console.log "stack content at " + i + " " + stack[tos-i]

	if generalTransform
		for eachTransformEntry in s
			if DEBUG then console.log "scanning table entry " + eachTransformEntry
			if eachTransformEntry

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


				if (f_equals_a(transform_h, generalTransform))
					# there is a successful transformation,
					# transformed result is in p6
					break
				else
					# the match failed but perhaps we can match
					# something lower in the tree

					if iscons(p3)
						push(car(p3))
						push_symbol(NIL)
						firstTermSuccess = transform(s, generalTransform)
						firstTermTransform = stack[tos-1]
						if DEBUG then console.log "trying to simplify first term: " + car(p3) + " ..." + firstTermSuccess

						push(cdr(p3))
						push_symbol(NIL)
						if DEBUG then console.log "testing: " + cdr(p3)
						#if (cdr(p3)+"") == "eig(A x,transpose(A x))()"
						#	debugger
						secondTermSuccess = transform(s, generalTransform)
						secondTermTransform = stack[tos-1]
						if DEBUG then console.log "trying to simplify other term: " + cdr(p3) + " ..." + secondTermSuccess

						tos = transform_h
						restoreMetaBindings()

						push firstTermTransform
						push secondTermTransform
						cons()
						restore()
						if firstTermSuccess or secondTermSuccess
							return true

						else
							return false


	else
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
					break




	tos = transform_h

	transformationSuccessful = false

	if eachTransformEntry
		# a transformation was successful
		push(p6)
		Eval()
		p1 = pop()
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


restoreMetaBindings = ->
	set_binding(symbol(METAX), pop())
	set_binding(symbol(METAB), pop())
	set_binding(symbol(METAA), pop())

# search for a METAA and METAB such that F = A

f_equals_a = (h, generalTransform) ->
	fea_i = 0
	fea_j = 0
	for fea_i in [h...tos]
		set_binding(symbol(METAA), stack[fea_i])
		if DEBUG
			console.log "binding METAA to " + get_binding(symbol(METAA))
		for fea_j in [h...tos]
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
				return 1;		# yes
	return 0;					# no
