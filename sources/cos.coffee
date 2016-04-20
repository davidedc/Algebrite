# Cosine function of numerical and symbolic arguments



Eval_cos = ->
	push(cadr(p1))
	Eval()
	cosine()

cosine = ->
	save()
	p1 = pop()
	if (car(p1) == symbol(ADD))
		cosine_of_angle_sum()
	else
		cosine_of_angle()
	restore()

# Use angle sum formula for special angles.

#define A p3
#define B p4

cosine_of_angle_sum = ->
	p2 = cdr(p1)
	while (iscons(p2))
		p4 = car(p2); # p4 is B
		if (isnpi(p4)) # p4 is B
			push(p1)
			push(p4); # p4 is B
			subtract()
			p3 = pop(); # p3 is A
			push(p3);  # p3 is A
			cosine()
			push(p4); # p4 is B
			cosine()
			multiply()
			push(p3); # p3 is A
			sine()
			push(p4); # p4 is B
			sine()
			multiply()
			subtract()
			return
		p2 = cdr(p2)
	cosine_of_angle()

cosine_of_angle = ->

	if (car(p1) == symbol(ARCCOS))
		push(cadr(p1))
		return

	if (isdouble(p1))
		d = Math.cos(p1.d)
		if (Math.abs(d) < 1e-10)
			d = 0.0
		push_double(d)
		return

	# cosine function is symmetric, cos(-x) = cos(x)

	if (isnegative(p1))
		push(p1)
		negate()
		p1 = pop()

	# cos(arctan(x)) = 1 / sqrt(1 + x^2)

	# see p. 173 of the CRC Handbook of Mathematical Sciences

	if (car(p1) == symbol(ARCTAN))
		push_integer(1)
		push(cadr(p1))
		push_integer(2)
		power()
		add()
		push_rational(-1, 2)
		power()
		return

	# multiply by 180/pi

	push(p1)
	push_integer(180)
	multiply()
	push_symbol(PI)
	divide()

	n = pop_integer()

	if (n < 0 || n == 0x80000000)
		push(symbol(COS))
		push(p1)
		list(2)
		return

	switch (n % 360)
		when 90, 270
			push_integer(0)
		when 60, 300
			push_rational(1, 2)
		when 120, 240
			push_rational(-1, 2)
		when 45, 315
			push_rational(1, 2)
			push_integer(2)
			push_rational(1, 2)
			power()
			multiply()
		when 135, 225
			push_rational(-1, 2)
			push_integer(2)
			push_rational(1, 2)
			power()
			multiply()
		when 30, 330
			push_rational(1, 2)
			push_integer(3)
			push_rational(1, 2)
			power()
			multiply()
		when 150, 210
			push_rational(-1, 2)
			push_integer(3)
			push_rational(1, 2)
			power()
			multiply()
		when 0
			push_integer(1)
		when 180
			push_integer(-1)
		else
			push(symbol(COS))
			push(p1)
			list(2)

