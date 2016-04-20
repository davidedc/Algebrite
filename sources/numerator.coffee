

Eval_numerator = ->
	push(cadr(p1))
	Eval()
	numerator()

numerator = ->
	h = 0

	save()

	p1 = pop()

	if (car(p1) == symbol(ADD))
		push(p1)
		rationalize()
		p1 = pop()

	if (car(p1) == symbol(MULTIPLY))
		h = tos
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			numerator()
			p1 = cdr(p1)
		multiply_all(tos - h)
	else if (isrational(p1))
		push(p1)
		mp_numerator()
	else if (car(p1) == symbol(POWER) && isnegativeterm(caddr(p1)))
		push(one)
	else 
		push(p1)

	restore()

