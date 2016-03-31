# Absolute value, aka vector magnitude

#include "stdafx.h"
#include "defs.h"

eval_abs = ->
	push(cadr(p1));
	eval();
	absval();

absval = ->
	h = 0
	save();
	p1 = pop();

	if (istensor(p1))
		absval_tensor();
		restore();
		return;

	if (isnum(p1))
		push(p1);
		if (isnegativenumber(p1))
			negate();
		restore();
		return;

	if (iscomplexnumber(p1))
		push(p1);
		push(p1);
		conjugate();
		multiply();
		push_rational(1, 2);
		power();
		restore();
		return;

	# abs(1/a) evaluates to 1/abs(a)

	if (car(p1) == symbol(POWER) && isnegativeterm(caddr(p1)))
		push(p1);
		reciprocate();
		absval();
		reciprocate();
		restore();
		return;

	# abs(a*b) evaluates to abs(a)*abs(b)

	if (car(p1) == symbol(MULTIPLY))
		h = tos;
		p1 = cdr(p1);
		while (iscons(p1))
			push(car(p1));
			absval();
			p1 = cdr(p1);
		multiply_all(tos - h);
		restore();
		return;

	if (isnegativeterm(p1) || (car(p1) == symbol(ADD) && isnegativeterm(cadr(p1))))
		push(p1);
		negate();
		p1 = pop();

	push_symbol(ABS);
	push(p1);
	list(2);

	restore();

absval_tensor = ->
	if (p1.tensor.ndim != 1)
		stop("abs(tensor) with tensor rank > 1");
	push(p1);
	push(p1);
	conjugate();
	inner();
	push_rational(1, 2);
	power();
	simplify();
	eval();

#if SELFTEST

s = [

	"abs(2)",
	"2",

	"abs(2.0)",
	"2",

	"abs(-2)",
	"2",

	"abs(-2.0)",
	"2",

	"abs(a)",
	"abs(a)",

	"abs(-a)",
	"abs(a)",

	"abs(2*a)",
	"2*abs(a)",

	"abs(-2*a)",
	"2*abs(a)",

	"abs(2.0*a)",
	"2*abs(a)",

	"abs(-2.0*a)",
	"2*abs(a)",

	"abs(a-b)+abs(b-a)",
	"2*abs(a-b)",

	"abs(3 + 4 i)",
	"5",

	"abs((2,3,4))",
	"29^(1/2)",

	"abs(a*b)",
	"abs(a)*abs(b)",

	"abs(a/b)",
	"abs(a)/abs(b)",

	"abs(1/a^b)",
	"1/(abs(a^b))",

	# Check that vector length is simplified

	"P=(u*cos(v),u*sin(v),v)",
	"",

	"abs(cross(d(P,u),d(P,v)))",
	"(1+u^2)^(1/2)",
]

###
void
test_abs(void)
{
	test(__FILE__, s, sizeof s / sizeof (char *));
}

#endif
###