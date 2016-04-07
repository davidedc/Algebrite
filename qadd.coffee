#	Add rational numbers
#
#	Input:		tos-2		addend
#
#			tos-1		addend
#
#	Output:		sum on stack



qadd = ->
	# a, ab, b, ba, c are all bigNum

	save()

	p2 = pop()
	p1 = pop()

	ab = mmul(p1.q.a, p2.q.b)
	ba = mmul(p1.q.b, p2.q.a)

	a = madd(ab, ba)

	#mfree(ab)
	#mfree(ba)

	# zero?

	if (MZERO(a))
		#mfree(a)
		push(zero)
		restore()
		return

	b = mmul(p1.q.b, p2.q.b)

	c = mgcd(a, b)

	c = makeSignSameAs(c,b)

	p1 = new U()

	p1.k = NUM

	p1.q.a = mdiv(a, c)
	p1.q.b = mdiv(b, c)

	#mfree(a)
	#mfree(b)
	#mfree(c)

	push(p1)

	restore()
