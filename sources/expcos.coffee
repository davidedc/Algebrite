# Do the exponential cosine function.



Eval_expcos = ->
	push(cadr(p1))
	Eval()
	expcos()

expcos = ->
	save()

	p1 = pop()

	push(imaginaryunit)
	push(p1)
	multiply()
	exponential()
	push_rational(1, 2)
	multiply()

	push(imaginaryunit)
	negate()
	push(p1)
	multiply()
	exponential()
	push_rational(1, 2)
	multiply()

	add()

	restore()


