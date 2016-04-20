###
 Returns the real part of complex z

	z		real(z)
	-		-------

	a + i b		a

	exp(i a)	cos(a)
###



Eval_real = ->
	push(cadr(p1))
	Eval()
	real()

real = ->
	save()
	rect()
	p1 = pop()
	push(p1)
	push(p1)
	conjugate()
	add()
	push_integer(2)
	divide()
	restore()

