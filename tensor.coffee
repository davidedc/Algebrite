#include "stdafx.h"

#include "defs.h"


#-----------------------------------------------------------------------------
#
#	Called from the "eval" module to evaluate tensor elements.
#
#	p1 points to the tensor operand.
#
#-----------------------------------------------------------------------------

Eval_tensor = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b;

	#---------------------------------------------------------------------
	#
	#	create a new tensor for the result
	#
	#---------------------------------------------------------------------

	nelem = p1.tensor.nelem;

	ndim = p1.tensor.ndim;

	p2 = alloc_tensor(nelem);

	p2.tensor.ndim = ndim;

	for i in [0...ndim]
		p2.tensor.dim[i] = p1.tensor.dim[i];

	#---------------------------------------------------------------------
	#
	#	b = eval(a)
	#
	#---------------------------------------------------------------------

	a = p1.tensor.elem;
	b = p2.tensor.elem;

	for i in [0...nelem]
		push(a[i]);
		Eval();
		b[i] = pop();

	#---------------------------------------------------------------------
	#
	#	push the result
	#
	#---------------------------------------------------------------------

	push(p2);

	promote_tensor();

#-----------------------------------------------------------------------------
#
#	Add tensors
#
#	Input:		Operands on stack
#
#	Output:		Result on stack
#
#-----------------------------------------------------------------------------

tensor_plus_tensor = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b, **c;

	save();

	p2 = pop();
	p1 = pop();

	# are the dimension lists equal?

	ndim = p1.tensor.ndim;

	if (ndim != p2.tensor.ndim)
		push(symbol(NIL));
		restore();
		return;

	for i in [0...ndim]
		if (p1.tensor.dim[i] != p2.tensor.dim[i])
			push(symbol(NIL));
			restore();
			return;

	# create a new tensor for the result

	nelem = p1.tensor.nelem;

	p3 = alloc_tensor(nelem);

	p3.tensor.ndim = ndim;

	for i in [0...ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i];

	# c = a + b

	a = p1.tensor.elem;
	b = p2.tensor.elem;
	c = p3.tensor.elem;

	for i in [0...nelem]
		push(a[i]);
		push(b[i]);
		add();
		c[i] = pop();

	# push the result

	push(p3);

	restore();

#-----------------------------------------------------------------------------
#
#	careful not to reorder factors
#
#-----------------------------------------------------------------------------

tensor_times_scalar = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b;

	save();

	p2 = pop();
	p1 = pop();

	ndim = p1.tensor.ndim;
	nelem = p1.tensor.nelem;

	p3 = alloc_tensor(nelem);

	p3.tensor.ndim = ndim;

	for i in [0...ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i];

	a = p1.tensor.elem;
	b = p3.tensor.elem;

	for i in [0...nelem]
		push(a[i]);
		push(p2);
		multiply();
		b[i] = pop();

	push(p3);
	restore();

scalar_times_tensor = ->
	i = 0
	ndim = 0
	nelem = 0
	#U **a, **b;

	save();

	p2 = pop();
	p1 = pop();

	ndim = p2.tensor.ndim;
	nelem = p2.tensor.nelem;

	p3 = alloc_tensor(nelem);

	p3.tensor.ndim = ndim;

	for i in [0...ndim]
		p3.tensor.dim[i] = p2.tensor.dim[i];

	a = p2.tensor.elem;
	b = p3.tensor.elem;

	for i in [0...nelem]
		push(p1);
		push(a[i]);
		multiply();
		b[i] = pop();

	push(p3);

	restore();

is_square_matrix = (p) ->
	if (istensor(p) && p.tensor.ndim == 2 && p.tensor.dim[0] == p.tensor.dim[1])
		return 1;
	else
		return 0;

#-----------------------------------------------------------------------------
#
#	gradient of tensor
#
#-----------------------------------------------------------------------------

d_tensor_tensor = ->
	i = 0
	j = 0
	ndim = 0
	nelem = 0
	#U **a, **b, **c;

	ndim = p1.tensor.ndim;
	nelem = p1.tensor.nelem;

	if (ndim + 1 >= MAXDIM)
		push_symbol(DERIVATIVE);
		push(p1);
		push(p2);
		list(3);
		return

	p3 = alloc_tensor(nelem * p2.tensor.nelem);

	p3.tensor.ndim = ndim + 1;

	for i in [0...ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i];

	p3.tensor.dim[ndim] = p2.tensor.dim[0];

	a = p1.tensor.elem;
	b = p2.tensor.elem;
	c = p3.tensor.elem;

	for i in [0...nelem]
		for j in [0...p2.tensor.nelem]
			push(a[i]);
			push(b[j]);
			derivative();
			c[i * p2.tensor.nelem + j] = pop();

	push(p3);


#-----------------------------------------------------------------------------
#
#	gradient of scalar
#
#-----------------------------------------------------------------------------

d_scalar_tensor = ->
	#U **a, **b;

	p3 = alloc_tensor(p2.tensor.nelem);

	p3.tensor.ndim = 1;

	p3.tensor.dim[0] = p2.tensor.dim[0];

	a = p2.tensor.elem;
	b = p3.tensor.elem;

	for i in [0...p2.tensor.nelem]
		push(p1);
		push(a[i]);
		derivative();
		b[i] = pop();

	push(p3);

#-----------------------------------------------------------------------------
#
#	Derivative of tensor
#
#-----------------------------------------------------------------------------

