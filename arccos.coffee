#include "stdafx.h"
#include "defs.h"

Eval_arccos = ->
	push(cadr(p1));
	Eval();
	arccos();

arccos = ->
	n = 0
	d = 0.0

	save();

	p1 = pop();

	if (car(p1) == symbol(COS))
		push(cadr(p1));
		restore();
		return;

	if (isdouble(p1))
		errno = 0;
		d = acos(p1.d);
		if (errno)
			stop("arccos function argument is not in the interval [-1,1]");
		push_double(d);
		restore();
		return;

	# if p1 == 1/sqrt(2) then return 1/4*pi (45 degrees)

	if (isoneoversqrttwo(p1))
		push_rational(1, 4);
		push_symbol(PI);
		multiply();
		restore();
		return;

	# if p1 == -1/sqrt(2) then return 3/4*pi (135 degrees)

	if (isminusoneoversqrttwo(p1))
		push_rational(3, 4);
		push_symbol(PI);
		multiply();
		restore();
		return;

	if (!isrational(p1))
		push_symbol(ARCCOS);
		push(p1);
		list(2);
		restore();
		return;

	push(p1);
	push_integer(2);
	multiply();
	n = pop_integer();

	switch (n)

		when -2
			push_symbol(PI);

		when -1
			push_rational(2, 3);
			push_symbol(PI);
			multiply();

		when 0
			push_rational(1, 2);
			push_symbol(PI);
			multiply();

		when 1
			push_rational(1, 3);
			push_symbol(PI);
			multiply();

		when 2
			push(zero);

		else
			push_symbol(ARCCOS);
			push(p1);
			list(2);

	restore();


test_arccos = ->
	run_test [

		"arccos(1)",
		"0",

		"arccos(1/2)",
		"1/3*pi",

		"arccos(0)",
		"1/2*pi",

		"arccos(-1/2)",
		"2/3*pi",

		"arccos(-1)",
		"pi",

		"arccos(cos(0))",
		"0",

		"arccos(cos(1/3*pi))",
		"1/3*pi",

		"arccos(cos(1/2*pi))",
		"1/2*pi",

		"arccos(cos(2/3*pi))",
		"2/3*pi",

		"arccos(cos(pi))",
		"pi",

		"arccos(cos(x))",
		"x",

		"arccos(1/sqrt(2))",
		"1/4*pi",

		"arccos(-1/sqrt(2))",
		"3/4*pi",

		"arccos(cos(1/4*pi))",
		"1/4*pi",

		"arccos(cos(3/4*pi))",
		"3/4*pi",
	]