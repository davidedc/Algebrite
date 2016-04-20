# power function for double precision floating point



dpow = ->
	a = 0.0
	b = 0.0
	base = 0.0
	expo = 0.0
	result = 0.0
	theta = 0.0

	expo = pop_double()
	base = pop_double()

	# divide by zero?

	if (base == 0.0 && expo < 0.0)
		stop("divide by zero")

	# nonnegative base or integer power?

	if (base >= 0.0 || (expo % 1.0) == 0.0)
		result = Math.pow(base, expo)
		push_double(result)
		return

	result = Math.pow(Math.abs(base), expo)

	theta = Math.PI * expo

	# this ensures the real part is 0.0 instead of a tiny fraction

	if ((expo % 0.5) == 0.0)
		a = 0.0
		b = Math.sin(theta)
	else
		a = Math.cos(theta)
		b = Math.sin(theta)

	push_double(a * result)
	push_double(b * result)
	push(imaginaryunit)
	multiply()
	add()
