# Adjunct of a matrix

#include "stdafx.h"
#include "defs.h"

Eval_adj = ->
	push(cadr(p1));
	Eval();
	adj();

adj = ->
	i = 0
	j = 0
	n = 0

	save();

	p1 = pop();

	if (istensor(p1) && p1.tensor.ndim == 2 && p1.tensor.dim[0] == p1.tensor.dim[1])
		doNothing = 1
	else
		stop("adj: square matrix expected");

	n = p1.tensor.dim[0];

	p2 = alloc_tensor(n * n);

	p2.tensor.ndim = 2;
	p2.tensor.dim[0] = n;
	p2.tensor.dim[1] = n;

	for i in [0...n]
		for j in [0...n]
			cofactor(p1, n, i, j);
			p2.tensor.elem[n * j + i] = pop(); # transpose

	push(p2);

	restore();


test_adj = ->
	run_test [

		"adj(((a,b),(c,d)))",
		"((d,-b),(-c,a))",

		"adj(((1,2),(3,4)))",
		"((4,-2),(-3,1))",

		"adj(((2,3,-2,5),(6,-2,1,4),(5,10,3,-2),(-1,2,2,3)))",
		"((-4,-177,-73,194),(-117,117,-99,-27),(310,-129,-44,-374),(-130,-51,71,-211))",
	]

