###
Convert complex z to polar form

	Input:		push	z

	Output:		Result on stack

	polar(z) = mag(z) * exp(i * arg(z))
###

#include "stdafx.h"
#include "defs.h"

Eval_polar = ->
	push(cadr(p1));
	Eval();
	polar();

polar = ->
	save();
	p1 = pop();
	push(p1);
	mag();
	push(imaginaryunit);
	push(p1);
	arg();
	multiply();
	exponential();
	multiply();
	restore();


test_polar = ->
	run_test [
		"polar(1+i)",
		"2^(1/2)*exp(1/4*i*pi)",

		"polar(-1+i)",
		"2^(1/2)*exp(3/4*i*pi)",

		"polar(-1-i)",
		"2^(1/2)*exp(-3/4*i*pi)",

		"polar(1-i)",
		"2^(1/2)*exp(-1/4*i*pi)",

		"rect(polar(3+4*i))",
		"3+4*i",

		"rect(polar(-3+4*i))",
		"-3+4*i",

		"rect(polar(3-4*i))",
		"3-4*i",

		"rect(polar(-3-4*i))",
		"-3-4*i",
	]