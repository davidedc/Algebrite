#include "stdafx.h"
#include "defs.h"


#define POLY p1
#define X p2
#define A p3
#define B p4
#define C p5
#define Y p6

Eval_roots = ->
	# A == B -> A - B

	p2 = cadr(p1);

	if (car(p2) == symbol(SETQ) || car(p2) == symbol(TESTEQ))
		push(cadr(p2));
		Eval();
		push(caddr(p2));
		Eval();
		subtract();
	else
		push(p2);
		Eval();
		p2 = pop();
		if (car(p2) == symbol(SETQ) || car(p2) == symbol(TESTEQ))
			push(cadr(p2));
			Eval();
			push(caddr(p2));
			Eval();
			subtract();
		else
			push(p2);

	# 2nd arg, x

	push(caddr(p1));
	Eval();
	p2 = pop();
	if (p2 == symbol(NIL))
		guess();
	else
		push(p2);

	p2 = pop();
	p1 = pop();

	if (!ispoly(p1, p2))
		stop("roots: 1st argument is not a polynomial");

	push(p1);
	push(p2);

	roots();

roots = ->
	h = 0
	i = 0
	n = 0
	h = tos - 2;
	roots2();
	n = tos - h;
	if (n == 0)
		stop("roots: the polynomial is not factorable, try nroots");
	if (n == 1)
		return;
	sort_stack(n);
	save();
	p1 = alloc_tensor(n);
	p1.tensor.ndim = 1;
	p1.tensor.dim[0] = n;
	for i in [0...n]
		p1.tensor.elem[i] = stack[h + i];
	tos = h;
	push(p1);
	restore();

roots2 = ->
	save();

	p2 = pop();
	p1 = pop();

	push(p1);
	push(p2);
	factorpoly();

	p1 = pop();

	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1);
		while (iscons(p1))
			push(car(p1));
			push(p2);
			roots3();
			p1 = cdr(p1);
	else
		push(p1);
		push(p2);
		roots3();

	restore();

roots3 = ->
	save();
	p2 = pop();
	p1 = pop();
	if (car(p1) == symbol(POWER) && ispoly(cadr(p1), p2) && isposint(caddr(p1)))
		push(cadr(p1));
		push(p2);
		mini_solve();
	else if (ispoly(p1, p2))
		push(p1);
		push(p2);
		mini_solve();
	restore();

#-----------------------------------------------------------------------------
#
#	Input:		stack[tos - 2]		polynomial
#
#			stack[tos - 1]		dependent symbol
#
#	Output:		stack			roots on stack
#
#						(input args are popped first)
#
#-----------------------------------------------------------------------------

mini_solve = ->
	n = 0

	save();

	p2 = pop();
	p1 = pop();

	push(p1);
	push(p2);

	n = coeff();

	# AX + B, X = -B/A

	if (n == 2)
		p3 = pop();
		p4 = pop();
		push(p4);
		push(p3);
		divide();
		negate();
		restore();
		return;

	# AX^2 + BX + C, X = (-B +/- (B^2 - 4AC)^(1/2)) / (2A)

	if (n == 3)
		p3 = pop();
		p4 = pop();
		p5 = pop();
		push(p4);
		push(p4);
		multiply();
		push_integer(4);
		push(p3);
		multiply();
		push(p5);
		multiply();
		subtract();
		push_rational(1, 2);
		power();
		p6 = pop();
		push(p6);			# 1st root
		push(p4);
		subtract();
		push(p3);
		divide();
		push_rational(1, 2);
		multiply();
		push(p6);			# 2nd root
		push(p4);
		add();
		negate();
		push(p3);
		divide();
		push_rational(1, 2);
		multiply();
		restore();
		return;

	tos -= n;

	restore();

test_roots = ->
	run_test [
		"roots(x)",
		"0",

		"roots(x^2)",
		"0",

		"roots(x^3)",
		"0",

		"roots(2 x)",
		"0",

		"roots(2 x^2)",
		"0",

		"roots(2 x^3)",
		"0",

		"roots(6+11*x+6*x^2+x^3)",
		"(-3,-2,-1)",

		"roots(a*x^2+b*x+c)",
		"(-b/(2*a)-(-4*a*c+b^2)^(1/2)/(2*a),-b/(2*a)+(-4*a*c+b^2)^(1/2)/(2*a))",

		"roots(3+7*x+5*x^2+x^3)",
		"(-3,-1)",

		"roots(x^3+x^2+x+1)",
		"(-1,-i,i)",

		"roots(x^4+1)",
		"Stop: roots: the polynomial is not factorable, try nroots",

		"roots(x^2==1)",
		"(-1,1)",

		"roots(3 x + 12 == 24)",
		"4",

		"y=roots(x^2+b*x+c/k)[1]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(x^2+b*x+c/k)[2]",
		"",

		"y^2+b*y+c/k",
		"0",

		"y=roots(a*x^2+b*x+c/4)[1]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=roots(a*x^2+b*x+c/4)[2]",
		"",

		"a*y^2+b*y+c/4",
		"0",

		"y=quote(y)",
		"",
	]