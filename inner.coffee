# Do the inner product of tensors.

#include "stdafx.h"
#include "defs.h"

Eval_inner = ->
	p1 = cdr(p1);
	push(car(p1));
	Eval();
	p1 = cdr(p1);
	while (iscons(p1))
		push(car(p1));
		Eval();
		inner();
		p1 = cdr(p1);

inner = ->
	save();
	p2 = pop();
	p1 = pop();
	if (istensor(p1) && istensor(p2))
		inner_f();
	else
		push(p1);
		push(p2);
		if (istensor(p1))
			tensor_times_scalar();
		else if (istensor(p2))
			scalar_times_tensor();
		else
			multiply();
	restore();

# inner product of tensors p1 and p2
inner_f = ->

	i = 0
	n = p1.tensor.dim[p1.tensor.ndim - 1];

	if (n != p2.tensor.dim[0])
		debugger
		stop("inner: tensor dimension check");

	ndim = p1.tensor.ndim + p2.tensor.ndim - 2;

	if (ndim > MAXDIM)
		stop("inner: rank of result exceeds maximum");

	a = p1.tensor.elem;
	b = p2.tensor.elem;

	#---------------------------------------------------------------------
	#
	#	ak is the number of rows in tensor A
	#
	#	bk is the number of columns in tensor B
	#
	#	Example:
	#
	#	A[3][3][4] B[4][4][3]
	#
	#	  3  3				ak = 3 * 3 = 9
	#
	#	                4  3		bk = 4 * 3 = 12
	#
	#---------------------------------------------------------------------

	ak = 1;
	for i in [0...(p1.tensor.ndim - 1)]
		ak *= p1.tensor.dim[i];

	bk = 1;
	for i in [1...p2.tensor.ndim]
		bk *= p2.tensor.dim[i];

	p3 = alloc_tensor(ak * bk);

	c = p3.tensor.elem;

	# new method copied from ginac http://www.ginac.de/
	for i in [0...ak]
		for j in [0...n]
			if (iszero(a[i * n + j]))
				continue;
			for k in [0...bk]
				push(a[i * n + j]);
				push(b[j * bk + k]);
				multiply();
				push(c[i * bk + k]);
				add();
				c[i * bk + k] = pop();

	#---------------------------------------------------------------------
	#
	#	Note on understanding "k * bk + j"
	#
	#	k * bk because each element of a column is bk locations apart
	#
	#	+ j because the beginnings of all columns are in the first bk 
	#	locations
	#
	#	Example: n = 2, bk = 6
	#
	#	b111	<- 1st element of 1st column
	#	b112	<- 1st element of 2nd column
	#	b113	<- 1st element of 3rd column
	#	b121	<- 1st element of 4th column
	#	b122	<- 1st element of 5th column
	#	b123	<- 1st element of 6th column
	#
	#	b211	<- 2nd element of 1st column
	#	b212	<- 2nd element of 2nd column
	#	b213	<- 2nd element of 3rd column
	#	b221	<- 2nd element of 4th column
	#	b222	<- 2nd element of 5th column
	#	b223	<- 2nd element of 6th column
	#
	#---------------------------------------------------------------------

	if (ndim == 0)
		push(p3.tensor.elem[0]);
	else
		p3.tensor.ndim = ndim;
		j = 0
		for i in [0...(p1.tensor.ndim - 1)]
			p3.tensor.dim[i] = p1.tensor.dim[i];
		j = p1.tensor.ndim - 1;
		for i in [0...(p2.tensor.ndim - 1)]
			p3.tensor.dim[j + i] = p2.tensor.dim[i + 1];
		push(p3);

test_inner = ->
	run_test [

		"inner(a,b)",
		"a*b",

		"inner(a,(b1,b2))",
		"(a*b1,a*b2)",

		"inner((a1,a2),b)",
		"(a1*b,a2*b)",

		"inner(((a11,a12),(a21,a22)),(x1,x2))",
		"(a11*x1+a12*x2,a21*x1+a22*x2)",

		"inner((1,2),(3,4))",
		"11",

		"inner(inner((1,2),((3,4),(5,6))),(7,8))",
		"219",

		"inner((1,2),inner(((3,4),(5,6)),(7,8)))",
		"219",

		"inner((1,2),((3,4),(5,6)),(7,8))",
		"219",
	]