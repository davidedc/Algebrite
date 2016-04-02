###
 Argument (angle) of complex z

	z		arg(z)
	-		------

	a		0

	-a		-pi			See note 3 below

	(-1)^a		a pi

	exp(a + i b)	b

	a b		arg(a) + arg(b)

	a + i b		arctan(b/a)

Result by quadrant

	z		arg(z)
	-		------

	1 + i		1/4 pi

	1 - i		-1/4 pi

	-1 + i		3/4 pi

	-1 - i		-3/4 pi

Notes

	1. Handles mixed polar and rectangular forms, e.g. 1 + exp(i pi/3)

	2. Symbols in z are assumed to be positive and real.

	3. Negative direction adds -pi to angle.

	   Example: z = (-1)^(1/3), mag(z) = 1/3 pi, mag(-z) = -2/3 pi

	4. jean-francois.debroux reports that when z=(a+i*b)/(c+i*d) then

		arg(numerator(z)) - arg(denominator(z))

	   must be used to get the correct answer. Now the operation is
	   automatic.
###

#include "stdafx.h"
#include "defs.h"

Eval_arg = ->
	push(cadr(p1));
	Eval();
	arg();

arg = ->
	save();
	p1 = pop();
	push(p1);
	numerator();
	yyarg();
	push(p1);
	denominator();
	yyarg();
	subtract();
	restore();

#define RE p2
#define IM p3

yyarg = ->
	save();
	p1 = pop();
	if (isnegativenumber(p1))
		push(symbol(PI));
		negate();
	else if (car(p1) == symbol(POWER) && equaln(cadr(p1), -1))
		# -1 to a power
		push(symbol(PI));
		push(caddr(p1));
		multiply();
	else if (car(p1) == symbol(POWER) && cadr(p1) == symbol(E))
		# exponential
		push(caddr(p1));
		imag();
	else if (car(p1) == symbol(MULTIPLY))
		# product of factors
		push_integer(0);
		p1 = cdr(p1);
		while (iscons(p1))
			push(car(p1));
			arg();
			add();
			p1 = cdr(p1);
	else if (car(p1) == symbol(ADD))
		# sum of terms
		push(p1);
		rect();
		p1 = pop();
		push(p1);
		real();
		RE = pop();
		push(p1);
		imag();
		IM = pop();
		if (iszero(RE))
			push(symbol(PI));
			if (isnegative(IM))
				negate();
		else
			push(IM);
			push(RE);
			divide();
			arctan();
			if (isnegative(RE))
				push_symbol(PI);
				if (isnegative(IM))
					subtract();	# quadrant 1 -> 3
				else
					add();		# quadrant 4 -> 2
	else
		# pure real
		push_integer(0);
	restore();

#if SELFTEST

s = [

	"arg(1+i)",
	"1/4*pi",

	"arg(1-i)",
	"-1/4*pi",

	"arg(-1+i)",
	"3/4*pi",

	"arg(-1-i)",
	"-3/4*pi",

	"arg((-1)^(1/3))",
	"1/3*pi",

	"arg(1+exp(i*pi/3))",
	"1/6*pi",

	"arg((-1)^(1/6)*exp(i*pi/6))",
	"1/3*pi",

	"arg(a)",
	"0",

	"arg(a*exp(b+i*pi/5))",
	"1/5*pi",

	"arg(-1)",
	"-pi",

	"arg(a)",
	"0",

	"arg(-a)",
	"-pi",

	"arg(-(-1)^(1/3))",
	"-2/3*pi",

	"arg(-exp(i*pi/3))",
	"-2/3*pi",

	"arg(-i)",
	"-1/2*pi",

	"arg((a+b*i)/(c+d*i))",
	"arctan(b/a)-arctan(d/c)",
]

###
void
test_arg(void)
{
	test(__FILE__, s, sizeof s / sizeof (char *));
}

#endif
###