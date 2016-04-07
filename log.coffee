# natural logarithm



Eval_log = ->
	push(cadr(p1))
	Eval()
	logarithm()

logarithm = ->
	save()
	yylog()
	restore()

yylog = ->
	d = 0.0

	p1 = pop()

	if (p1 == symbol(E))
		push_integer(1)
		return

	if (equaln(p1, 1))
		push_integer(0)
		return

	if (isnegativenumber(p1))
		push(p1)
		negate()
		logarithm()
		push(imaginaryunit)
		push_symbol(PI)
		multiply()
		add()
		return

	if (isdouble(p1))
		d = Math.log(p1.d)
		push_double(d)
		return

	# rational number and not an integer?

	if (isfraction(p1))
		push(p1)
		numerator()
		logarithm()
		push(p1)
		denominator()
		logarithm()
		subtract()
		return

	# log(a ^ b) --> b log(a)

	if (car(p1) == symbol(POWER))
		push(caddr(p1))
		push(cadr(p1))
		logarithm()
		multiply()
		return

	# log(a * b) --> log(a) + log(b)

	if (car(p1) == symbol(MULTIPLY))
		push_integer(0)
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			logarithm()
			add()
			p1 = cdr(p1)
		return

	push_symbol(LOG)
	push(p1)
	list(2)

test_log = ->
	run_test [

		"log(1)",
		"0",

		"log(exp(1))",
		"1",

		"log(exp(x))",
		"x",

		"exp(log(x))",
		"x",

		"log(x^2)",
		"2*log(x)",

		"log(1/x)",
		"-log(x)",

		"log(a^b)",
		"b*log(a)",

		"log(2)",
		"log(2)",

		"log(2.0)",
		"0.693147",

		"float(log(2))",
		"0.693147",

		"log(a*b)",
		"log(a)+log(b)",

		"log(1/3)+log(3)",
		"0",

		"log(-1)",
		"i*pi",

		"log(-1.0)",
		"i*pi",
	]