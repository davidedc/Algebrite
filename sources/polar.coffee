###
Convert complex z to polar form

	Input:		push	z

	Output:		Result on stack

	polar(z) = abs(z) * exp(i * arg(z))
###



Eval_polar = ->
	push(cadr(p1))
	Eval()
	polar()

polar = ->
	# there are points where we turn polar
	# representations into rect, we set a "stack flag"
	# here to avoid that, so we don't undo the
	# work that we are trying to do.
	evaluatingPolar++
	save()
	p1 = pop()
	push(p1)
	abs()
	push(imaginaryunit)
	push(p1)
	arg()
	multiply()
	exponential()
	multiply()
	evaluatingPolar--
	restore()


