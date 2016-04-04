#-----------------------------------------------------------------------------
#
#	Author : philippe.billet@noos.fr
#
#	Error function erf(x)
#	erf(-x)=erf(x)
#  
#-----------------------------------------------------------------------------

#include "stdafx.h"
#include "defs.h"

Eval_erf = ->
	push(cadr(p1));
	Eval();
	yerf();

yerf = ->
	save();
	yyerf();
	restore();

yyerf = ->
	d = 0.0

	p1 = pop();

	if (isdouble(p1))
		d = 1.0 - erfc(p1.d);
		push_double(d);
		return;

	if (isnegativeterm(p1))
		push_symbol(ERF);
		push(p1);
		negate();
		list(2);
		negate();
		return;
	
	push_symbol(ERF);
	push(p1);
	list(2);
	return;

test_erf = ->
	run_test [

		"erf(a)",
		"erf(a)",

		"erf(0.0) + 1",		# add 1 to round off
		"1",

		"float(erf(0)) + 1",	# add 1 to round off
		"1",
	]

###

#two potential more tests that were
# commented-out

#if 0
"float(erf(1))",
"0.842701",
#endif
###

