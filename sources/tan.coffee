# Tangent function of numerical and symbolic arguments



Eval_tan = ->
	push(cadr(p1))
	Eval()
	tangent()

tangent = ->
	save()
	yytangent()
	restore()

yytangent = ->
	n = 0
	d = 0.0

	p1 = pop()

	if (car(p1) == symbol(ARCTAN))
		push(cadr(p1))
		return

	if (isdouble(p1))
		d = Math.tan(p1.d)
		if (Math.abs(d) < 1e-10)
			d = 0.0
		push_double(d)
		return

	# tan function is antisymmetric, tan(-x) = -tan(x)

	if (isnegative(p1))
		push(p1)
		negate()
		tangent()
		negate()
		return

	# multiply by 180/pi

	push(p1)
	push_integer(180)
	multiply()
	if evaluatingAsFloats
		push_double(Math.PI)
	else
		push_symbol(PI)
	divide()

	n = pop_integer()

	if (n < 0 || n == 0x80000000)
		push(symbol(TAN))
		push(p1)
		list(2)
		return

	switch (n % 360)
		when 0, 180
			push_integer(0)
		when 30, 210
			push_rational(1, 3)
			push_integer(3)
			push_rational(1, 2)
			power()
			multiply()
		when 150, 330
			push_rational(-1, 3)
			push_integer(3)
			push_rational(1, 2)
			power()
			multiply()
		when 45, 225
			push_integer(1)
		when 135, 315
			push_integer(-1)
		when 60, 240
			push_integer(3)
			push_rational(1, 2)
			power()
		when 120, 300
			push_integer(3)
			push_rational(1, 2)
			power()
			negate()
		else
			push(symbol(TAN))
			push(p1)
			list(2)


