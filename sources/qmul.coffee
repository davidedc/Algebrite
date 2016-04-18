#	Multiply rational numbers
#
#	Input:		tos-2		multiplicand
#
#			tos-1		multiplier
#
#	Output:		product on stack



qmul = ->
	save()

	p2 = pop()
	p1 = pop()

	# zero?

	if (MZERO(p1.q.a) || MZERO(p2.q.a))
		push(zero)
		restore()
		return

	aa = mmul(p1.q.a, p2.q.a)
	bb = mmul(p1.q.b, p2.q.b)

	c = mgcd(aa, bb)

	c = makeSignSameAs(c,bb)

	p1 = new U()

	p1.k = NUM

	p1.q.a = mdiv(aa, c)
	p1.q.b = mdiv(bb, c)

	#mfree(aa)
	#mfree(bb)

	push(p1)

	restore()
