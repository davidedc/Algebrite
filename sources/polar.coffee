###
Convert complex z to polar form

	Input:		push	z

	Output:		Result on stack

	polar(z) = mag(z) * exp(i * arg(z))
###



Eval_polar = ->
	push(cadr(p1))
	Eval()
	polar()

polar = ->
	save()
	p1 = pop()
	push(p1)
	mag()
	push(imaginaryunit)
	push(p1)
	arg()
	multiply()
	exponential()
	multiply()
	restore()


