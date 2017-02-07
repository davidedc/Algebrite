# Sine function of numerical and symbolic arguments



Eval_sin = ->
	#console.log "sin ---- "
	push(cadr(p1))
	Eval()
	sine()
	#console.log "sin end ---- "

sine = ->
	#console.log "sine ---- "
	save()
	p1 = pop()
	if (car(p1) == symbol(ADD))
		# sin of a sum can be further decomposed into
		#sin(alpha+beta) = sin(alpha)*cos(beta)+sin(beta)*cos(alpha)
		sine_of_angle_sum()
	else
		sine_of_angle()
	restore()
	#console.log "sine end ---- "

# Use angle sum formula for special angles.

#define A p3
#define B p4

# decompose sum sin(alpha+beta) into
# sin(alpha)*cos(beta)+sin(beta)*cos(alpha)
sine_of_angle_sum = ->
	#console.log "sin of angle sum ---- "
	p2 = cdr(p1)
	while (iscons(p2))
		p4 = car(p2); # p4 is B
		if (isnpi(p4)) # p4 is B
			push(p1)
			push(p4); # p4 is B
			subtract()
			p3 = pop(); # p3 is A
			push(p3); # p3 is A
			sine()
			push(p4); # p4 is B
			cosine()
			multiply()
			push(p3); # p3 is A
			cosine()
			push(p4); # p4 is B
			sine()
			multiply()
			add()
			#console.log "sin of angle sum end ---- "
			return
		p2 = cdr(p2)
	sine_of_angle()
	#console.log "sin of angle sum end ---- "

sine_of_angle = ->

	if (car(p1) == symbol(ARCSIN))
		push(cadr(p1))
		return

	if isdouble(p1)
		d = Math.sin(p1.d)
		if (Math.abs(d) < 1e-10)
			d = 0.0
		push_double(d)
		return

	# sine function is antisymmetric, sin(-x) = -sin(x)

	if (isnegative(p1))
		push(p1)
		negate()
		sine()
		negate()
		return

	# sin(arctan(x)) = x / sqrt(1 + x^2)

	# see p. 173 of the CRC Handbook of Mathematical Sciences

	if (car(p1) == symbol(ARCTAN))
		push(cadr(p1))
		push_integer(1)
		push(cadr(p1))
		push_integer(2)
		power()
		add()
		push_rational(-1, 2)
		power()
		multiply()
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
		push(symbol(SIN))
		push(p1)
		list(2)
		return

	# values of some famous angles. Many more here:
	# https://en.wikipedia.org/wiki/Trigonometric_constants_expressed_in_real_radicals

	switch (n % 360)
		when 0, 180
			push_integer(0)
		when 30, 150
			push_rational(1, 2)
		when 210, 330
			push_rational(-1, 2)
		when 45, 135
			push_rational(1, 2)
			push_integer(2)
			push_rational(1, 2)
			power()
			multiply()
		when 225, 315
			push_rational(-1, 2)
			push_integer(2)
			push_rational(1, 2)
			power()
			multiply()
		when 60, 120
			push_rational(1, 2)
			push_integer(3)
			push_rational(1, 2)
			power()
			multiply()
		when 240, 300
			push_rational(-1, 2)
			push_integer(3)
			push_rational(1, 2)
			power()
			multiply()
		when 90
			push_integer(1)
		when 270
			push_integer(-1)
		else
			push(symbol(SIN))
			push(p1)
			list(2)


