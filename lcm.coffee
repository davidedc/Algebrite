# Find the least common multiple of two expressions.

#include "stdafx.h"
#include "defs.h"

Eval_lcm = ->
	p1 = cdr(p1);
	push(car(p1));
	Eval();
	p1 = cdr(p1);
	while (iscons(p1))
		push(car(p1));
		Eval();
		lcm();
		p1 = cdr(p1);

lcm = ->
	x = 0
	x = expanding;
	save();
	yylcm();
	restore();
	expanding = x;

yylcm = ->
	expanding = 1;

	p2 = pop();
	p1 = pop();

	push(p1);
	push(p2);
	gcd();

	push(p1);
	divide();

	push(p2);
	divide();

	inverse();

test_lcm = ->
	run_test [

		"lcm(4,6)",
		"12",

		"lcm(4*x,6*x*y)",
		"12*x*y",

		# multiple arguments

		"lcm(2,3,4)",
		"12",
	]