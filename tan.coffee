# Tangent function of numerical and symbolic arguments

#include "stdafx.h"
#include "defs.h"

Eval_tan = ->
	push(cadr(p1));
	Eval();
	tangent();

tangent = ->
	save();
	yytangent();
	restore();

yytangent = ->
	n = 0
	d = 0.0

	p1 = pop();

	if (car(p1) == symbol(ARCTAN))
		push(cadr(p1));
		return;

	if (isdouble(p1))
		d = tan(p1.d);
		if (Math.abs(d) < 1e-10)
			d = 0.0;
		push_double(d);
		return;

	# tan function is antisymmetric, tan(-x) = -tan(x)

	if (isnegative(p1))
		push(p1);
		negate();
		tangent();
		negate();
		return;

	# multiply by 180/pi

	push(p1);
	push_integer(180);
	multiply();
	push_symbol(PI);
	divide();

	n = pop_integer();

	if (n < 0 || n == 0x80000000)
		push(symbol(TAN));
		push(p1);
		list(2);
		return;

	switch (n % 360)
		when 0, 180
			push_integer(0);
		when 30, 210
			push_rational(1, 3);
			push_integer(3);
			push_rational(1, 2);
			power();
			multiply();
		when 150, 330
			push_rational(-1, 3);
			push_integer(3);
			push_rational(1, 2);
			power();
			multiply();
		when 45, 225
			push_integer(1);
		when 135, 315
			push_integer(-1);
		when 60, 240
			push_integer(3);
			push_rational(1, 2);
			power();
		when 120, 300
			push_integer(3);
			push_rational(1, 2);
			power();
			negate();
		else
			push(symbol(TAN));
			push(p1);
			list(2);


test_tan = ->
	run_test [
		"tan(x)",
		"tan(x)",

		"tan(-x)",
		"-tan(x)",

		"tan(b-a)",
		"-tan(a-b)",

		# check against the floating point math library

		"f(a,x)=1+tan(float(a/360*2*pi))-float(x)+tan(a/360*2*pi)-x",
		"",

		"f(0,0)",			# 0
		"1",

		"f(180,0)",			# 180
		"1",

		"f(360,0)",			# 360
		"1",

		"f(-180,0)",			# -180
		"1",

		"f(-360,0)",			# -360
		"1",

		"f(45,1)",			# 45
		"1",

		"f(135,-1)",			# 135
		"1",

		"f(225,1)",			# 225
		"1",

		"f(315,-1)",			# 315
		"1",

		"f(-45,-1)",			# -45
		"1",

		"f(-135,1)",			# -135
		"1",

		"f(-225,-1)",			# -225
		"1",

		"f(-315,1)",			# -315
		"1",

		"f(30,sqrt(3)/3)",		# 30
		"1",

		"f(150,-sqrt(3)/3)",		# 150
		"1",

		"f(210,sqrt(3)/3)",		# 210
		"1",

		"f(330,-sqrt(3)/3)",		# 330
		"1",

		"f(-30,-sqrt(3)/3)",		# -30
		"1",

		"f(-150,sqrt(3)/3)",		# -150
		"1",

		"f(-210,-sqrt(3)/3)",		# -210
		"1",

		"f(-330,sqrt(3)/3)",		# -330
		"1",

		"f(60,sqrt(3))",		# 60
		"1",

		"f(120,-sqrt(3))",		# 120
		"1",

		"f(240,sqrt(3))",		# 240
		"1",

		"f(300,-sqrt(3))",		# 300
		"1",

		"f(-60,-sqrt(3))",		# -60
		"1",

		"f(-120,sqrt(3))",		# -120
		"1",

		"f(-240,-sqrt(3))",		# -240
		"1",

		"f(-300,sqrt(3))",		# -300
		"1",

		"f=quote(f)",
		"",

		"tan(arctan(x))",
		"x",

		# check the default case

		"tan(1/12*pi)",
		"tan(1/12*pi)",
	]