d_tensor_scalar = ->
	i = 0
	#U **a, **b;

	p3 = alloc_tensor(p1.tensor.nelem);

	p3.tensor.ndim = p1.tensor.ndim;

	for i in [0...p1.tensor.ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i];

	a = p1.tensor.elem;
	b = p3.tensor.elem;

	for i in [0...p1.tensor.nelem]
		push(a[i]);
		push(p2);
		derivative();
		b[i] = pop();

	push(p3);

compare_tensors = (p1, p2) ->

	if (p1.tensor.ndim < p2.tensor.ndim)
		return -1;

	if (p1.tensor.ndim > p2.tensor.ndim)
		return 1;

	for i in [0...p1.tensor.ndim]
		if (p1.tensor.dim[i] < p2.tensor.dim[i])
			return -1;
		if (p1.tensor.dim[i] > p2.tensor.dim[i])
			return 1;

	for i in [0...p1.tensor.nelem]
		if (equal(p1.tensor.elem[i], p2.tensor.elem[i]))
			continue;
		if (lessp(p1.tensor.elem[i], p2.tensor.elem[i]))
			return -1;
		else
			return 1;

	return 0;

#-----------------------------------------------------------------------------
#
#	Raise a tensor to a power
#
#	Input:		p1	tensor
#
#			p2	exponent
#
#	Output:		Result on stack
#
#-----------------------------------------------------------------------------

power_tensor = ->
	i = 0
	k = 0
	n = 0

	# first and last dims must be equal

	k = p1.tensor.ndim - 1;

	if (p1.tensor.dim[0] != p1.tensor.dim[k])
		push_symbol(POWER);
		push(p1);
		push(p2);
		list(3);
		return;

	push(p2);

	n = pop_integer();

	if (!n.isSmall)
		push_symbol(POWER);
		push(p1);
		push(p2);
		list(3);
		return;

	if (n == 0)
		if (p1.tensor.ndim != 2)
			stop("power(tensor,0) with tensor rank not equal to 2");
		n = p1.tensor.dim[0];
		p1 = alloc_tensor(n * n);
		p1.tensor.ndim = 2;
		p1.tensor.dim[0] = n;
		p1.tensor.dim[1] = n;
		for i in [0...n]
			p1.tensor.elem[n * i + i] = one;
		push(p1);
		return;

	if (n < 0)
		n = -n;
		push(p1);
		inv();
		p1 = pop();

	push(p1);

	for i in [1...n]
		push(p1);
		inner();
		if (iszero(stack[tos - 1]))
			break;

copy_tensor = ->
	i = 0

	save();

	p1 = pop();

	p2 = alloc_tensor(p1.tensor.nelem);

	p2.tensor.ndim = p1.tensor.ndim;

	for i in [0...p1.tensor.ndim]
		p2.tensor.dim[i] = p1.tensor.dim[i];

	for i in [0...p1.tensor.nelem]
		p2.tensor.elem[i] = p1.tensor.elem[i];

	push(p2);

	restore();

# Tensors with elements that are also tensors get promoted to a higher rank.

promote_tensor = ->
	i = 0
	j = 0
	k = 0
	nelem = 0
	ndim = 0

	save();

	p1 = pop();

	if (!istensor(p1))
		push(p1);
		restore();
		return;

	p2 = p1.tensor.elem[0];

	for i in [1...p1.tensor.nelem]
		if (!compatible(p2, p1.tensor.elem[i]))
			stop("Cannot promote tensor due to inconsistent tensor components.");

	if (!istensor(p2))
		push(p1);
		restore();
		return;

	ndim = p1.tensor.ndim + p2.tensor.ndim;

	if (ndim > MAXDIM)
		stop("tensor rank > 24");

	nelem = p1.tensor.nelem * p2.tensor.nelem;

	p3 = alloc_tensor(nelem);

	p3.tensor.ndim = ndim;

	for i in [0...p1.tensor.ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i];

	for j in [0...p2.tensor.ndim]
		p3.tensor.dim[i + j] = p2.tensor.dim[j];

	k = 0;

	for i in [0...p1.tensor.nelem]
		p2 = p1.tensor.elem[i];
		for j in [0...p2.tensor.nelem]
			p3.tensor.elem[k++] = p2.tensor.elem[j];

	push(p3);

	restore();

compatible = (p,q) ->

	if (!istensor(p) && !istensor(q))
		return 1;

	if (!istensor(p) || !istensor(q))
		return 0;

	if (p.tensor.ndim != q.tensor.ndim)
		return 0;

	for i in [0...p.tensor.ndim]
		if (p.tensor.dim[i] != q.tensor.dim[i])
			return 0;

	return 1;

#if SELFTEST

s = [

	"#test_tensor",

	"a=(1,2,3)",
	"",

	"b=(4,5,6)",
	"",

	"c=(7,8,9)",
	"",

	"rank((a,b,c))",
	"2",

	"(a,b,c)",
	"((1,2,3),(4,5,6),(7,8,9))",

	# check tensor promotion

	"((1,0),(0,0))",
	"((1,0),(0,0))",

	"a=quote(a)",
	"",

	"b=quote(b)",
	"",

	"c=quote(c)",
	"",
]

###
void
test_tensor(void)
{
	test(__FILE__, s, sizeof s / sizeof (char *));
}
###
#endif
