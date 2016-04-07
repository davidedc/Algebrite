#	Divide rational numbers
#
#	Input:		tos-2		dividend
#
#			tos-1		divisor
#
#	Output:		quotient on stack



qdiv = ->
	save()

	p2 = pop()
	p1 = pop()

	# zero?

	if (MZERO(p2.q.a))
		stop("divide by zero")

	if (MZERO(p1.q.a))
		push(zero)
		restore()
		return

	aa = mmul(p1.q.a, p2.q.b)
	bb = mmul(p1.q.b, p2.q.a)

	c = mgcd(aa, bb)

	c = makeSignSameAs(c,bb)

	p1 = new U()

	p1.k = NUM

	p1.q.a = mdiv(aa, c)
	p1.q.b = mdiv(bb, c)


	push(p1)

	restore()
