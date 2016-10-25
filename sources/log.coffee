# Natural logarithm.
#
# Note that we use the mathematics / Javascript / Mathematica
# convention that "log" is indeed the natural logarithm.
#
# In engineering, biology, astronomy, "log" can stand instead
# for the "common" logarithm i.e. base 10. Also note that Google
# calculations use log for the common logarithm.


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
		if evaluatingAsFloats
			push_double(Math.PI)
		else
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

