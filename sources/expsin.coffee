# Do the exponential sine function.



Eval_expsin = ->
	push(cadr(p1))
	Eval()
	expsin()

expsin = ->
	save()

	p1 = pop()

	push(imaginaryunit)
	push(p1)
	multiply()
	exponential()
	push(imaginaryunit)
	divide()
	push_rational(1, 2)
	multiply()

	push(imaginaryunit)
	negate()
	push(p1)
	multiply()
	exponential()
	push(imaginaryunit)
	divide()
	push_rational(1, 2)
	multiply()

	subtract()

	restore()


