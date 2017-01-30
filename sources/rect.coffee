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
	if (car(p1) == symbol(ADD))
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

		push(p1);	# mag(z) * (cos(arg(z)) + i sin(arg(z)))
		mag()

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

