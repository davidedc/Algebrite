###
 Returns the coefficient of the imaginary part of complex z

	z		imag(z)
	-		-------

	a + i b		b

	exp(i a)	sin(a)
###

DEBUG_IMAG = false

Eval_imag = ->
	push(cadr(p1))
	Eval()
	imag()

imag = ->
	save()
	rect()
	p1 = pop()

	if DEBUG_IMAG then console.log "IMAGE of " + p1

	push(p1)
	push(p1)
	conjugate()
	if DEBUG_IMAG then console.log " image: conjugate result: " + stack[tos-1]

	subtract()
	push_integer(2)
	divide()
	if DEBUG_IMAG then console.log " image: 1st divide result: " + stack[tos-1]
	push(imaginaryunit)
	divide()
	if DEBUG_IMAG then console.log " image: 2nd divide result: " + stack[tos-1]
	restore()

