# Condense an expression by factoring common terms.
                                                                                


Eval_condense = ->
	push(cadr(p1))
	Eval()
	Condense()

Condense = ->
	tmp = 0
	tmp = expanding
	save()
	yycondense()
	restore()
	expanding = tmp

yycondense = ->
	expanding = 0

	p1 = pop()

	if (car(p1) != symbol(ADD))
		push(p1)
		return

	# get gcd of all terms

	p3 = cdr(p1)
	push(car(p3))
	p3 = cdr(p3)
	while (iscons(p3))
		push(car(p3))
		gcd()
		p3 = cdr(p3)

	#printf("condense: this is the gcd of all the terms:\n")
	#print(stdout, stack[tos - 1])

	# divide each term by gcd

	inverse()
	p2 = pop()
	push(zero)
	p3 = cdr(p1)
	while (iscons(p3))
		push(p2)
		push(car(p3))
		multiply()
		add()
		p3 = cdr(p3)

	# We multiplied above w/o expanding so sum factors cancelled.

	# Now we expand which which normalizes the result and, in some cases,
	# simplifies it too (see test case H).

	yyexpand()

	# multiply result by gcd

	push(p2)
	divide()


test_condense = ->
	run_test [

		"condense(a/(a+b)+b/(a+b))",
		"1",

		"psi(n) = exp(-r/n) laguerre(2r/n,n-1,1)",
		"",

		"psi(3)",
		"3*exp(-1/3*r)-2*r*exp(-1/3*r)+2/9*r^2*exp(-1/3*r)",

		"condense(last)",
		"exp(-1/3*r)*(3-2*r+2/9*r^2)",

		"psi()=psi",
		"",

		# test case H

		"condense(-3 exp(-1/3 r + i phi) cos(theta) - 6 exp(-1/3 r + i phi) cos(theta) sin(theta)^2 + 12 exp(-1/3 r + i phi) cos(theta)^3)",
		"3*exp(-1/3*r+i*phi)*(-1+4*cos(theta)^2-2*sin(theta)^2)*cos(theta)",
	]