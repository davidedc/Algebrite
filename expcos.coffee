# Do the exponential cosine function.

#include "stdafx.h"
#include "defs.h"

Eval_expcos = ->
	push(cadr(p1));
	Eval();
	expcos();

expcos = ->
	save();

	p1 = pop();

	push(imaginaryunit);
	push(p1);
	multiply();
	exponential();
	push_rational(1, 2);
	multiply();

	push(imaginaryunit);
	negate();
	push(p1);
	multiply();
	exponential();
	push_rational(1, 2);
	multiply();

	add();

	restore();


test_expcos = ->
	run_test [

		"expcos(x)",
		"1/2*exp(-i*x)+1/2*exp(i*x)",
	]
