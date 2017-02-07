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

	# multiply by 180/pi to go from radians to degrees.
	# we go from radians to degrees because it's much
	# easier to calculate symbolic results of most (not all) "classic"
	# angles (e.g. 30,45,60...) if we calculate the degrees
	# and the we do a switch on that.
	# Alternatively, we could look at the fraction of pi
	# (e.g. 60 degrees is 1/3 pi) but that's more
	# convoluted as we'd need to look at both numerator and
	# denominator.

	push(p1)
	push_integer(180)
	multiply()
	if evaluatingAsFloats
		push_double(Math.PI)
	else
		push_symbol(PI)
	divide()

	n = pop_integer()

	# most "good" (i.e. compact) trigonometric results
	# happen for a round number of degrees. There are some exceptions
	# though, e.g. 22.5 degrees, which we don't capture here.
	if (n < 0 || isNaN(n))
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


