#include "stdafx.h"

#include "defs.h"

Eval_mod = ->
	push(cadr(p1));
	Eval();
	push(caddr(p1));
	Eval();
	mod();

mod = ->
	n = 0

	save();

	p2 = pop();
	p1 = pop();

	if (iszero(p2))
		stop("mod function: divide by zero");

	if (!isnum(p1) || !isnum(p2))
		push_symbol(MOD);
		push(p1);
		push(p2);
		list(3);
		restore();
		return;

	if (isdouble(p1))
		push(p1);
		n = pop_integer();
		if (n == 0x80000000)
			stop("mod function: cannot convert float value to integer");
		push_integer(n);
		p1 = pop();

	if (isdouble(p2))
		push(p2);
		n = pop_integer();
		if (n == 0x80000000)
			stop("mod function: cannot convert float value to integer");
		push_integer(n);
		p2 = pop();

	if (!isinteger(p1) || !isinteger(p2))
		stop("mod function: integer arguments expected");

	p3 = new U();
	p3.k = NUM;
	p3.q.a = mmod(p1.q.a, p2.q.a);
	p3.q.b = mint(1);
	push(p3);

	restore();

test_mod = ->
	run_test = [
		"mod(2.0,3.0)",
		"2",

		"mod(-2.0,3.0)",
		"-2",

		"mod(2.0,-3.0)",
		"2",

		"mod(-2.0,-3.0)",
		"-2",

		"mod(2,3)",
		"2",

		"mod(-2,3)",
		"-2",

		"mod(2,-3)",
		"2",

		"mod(-2,-3)",
		"-2",

		"mod(a,b)",
		"mod(a,b)",

		"mod(2.0,0.0)",
		"Stop: mod function: divide by zero",

		"mod(2,0)",
		"Stop: mod function: divide by zero",

		"mod(1.2,2)",
		"Stop: mod function: cannot convert float value to integer",

		"mod(1/2,3)",
		"Stop: mod function: integer arguments expected",

		"mod(15,8.0)",
		"7",
	]