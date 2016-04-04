#-----------------------------------------------------------------------------
#
#	Author : philippe.billet@noos.fr
#
#	sgn sign function
#
#
#-----------------------------------------------------------------------------

#include "stdafx.h"
#include "defs.h"

Eval_sgn = ->
	push(cadr(p1));
	Eval();
	sgn();

sgn = ->
	save();
	yysgn();
	restore();

#define X p1

yysgn = ->
	
	X = pop();

	
	if (isdouble(p1))
		if (p1.d > 0) 
			push_integer(1);
			return;
		else 
			if (p1.d == 0) 
				push_integer(1);
				return;
			else
				push_integer(-1);
				return;

	if (isrational(p1))
		if (MSIGN(mmul(p1.q.a,p1.q.b)) == -1) 
			push_integer(-1);
			return;
		else 
			if (MZERO(mmul(p1.q.a,p1.q.b))) 
				push_integer(0);
				return;
			else
				push_integer(1);
				return;

	if (iscomplexnumber(X))
		push_integer(-1);
		push(X);
		absval();
		power();
		push(X);
		multiply();
		return;
	
	
	if (isnegativeterm(X))
		push_symbol(SGN);
		push(X);
		negate();
		list(2);
		push_integer(-1);
		multiply();
		return;
	
	###
	push_integer(2);
	push(X);
	heaviside();
	multiply();
	push_integer(-1);
	add();
	###
	
	push_symbol(SGN);
	push(X);
	list(2);


test_sgn = ->
	run_test [

		"sgn(-3)",
		"-1",
		

		"sgn(0)",
		"0",
		
		"sgn(3)",
		"1",

	]