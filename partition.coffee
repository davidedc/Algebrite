###
 Partition a term

	Input stack:

		term (factor or product of factors)

		free variable

	Output stack:

		constant expression

		variable expression
###



partition = ->
	save()

	p2 = pop()
	p1 = pop()

	push_integer(1)

	p3 = pop()
	p4 = p3

	p1 = cdr(p1)

	while (iscons(p1))
		if (Find(car(p1), p2))
			push(p4)
			push(car(p1))
			multiply()
			p4 = pop()
		else
			push(p3)
			push(car(p1))
			multiply()
			p3 = pop()
		p1 = cdr(p1)

	push(p3)
	push(p4)

	restore()
