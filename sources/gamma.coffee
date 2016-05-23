#-----------------------------------------------------------------------------
#
#	Author : philippe.billet@noos.fr
#
#	Gamma function gamma(x)
#	
#-----------------------------------------------------------------------------




Eval_gamma = ->
	push(cadr(p1))
	Eval()
	gamma()

gamma = ->
	save()
	gammaf()
	restore()

gammaf = ->
	#	double d

	p1 = pop()

	if (isrational(p1) && MEQUAL(p1.q.a, 1) && MEQUAL(p1.q.b, 2))
		if evaluatingAsFloats
			push_double(Math.PI)
		else
			push_symbol(PI)
		push_rational(1,2)
		power()
		return

	if (isrational(p1) && MEQUAL(p1.q.a, 3) && MEQUAL(p1.q.b, 2))
		if evaluatingAsFloats
			push_double(Math.PI)
		else
			push_symbol(PI)
		push_rational(1,2)
		power()
		push_rational(1,2)
		multiply()
		return
	
	#	if (p1->k == DOUBLE) {
	#		d = exp(lgamma(p1.d))
	#		push_double(d)
	#		return
	#	}

	if (isnegativeterm(p1))
		if evaluatingAsFloats
			push_double(Math.PI)
		else
			push_symbol(PI)
		push_integer(-1)
		multiply()
		if evaluatingAsFloats
			push_double(Math.PI)
		else
			push_symbol(PI)
		push(p1)
		multiply()
		sine()
		push(p1)
		multiply()
		push(p1)
		negate()
		gamma()
		multiply()
		divide()
		return
	
	if (car(p1) == symbol(ADD))
		gamma_of_sum()
		return
	
		
	push_symbol(GAMMA)
	push(p1)
	list(2)
	return

gamma_of_sum = ->
	p3 = cdr(p1)
	if (isrational(car(p3)) && MEQUAL(car(p3).q.a, 1) && MEQUAL(car(p3).q.b, 1))
		push(cadr(p3))
		push(cadr(p3))
		gamma()
		multiply()
	else
		if (isrational(car(p3)) && MEQUAL(car(p3).q.a, -1) && MEQUAL(car(p3).q.b, 1))
			push(cadr(p3))
			gamma()
			push(cadr(p3))
			push_integer(-1)
			add()
			divide()
		else
			push_symbol(GAMMA)
			push(p1)
			list(2)
			return


