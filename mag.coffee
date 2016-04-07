###
 Magnitude of complex z

	z		mag(z)
	-		------

	a		a

	-a		a

	(-1)^a		1

	exp(a + i b)	exp(a)

	a b		mag(a) mag(b)

	a + i b		sqrt(a^2 + b^2)

Notes

	1. Handles mixed polar and rectangular forms, e.g. 1 + exp(i pi/3)

	2. jean-francois.debroux reports that when z=(a+i*b)/(c+i*d) then

		mag(numerator(z)) / mag(denominator(z))

	   must be used to get the correct answer. Now the operation is
	   automatic.
###



Eval_mag = ->
	push(cadr(p1))
	Eval()
	mag()

mag = ->
	save()
	p1 = pop()
	push(p1)
	numerator()
	yymag()
	push(p1)
	denominator()
	yymag()
	divide()
	restore()

yymag = ->
	save()
	p1 = pop()
	if (isnegativenumber(p1))
		push(p1)
		negate()
	else if (car(p1) == symbol(POWER) && equaln(cadr(p1), -1))
		# -1 to a power
		push_integer(1)
	else if (car(p1) == symbol(POWER) && cadr(p1) == symbol(E))
		# exponential
		push(caddr(p1))
		real()
		exponential()
	else if (car(p1) == symbol(MULTIPLY))
		# product
		push_integer(1)
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			mag()
			multiply()
			p1 = cdr(p1)
	else if (car(p1) == symbol(ADD))
		# sum
		push(p1)
		rect(); # convert polar terms, if any
		p1 = pop()
		push(p1)
		real()
		push_integer(2)
		power()
		push(p1)
		imag()
		push_integer(2)
		power()
		add()
		push_rational(1, 2)
		power()
		simplify_trig()
	else
		# default (all real)
		push(p1)
	restore()


test_mag = ->
	run_test [

		"mag(a+i*b)",
		"(a^2+b^2)^(1/2)",

		"mag(exp(a+i*b))",
		"exp(a)",

		"mag(1)",
		"1",

		"mag(-1)",
		"1",

		"mag(1+exp(i*pi/3))",
		"3^(1/2)",

		"mag((a+i*b)/(c+i*d))",
		"(a^2+b^2)^(1/2)/((c^2+d^2)^(1/2))",

		"mag(exp(i theta))",
		"1",

		"mag(exp(-i theta))",
		"1",

		"mag((-1)^theta)",
		"1",

		"mag((-1)^(-theta))",
		"1",

		"mag(3*(-1)^theta)",
		"3",

		"mag(3*(-1)^(-theta))",
		"3",

		"mag(-3*(-1)^theta)",
		"3",

		"mag(-3*(-1)^(-theta))",
		"3",
	]