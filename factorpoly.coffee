# Factor a polynomial

#include "stdafx.h"
#include "defs.h"


#define POLY p1
#define X p2
#define Z p3
#define A p4
#define B p5
#define Q p6
#define RESULT p7
#define FACTOR p8

polycoeff = 0
factpoly_expo = 0

factorpoly = ->
	save();

	p2 = pop();
	p1 = pop();

	if (!Find(p1, p2))
		push(p1);
		restore();
		return;

	if (!ispoly(p1, p2))
		push(p1);
		restore();
		return;

	if (!issymbol(p2))
		push(p1);
		restore();
		return;

	push(p1);
	push(p2);
	yyfactorpoly();

	restore();

#-----------------------------------------------------------------------------
#
#	Input:		tos-2		true polynomial
#
#			tos-1		free variable
#
#	Output:		factored polynomial on stack
#
#-----------------------------------------------------------------------------

yyfactorpoly = ->
	h = 0
	i = 0

	save();

	p2 = pop();
	p1 = pop();

	h = tos;

	if (isfloating(p1))
		stop("floating point numbers in polynomial");

	polycoeff = tos;

	push(p1);
	push(p2);
	factpoly_expo = coeff() - 1;

	rationalize_coefficients(h);

	# for univariate polynomials we could do factpoly_expo > 1

	while (factpoly_expo > 0)

		if (iszero(stack[polycoeff+0]))
			push_integer(1);
			p4 = pop();
			push_integer(0);
			p5 = pop();
		else if (get_factor() == 0)
			if (verbosing)
				printf("no factor found\n");
			break;

		push(p4);
		push(p2);
		multiply();
		push(p5);
		add();
		p8 = pop();

		if (verbosing)
			printf("success\nFACTOR=");
			print(p8);
			printf("\n");

		# factor out negative sign (not req'd because p4 > 1)
		#if 0
		###
		if (isnegativeterm(p4))
			push(p8);
			negate();
			p8 = pop();
			push(p7);
			negate_noexpand();
			p7 = pop();
		###
		#endif
		push(p7);
		push(p8);
		multiply_noexpand();
		p7 = pop();

		yydivpoly();

		while (factpoly_expo and iszero(stack[polycoeff+factpoly_expo]))
			factpoly_expo--;

	# unfactored polynomial

	push(zero);
	for i in [0..factpoly_expo]
		push(stack[polycoeff+i]);
		push(p2);
		push_integer(i);
		power();
		multiply();
		add();
	p1 = pop();

	if (verbosing)
		printf("POLY=");
		print(p1);
		printf("\n");

	# factor out negative sign

	if (factpoly_expo > 0 && isnegativeterm(stack[polycoeff+factpoly_expo]))
		push(p1);
		negate();
		p1 = pop();
		push(p7);
		negate_noexpand();
		p7 = pop();

	push(p7);
	push(p1);
	multiply_noexpand();
	p7 = pop();

	if (verbosing)
		printf("RESULT=");
		print(p7);
		printf("\n");

	stack[h] = p7;

	tos = h + 1;

	restore();

rationalize_coefficients = (h) ->
	i = 0

	# LCM of all polynomial coefficients

	p7 = one;
	for i in [h...tos]
		push(stack[i]);
		denominator();
		push(p7);
		lcm();
		p7 = pop();

	# multiply each coefficient by RESULT

	for i in [h...tos]
		push(p7);
		push(stack[i]);
		multiply();
		stack[i] = pop();

	# reciprocate RESULT

	push(p7);
	reciprocate();
	p7 = pop();
	console.log("rationalize_coefficients result");
	print1(p7);

