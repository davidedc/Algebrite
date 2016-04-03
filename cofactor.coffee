# Cofactor of a matrix component.

#include "stdafx.h"
#include "defs.h"

Eval_cofactor = ->

	i = 0
	j = 0
	n = 0
	push(cadr(p1));
	Eval();
	p2 = pop();
	if (istensor(p2) && p2.tensor.ndim == 2 && p2.tensor.dim[0] == p2.tensor.dim[1])
		doNothing = 1
	else
		stop("cofactor: 1st arg: square matrix expected");
	n = p2.tensor.dim[0];
	push(caddr(p1));
	Eval();
	i = pop_integer();
	if (i < 1 || i > n)
		stop("cofactor: 2nd arg: row index expected");
	push(cadddr(p1));
	Eval();
	j = pop_integer();
	if (j < 1 || j > n)
		stop("cofactor: 3rd arg: column index expected");
	cofactor(p2, n, i - 1, j - 1);

cofactor = (p, n, row, col) ->
	i = 0
	j = 0
	for i in [0...n]
		for j in [0...n]
			if (i != row && j != col)
				push(p.tensor.elem[n * i + j]);
	determinant(n - 1);
	if ((row + col) % 2)
		negate();



test_cofactor = ->
	run_test [

		"cofactor(((1,2),(3,4)),1,1)",
		"4",

		"cofactor(((1,2),(3,4)),1,2)",
		"-3",

		"cofactor(((1,2),(3,4)),2,1)",
		"-2",

		"cofactor(((1,2),(3,4)),2,2)",
		"1",

		"cofactor(((1,2,3),(4,5,6),(7,8,9)),1,2)",
		"6",
	]
