

Eval_arcsin = ->
	push(cadr(p1))
	Eval()
	arcsin()

arcsin = ->
	n = 0
	d = 0

	save()

	p1 = pop()

	if (car(p1) == symbol(SIN))
		push(cadr(p1))
		restore()
		return

	if (isdouble(p1))
		errno = 0
		d = Math.asin(p1.d)
		if (errno)
			stop("arcsin function argument is not in the interval [-1,1]")
		push_double(d)
		restore()
		return

	# if p1 == 1/sqrt(2) then return 1/4*pi (45 degrees)

	if (isoneoversqrttwo(p1))
		push_rational(1, 4)
		push_symbol(PI)
		multiply()
		restore()
		return

	# if p1 == -1/sqrt(2) then return -1/4*pi (-45 degrees)

	if (isminusoneoversqrttwo(p1))
		push_rational(-1, 4)
		push_symbol(PI)
		multiply()
		restore()
		return

	if (!isrational(p1))
		push_symbol(ARCSIN)
		push(p1)
		list(2)
		restore()
		return

	push(p1)
	push_integer(2)
	multiply()
	n = pop_integer()

	switch (n)

		when -2
			push_rational(-1, 2)
			push_symbol(PI)
			multiply()

		when -1
			push_rational(-1, 6)
			push_symbol(PI)
			multiply()

		when 0
			push(zero)

		when 1
			push_rational(1, 6)
			push_symbol(PI)
			multiply()

		when 2
			push_rational(1, 2)
			push_symbol(PI)
			multiply()

		else
			push_symbol(ARCSIN)
			push(p1)
			list(2)

	restore()



