# Complex conjugate

#include "stdafx.h"
#include "defs.h"

Eval_conj = ->
	push(cadr(p1));
	Eval();
	p1 = pop();
	push(p1);
	if (!find(p1, imaginaryunit)) # example: (-1)^(1/3)
		polar();
		conjugate();
		clockform();
	else
		conjugate();


conjugate = ->
	push(imaginaryunit);
	push(imaginaryunit);
	negate();
	subst();
	Eval();
