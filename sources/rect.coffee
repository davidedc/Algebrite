###
Convert complex z to rectangular form

	Input:		push	z

	Output:		Result on stack
###


DEBUG_RECT = false

Eval_rect = ->
	push(cadr(p1))
	Eval()
	rect()

rect = ->
	save()
	p1 = pop()
	input = p1

	if DEBUG_RECT then console.log "RECT of " + input

	if DEBUG_RECT then console.log "any clock forms in : " + input + " ? " + findPossibleClockForm(input)


	# if we assume real variables, then the
	# rect of any symbol is the symbol itself
	# (note that 'i' is not a symbol, it's made of (-1)^(1/2))
	# otherwise we have to leave unevalled
	if issymbol(p1)
		if DEBUG_RECT then console.log " rect: simple symbol: " + input
		if !iszero(get_binding(symbol(ASSUME_REAL_VARIABLES)))
			push(p1)
		else
			push_symbol(YYRECT)
			push(p1)
			list(2)

	# TODO this is quite dirty, ideally we don't need this
	# but removing this creates a few failings in the tests
	# that I can't investigate right now.
	# --
	# if we assume all variables are real AND
	# it's not an exponential nor a polar nor a clock form
	# THEN rect(_) = _
	# note that these matches can be quite sloppy, one can find expressions
	# which shouldn't match but do
	# 
	else if !iszero(get_binding(symbol(ASSUME_REAL_VARIABLES))) and
	  !findPossibleExponentialForm(p1) and # no exp form?
	  !findPossibleClockForm(p1) and # no clock form?
	  !(Find(p1, symbol(SIN)) and Find(p1, symbol(COS)) and Find(p1, imaginaryunit)) # no polar form?
		if DEBUG_RECT then console.log " rect: simple symbol: " + input
		push(p1)

	# ib
	else if (car(p1) == symbol(MULTIPLY) and isimaginaryunit(cadr(p1)) and !iszero(get_binding(symbol(ASSUME_REAL_VARIABLES))))
		push(p1)

	# sum
	else if (car(p1) == symbol(ADD))
		if DEBUG_RECT then console.log " rect - " + input + " is a sum "
		push_integer(0)
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			rect()
			add()
			p1 = cdr(p1)

	else
		# try to get to the rectangular form by doing
		# abs(p1) * (cos (theta) + i * sin(theta))
		# where theta is arg(p1)
		if DEBUG_RECT then console.log " rect - " + input + " is NOT a sum "

		push(p1);	# abs(z) * (cos(arg(z)) + i sin(arg(z)))
		abs()

		if DEBUG_RECT then console.log " rect - " + input + " abs: " + stack[tos-1].toString()
		push(p1)
		arg()
		if DEBUG_RECT then console.log " rect - " + input + " arg of " + p1 + " : " + stack[tos-1].toString()
		p1 = pop()
		push(p1)
		cosine()
		if DEBUG_RECT then console.log " rect - " + input + " cosine: " + stack[tos-1].toString()
		push(imaginaryunit)
		push(p1)
		sine()
		if DEBUG_RECT then console.log " rect - " + input + " sine: " + stack[tos-1].toString()
		multiply()
		if DEBUG_RECT then console.log " rect - " + input + " i * sine: " + stack[tos-1].toString()
		add()
		if DEBUG_RECT then console.log " rect - " + input + " cos + i * sine: " + stack[tos-1].toString()
		multiply()
	restore()
	if DEBUG_RECT then console.log "rect of " + input + " : " + stack[tos-1]

