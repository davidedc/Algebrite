###
 Returns the coefficient of the imaginary part of complex z

	z		imag(z)
	-		-------

	a + i b		b

	exp(i a)	sin(a)
###



Eval_imag = ->
	push(cadr(p1))
	Eval()
	imag()

imag = ->
	save()
	rect()
	p1 = pop()
	push(p1)
	push(p1)
	conjugate()
	subtract()
	push_integer(2)
	divide()
	push(imaginaryunit)
	divide()
	restore()