get_factor = ->

	i = 0
	j = 0
	h = 0
	a0 = 0
	an = 0
	na0 = 0
	nan = 0

	if (verbosing)
		push(zero);
		for i in [0..factpoly_expo]
			push(stack[polycoeff+i]);
			push(p2);
			push_integer(i);
			power();
			multiply();
			add();
		p1 = pop();
		printf("POLY=");
		print(p1);
		printf("\n");

	h = tos;

	an = tos;
	push(stack[polycoeff+factpoly_expo]);

	divisors_onstack();

	nan = tos - an;

	a0 = tos;
	push(stack[polycoeff+0]);
	divisors_onstack();
	na0 = tos - a0;

	if (verbosing)
		printf("divisors of base term");
		for i in [0...na0]
			printf(", ");
			print(stack[a0 + i]);
		printf("\n");
		printf("divisors of leading term");
		for i in [0...nan]
			printf(", ");
			print(stack[an + i]);
		printf("\n");

	# try roots

	for rootsTries_i in [0...nan]
		for rootsTries_j in [0...na0]

			#console.log "nan: " + nan + " na0: " + na0 + " i: " + rootsTries_i + " j: " + rootsTries_j

			p4 = stack[an + rootsTries_i];
			p5 = stack[a0 + rootsTries_j];

			push(p5);
			push(p4);
			divide();
			negate();
			p3 = pop();

			Evalpoly();

			if (verbosing)
				printf("try A=");
				print(p4);
				printf(", B=");
				print(p5);
				printf(", root ");
				print(p2);
				printf("=-B/A=");
				print(p3);
				printf(", POLY(");
				print(p3);
				printf(")=");
				print(p6);
				printf("\n");

			if (iszero(p6))
				tos = h;
				console.log "get_factor returning 1"
				return 1;

			push(p5);
			negate();
			p5 = pop();

			push(p3);
			negate();
			p3 = pop();

			Evalpoly();

			if (verbosing)
				printf("try A=");
				print(p4);
				printf(", B=");
				print(p5);
				printf(", root ");
				print(p2);
				printf("=-B/A=");
				print(p3);
				printf(", POLY(");
				print(p3);
				printf(")=");
				print(p6);
				printf("\n");

			if (iszero(p6))
				tos = h;
				console.log "get_factor returning 1"
				return 1;

	tos = h;

	console.log "get_factor returning 0"
	return 0;

#-----------------------------------------------------------------------------
#
#	Divide a polynomial by Ax+B
#
#	Input:		polycoeff	Dividend coefficients
#
#			factpoly_expo		Degree of dividend
#
#			A		As above
#
#			B		As above
#
#	Output:		polycoeff	Contains quotient coefficients
#
#-----------------------------------------------------------------------------

yydivpoly = ->
	i = 0
	p6 = zero;
	for i in [factpoly_expo...0]
		push(stack[polycoeff+i]);
		stack[polycoeff+i] = p6;
		push(p4);
		divide();
		p6 = pop();
		push(stack[polycoeff+i - 1]);
		push(p6);
		push(p5);
		multiply();
		subtract();
		stack[polycoeff+i - 1] = pop();
	stack[polycoeff+0] = p6;
	console.log("yydivpoly Q:")
	print1(p6)

Evalpoly = ->
	i = 0
	push(zero);
	for i in [factpoly_expo..0]
		push(p3);
		multiply();
		push(stack[polycoeff+i]);
		console.log("Evalpoly top of stack:")
		print1(stack[tos-i])
		add();
	p6 = pop();

