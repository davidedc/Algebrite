### arccos =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse cosine of x.

###


Eval_arccos = ->
	push(cadr(p1))
	Eval()
	arccos()

arccos = ->
	n = 0
	d = 0.0

	save()

	p1 = pop()

	if (car(p1) == symbol(COS))
		push(cadr(p1))
		restore()
		return

	if (isdouble(p1))
		errno = 0
		d = Math.acos(p1.d)
		if (errno)
			stop("arccos function argument is not in the interval [-1,1]")
		push_double(d)
		restore()
		return

	# if p1 == 1/sqrt(2) then return 1/4*pi (45 degrees)
	# second if catches the other way of saying it, sqrt(2)/2

	if (isoneoversqrttwo(p1)) or
	(car(p1) == symbol(MULTIPLY) && equalq(car(cdr(p1)), 1,2) and car(car(cdr(cdr(p1)))) == symbol(POWER) && equaln(car(cdr(car(cdr(cdr(p1))))),2) && equalq(car(cdr(cdr(car(cdr(cdr(p1)))))), 1, 2))
		if evaluatingAsFloats
			push_double(Math.PI / 4.0)
		else
			push_rational(1, 4)
			push_symbol(PI)
			multiply()
		restore()
		return

	# if p1 == -1/sqrt(2) then return 3/4*pi (135 degrees)
	# second if catches the other way of saying it, -sqrt(2)/2

	if (isminusoneoversqrttwo(p1)) or
	(car(p1) == symbol(MULTIPLY) && equalq(car(cdr(p1)), -1,2) and car(car(cdr(cdr(p1)))) == symbol(POWER) && equaln(car(cdr(car(cdr(cdr(p1))))),2) && equalq(car(cdr(cdr(car(cdr(cdr(p1)))))), 1, 2))
		if evaluatingAsFloats
			push_double(Math.PI * 3.0 / 4.0)
		else
			push_rational(3, 4)
			push_symbol(PI)
			multiply()
		restore()
		return

	if (!isrational(p1))
		push_symbol(ARCCOS)
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
			if evaluatingAsFloats
				push_double(Math.PI)
			else
				push_symbol(PI)

		when -1
			if evaluatingAsFloats
				push_double(Math.PI * 2.0 / 3.0)
			else
				push_rational(2, 3)
				push_symbol(PI)
				multiply()

		when 0
			if evaluatingAsFloats
				push_double(Math.PI / 2.0)
			else
				push_rational(1, 2)
				push_symbol(PI)
				multiply()

		when 1
			if evaluatingAsFloats
				push_double(Math.PI / 3.0)
			else
				push_rational(1, 3)
				push_symbol(PI)
				multiply()

		when 2
			if evaluatingAsFloats
				push_double(0.0)
			else
				push(zero)

		else
			push_symbol(ARCCOS)
			push(p1)
			list(2)

	restore()


