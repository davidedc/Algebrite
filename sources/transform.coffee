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

	p4 = pop() # X i.e. free variable
	p3 = pop() # F i.e. input expression

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

	for eachTransformEntry in s
		if DEBUG then console.log "scanning table entry " + eachTransformEntry
		debugger
		if eachTransformEntry
			scan_meta(eachTransformEntry)
			p1 = pop()
			debugger

			p5 = cadr(p1)
			p6 = caddr(p1)
			p7 = cdddr(p1)

			if (f_equals_a(transform_h, generalTransform))
				break


	tos = transform_h

	if eachTransformEntry
		# a transformation was successful
		push(p6)
		Eval()
		p1 = pop()
	else
		if !generalTransform
			p1 = symbol(NIL)

	set_binding(symbol(METAX), pop())
	set_binding(symbol(METAB), pop())
	set_binding(symbol(METAA), pop())

	push(p1)

	restore()

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
				debugger
				return 1;		# yes
	return 0;					# no