test_factorpoly = ->
	run_test [

		"bake=0",
		"",

		"factor((x+1)*(x+2)*(x+3),x)",
		"(1+x)*(2+x)*(3+x)",

		"factor((x+a)*(x^2+x+1),x)",
		"(1+x+x^2)*(a+x)",

		"factor(x*(x+1)*(x+2),x)",
		"x*(1+x)*(2+x)",

	#	"factor((x+1)*(x+2)*(y+3)*(y+4),x,y)",
	#	"(1+x)*(2+x)*(3+y)*(4+y)",

	#	"factor((x+1)*(x+2)*(y+3)*(y+4),(x,y))",
	#	"(1+x)*(2+x)*(3+y)*(4+y)",

	#	"factor((x+1)*(x+2)*(y+3)*(y+4))",
	#	"(1+x)*(2+x)*(3+y)*(4+y)",

		"factor((-2*x+3)*(x+4),x)",
		"-(-3+2*x)*(4+x)",

		"(-2*x+3)*(x+4)+(-3+2*x)*(4+x)",
		"0",

		# make sure sign of remaining poly is factored

		"factor((x+1)*(-x^2+x+1),x)",
		"-(-1-x+x^2)*(1+x)",

	# sign handling

	#++++++

		"factor((x+1/2)*(+x+1/3)*(+x+1/4),x)",
		"1/24*(1+2*x)*(1+3*x)*(1+4*x)",

		"(x+1/2)*(+x+1/3)*(+x+1/4)-1/24*(1+2*x)*(1+3*x)*(1+4*x)",
		"0",

	#+++++-

		"factor((x+1/2)*(+x+1/3)*(+x-1/4),x)",
		"1/24*(-1+4*x)*(1+2*x)*(1+3*x)",

		"(x+1/2)*(+x+1/3)*(+x-1/4)-1/24*(-1+4*x)*(1+2*x)*(1+3*x)",
		"0",

	#++++-+

		"factor((x+1/2)*(+x+1/3)*(-x+1/4),x)",
		"-1/24*(-1+4*x)*(1+2*x)*(1+3*x)",

		"(x+1/2)*(+x+1/3)*(-x+1/4)+1/24*(-1+4*x)*(1+2*x)*(1+3*x)",
		"0",

	#++++--

		"factor((x+1/2)*(+x+1/3)*(-x-1/4),x)",
		"-1/24*(1+2*x)*(1+3*x)*(1+4*x)",

		"(x+1/2)*(+x+1/3)*(-x-1/4)+1/24*(1+2*x)*(1+3*x)*(1+4*x)",
		"0",

	#+++-++

		"factor((x+1/2)*(+x-1/3)*(+x+1/4),x)",
		"1/24*(-1+3*x)*(1+2*x)*(1+4*x)",

		"(x+1/2)*(+x-1/3)*(+x+1/4)-1/24*(-1+3*x)*(1+2*x)*(1+4*x)",
		"0",

	#+++-+-

		"factor((x+1/2)*(+x-1/3)*(+x-1/4),x)",
		"1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",

		"(x+1/2)*(+x-1/3)*(+x-1/4)-1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",
		"0",

	#+++--+

		"factor((x+1/2)*(+x-1/3)*(-x+1/4),x)",
		"-1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",

		"(x+1/2)*(+x-1/3)*(-x+1/4)+1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",
		"0",

	#+++---

		"factor((x+1/2)*(+x-1/3)*(-x-1/4),x)",
		"-1/24*(-1+3*x)*(1+2*x)*(1+4*x)",

		"(x+1/2)*(+x-1/3)*(-x-1/4)+1/24*(-1+3*x)*(1+2*x)*(1+4*x)",
		"0",

	#++-+++

		"factor((x+1/2)*(-x+1/3)*(+x+1/4),x)",
		"-1/24*(-1+3*x)*(1+2*x)*(1+4*x)",

		"(x+1/2)*(-x+1/3)*(+x+1/4)+1/24*(-1+3*x)*(1+2*x)*(1+4*x)",
		"0",

	#++-++-

		"factor((x+1/2)*(-x+1/3)*(+x-1/4),x)",
		"-1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",

		"(x+1/2)*(-x+1/3)*(+x-1/4)+1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",
		"0",

	#++-+-+

		"factor((x+1/2)*(-x+1/3)*(-x+1/4),x)",
		"1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",

		"(x+1/2)*(-x+1/3)*(-x+1/4)-1/24*(-1+3*x)*(-1+4*x)*(1+2*x)",
		"0",

	#++-+--

		"factor((x+1/2)*(-x+1/3)*(-x-1/4),x)",
		"1/24*(-1+3*x)*(1+2*x)*(1+4*x)",

		"(x+1/2)*(-x+1/3)*(-x-1/4)-1/24*(-1+3*x)*(1+2*x)*(1+4*x)",
		"0",

	#++--++

		"factor((x+1/2)*(-x-1/3)*(+x+1/4),x)",
		"-1/24*(1+2*x)*(1+3*x)*(1+4*x)",

		"(x+1/2)*(-x-1/3)*(+x+1/4)+1/24*(1+2*x)*(1+3*x)*(1+4*x)",
		"0",

	#++--+-

		"factor((x+1/2)*(-x-1/3)*(+x-1/4),x)",
		"-1/24*(-1+4*x)*(1+2*x)*(1+3*x)",

		"(x+1/2)*(-x-1/3)*(+x-1/4)+1/24*(-1+4*x)*(1+2*x)*(1+3*x)",
		"0",

	#++---+

		"factor((x+1/2)*(-x-1/3)*(-x+1/4),x)",
		"1/24*(-1+4*x)*(1+2*x)*(1+3*x)",

		"(x+1/2)*(-x-1/3)*(-x+1/4)-1/24*(-1+4*x)*(1+2*x)*(1+3*x)",
		"0",

	#++----

		"factor((x+1/2)*(-x-1/3)*(-x-1/4),x)",
		"1/24*(1+2*x)*(1+3*x)*(1+4*x)",

		"(x+1/2)*(-x-1/3)*(-x-1/4)-1/24*(1+2*x)*(1+3*x)*(1+4*x)",
		"0",

	#++++++

		"factor((+x+a)*(+x+b)*(+x+c),x)",
		"(a+x)*(b+x)*(c+x)",

		"(a+x)*(b+x)*(c+x)-(a+x)*(b+x)*(c+x)",
		"0",

	#+++++-

		"factor((+x+a)*(+x+b)*(+x-c),x)",
		"(a+x)*(b+x)*(-c+x)",

		"(+x+a)*(+x+b)*(+x-c)-(a+x)*(b+x)*(-c+x)",
		"0",

	#++++-+

		"factor((+x+a)*(+x+b)*(-x+c),x)",
		"-(a+x)*(b+x)*(-c+x)",

		"(+x+a)*(+x+b)*(-x+c)+(a+x)*(b+x)*(-c+x)",
		"0",

	#++++--

		"factor((+x+a)*(+x+b)*(-x-c),x)",
		"-(a+x)*(b+x)*(c+x)",

		"(+x+a)*(+x+b)*(-x-c)+(a+x)*(b+x)*(c+x)",
		"0",

	#++++

		"factor((+a*x+b)*(+c*x+d),x)",
		"(b+a*x)*(d+c*x)",

		"(+a*x+b)*(+c*x+d)-(b+a*x)*(d+c*x)",
		"0",

	#+++-

		"factor((+a*x+b)*(+c*x-d),x)",
		"(b+a*x)*(-d+c*x)",

		"(+a*x+b)*(+c*x-d)-(b+a*x)*(-d+c*x)",
		"0",

	#++-+

		"factor((+a*x+b)*(-c*x+d),x)",
		"-(b+a*x)*(-d+c*x)",

		"(+a*x+b)*(-c*x+d)+(b+a*x)*(-d+c*x)",
		"0",

	#++--

		"factor((+a*x+b)*(-c*x-d),x)",
		"-(b+a*x)*(d+c*x)",

		"(+a*x+b)*(-c*x-d)+(b+a*x)*(d+c*x)",
		"0",

	#+-++

		"factor((+a*x-b)*(+c*x+d),x)",
		"(d+c*x)*(-b+a*x)",

		"(+a*x-b)*(+c*x+d)-(d+c*x)*(-b+a*x)",
		"0",

	#+-+-

		"factor((+a*x-b)*(+c*x-d),x)",
		"(-b+a*x)*(-d+c*x)",

		"(+a*x-b)*(+c*x-d)-(-b+a*x)*(-d+c*x)",
		"0",

	#+--+

		"factor((+a*x-b)*(-c*x+d),x)",
		"-(-b+a*x)*(-d+c*x)",

		"(+a*x-b)*(-c*x+d)+(-b+a*x)*(-d+c*x)",
		"0",

	#+---

		"factor((+a*x-b)*(-c*x-d),x)",
		"-(d+c*x)*(-b+a*x)",

		"(+a*x-b)*(-c*x-d)+(d+c*x)*(-b+a*x)",
		"0",

	#-+++

		"factor((-a*x+b)*(+c*x+d),x)",
		"-(d+c*x)*(-b+a*x)",

		"(-a*x+b)*(+c*x+d)+(d+c*x)*(-b+a*x)",
		"0",

	#-++-

		"factor((-a*x+b)*(+c*x-d),x)",
		"-(-b+a*x)*(-d+c*x)",

		"(-a*x+b)*(+c*x-d)+(-b+a*x)*(-d+c*x)",
		"0",

	#-+-+

		"factor((-a*x+b)*(-c*x+d),x)",
		"(-b+a*x)*(-d+c*x)",

		"(-a*x+b)*(-c*x+d)-(-b+a*x)*(-d+c*x)",
		"0",

	#-+--

		"factor((-a*x+b)*(-c*x-d),x)",
		"(d+c*x)*(-b+a*x)",

		"(-a*x+b)*(-c*x-d)-(d+c*x)*(-b+a*x)",
		"0",

	#--++

		"factor((-a*x-b)*(+c*x+d),x)",
		"-(b+a*x)*(d+c*x)",

		"(-a*x-b)*(+c*x+d)+(b+a*x)*(d+c*x)",
		"0",

	#--+-

		"factor((-a*x-b)*(+c*x-d),x)",
		"-(b+a*x)*(-d+c*x)",

		"(-a*x-b)*(+c*x-d)+(b+a*x)*(-d+c*x)",
		"0",

	#---+

		"factor((-a*x-b)*(-c*x+d),x)",
		"(b+a*x)*(-d+c*x)",

		"(-a*x-b)*(-c*x+d)-(b+a*x)*(-d+c*x)",
		"0",

	#----

		"factor((-a*x-b)*(-c*x-d),x)",
		"(b+a*x)*(d+c*x)",

		"(-a*x-b)*(-c*x-d)-(b+a*x)*(d+c*x)",
		"0",

		# this used to cause divide by zero

		# fixed by calling ispoly before calling coeff

	#	"factor(1/x+1)",
	#	"(1+x)/x",

		# see if poly gets rationalized

	#	"(x+1)(x+2)(x+3)/x^3",
	#	"1+6/(x^3)+11/(x^2)+6/x",

	#	"factor(last)",
	#	"(1+x)*(2+x)*(3+x)/(x^3)",

		# this used to fail

		"factor(x,x)",
		"x",

		"factor(x^2,x)",
		"x^2",

		"factor(x^3,x)",
		"x^3",

		"bake=1",
		"",

		"y=(x+1)(x+2)",
		"",

		"factor(y,z)",
		"x^2+3*x+2",

		"factor(y,y)",
		"x^2+3*x+2",

		"y=x^2+exp(x)",
		"",

		"factor(y)",
		"x^2+exp(x)",
	]
