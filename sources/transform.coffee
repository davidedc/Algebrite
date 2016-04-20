###
Transform an expression using table look-up

The expression and free variable are on the stack.

The argument s is a null terminated list of transform rules.

For example, see itab.cpp

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

transform = (s) ->
	h = 0

	save()

	p4 = pop()
	p3 = pop()

	# save symbol context in case Eval(B) below calls transform

	push(get_binding(symbol(METAA)))
	push(get_binding(symbol(METAB)))
	push(get_binding(symbol(METAX)))

	set_binding(symbol(METAX), p4)

	# put constants in F(X) on the stack

	h = tos
	push_integer(1)
	push(p3)
	push(p4)
	polyform(); # collect coefficients of x, x^2, etc.
	push(p4)
	decomp()

	for eachEntry in s
		if DEBUG then console.log "scanning table entry " + eachEntry
		if eachEntry
			scan_meta(eachEntry)
			p1 = pop()

			p5 = cadr(p1)
			p6 = caddr(p1)
			p7 = cdddr(p1)

			if (f_equals_a(h))
				break


	tos = h

	if eachEntry
		push(p6)
		Eval()
		p1 = pop()
	else
		p1 = symbol(NIL)

	set_binding(symbol(METAX), pop())
	set_binding(symbol(METAB), pop())
	set_binding(symbol(METAA), pop())

	push(p1)

	restore()

# search for a METAA and METAB such that F = A

f_equals_a = (h) ->
	i = 0
	j = 0
	for i in [h...tos]
		set_binding(symbol(METAA), stack[i])
		for j in [h...tos]
			set_binding(symbol(METAB), stack[j])
			p1 = p7;				# are conditions ok?
			while (iscons(p1))
				push(car(p1))
				Eval()
				p2 = pop()
				if (iszero(p2))
					break
				p1 = cdr(p1)
			if (iscons(p1))			# no, try next j
				continue
			push(p3);			# F = A?
			push(p5)
			Eval()
			subtract()
			p1 = pop()
			if (iszero(p1))
				return 1;		# yes
	return 0;					# no
