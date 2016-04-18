###
 Argument (angle) of complex z

	z		arg(z)
	-		------

	a		0

	-a		-pi			See note 3 below

	(-1)^a		a pi

	exp(a + i b)	b

	a b		arg(a) + arg(b)

	a + i b		arctan(b/a)

Result by quadrant

	z		arg(z)
	-		------

	1 + i		1/4 pi

	1 - i		-1/4 pi

	-1 + i		3/4 pi

	-1 - i		-3/4 pi

Notes

	1. Handles mixed polar and rectangular forms, e.g. 1 + exp(i pi/3)

	2. Symbols in z are assumed to be positive and real.

	3. Negative direction adds -pi to angle.

	   Example: z = (-1)^(1/3), mag(z) = 1/3 pi, mag(-z) = -2/3 pi

	4. jean-francois.debroux reports that when z=(a+i*b)/(c+i*d) then

		arg(numerator(z)) - arg(denominator(z))

	   must be used to get the correct answer. Now the operation is
	   automatic.
###



Eval_arg = ->
	push(cadr(p1))
	Eval()
	arg()

arg = ->
	save()
	p1 = pop()
	push(p1)
	numerator()
	yyarg()
	push(p1)
	denominator()
	yyarg()
	subtract()
	restore()

#define RE p2
#define IM p3

yyarg = ->
	save()
	p1 = pop()
	if (isnegativenumber(p1))
		push(symbol(PI))
		negate()
	else if (car(p1) == symbol(POWER) && equaln(cadr(p1), -1))
		# -1 to a power
		push(symbol(PI))
		push(caddr(p1))
		multiply()
	else if (car(p1) == symbol(POWER) && cadr(p1) == symbol(E))
		# exponential
		push(caddr(p1))
		imag()
	else if (car(p1) == symbol(MULTIPLY))
		# product of factors
		push_integer(0)
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			arg()
			add()
			p1 = cdr(p1)
	else if (car(p1) == symbol(ADD))
		# sum of terms
		push(p1)
		rect()
		p1 = pop()
		push(p1)
		real()
		p2 = pop()
		push(p1)
		imag()
		p3 = pop()
		if (iszero(p2))
			push(symbol(PI))
			if (isnegative(p3))
				negate()
		else
			push(p3)
			push(p2)
			divide()
			arctan()
			if (isnegative(p2))
				push_symbol(PI)
				if (isnegative(p3))
					subtract();	# quadrant 1 -> 3
				else
					add();		# quadrant 4 -> 2
	else
		# pure real
		push_integer(0)
	restore()


