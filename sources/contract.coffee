### contract =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
a,i,j

General description
-------------------
Contract across tensor indices i.e. returns "a" summed over indices i and j.
If i and j are omitted then 1 and 2 are used.
contract(m) is equivalent to the trace of matrix m.

###



Eval_contract = ->
	push(cadr(p1))
	Eval()
	if (cddr(p1) == symbol(NIL))
		push_integer(1)
		push_integer(2)
	else
		push(caddr(p1))
		Eval()
		push(cadddr(p1))
		Eval()
	contract()

contract = ->
	save()
	yycontract()
	restore()

yycontract = ->
	h = 0
	i = 0
	j = 0
	k = 0
	l = 0
	m = 0
	n = 0
	ndim = 0
	nelem = 0
	ai = []
	an = []

	p3 = pop()
	p2 = pop()
	p1 = pop()

	if (!istensor(p1))
		if (!iszero(p1))
			stop("contract: tensor expected, 1st arg is not a tensor")
		push(zero)
		return

	push(p2)
	l = pop_integer()

	push(p3)
	m = pop_integer()

	ndim = p1.tensor.ndim

	if (l < 1 || l > ndim || m < 1 || m > ndim || l == m \
	|| p1.tensor.dim[l - 1] != p1.tensor.dim[m - 1])
		stop("contract: index out of range")

	l--
	m--

	n = p1.tensor.dim[l]

	# nelem is the number of elements in "b"

	nelem = 1
	for i in [0...ndim]
		if (i != l && i != m)
			nelem *= p1.tensor.dim[i]

	p2 = alloc_tensor(nelem)

	p2.tensor.ndim = ndim - 2

	j = 0
	for i in [0...ndim]
		if (i != l && i != m)
			p2.tensor.dim[j++] = p1.tensor.dim[i]

	a = p1.tensor.elem
	b = p2.tensor.elem

	for i in [0...ndim]
		ai[i] = 0
		an[i] = p1.tensor.dim[i]

	for i in [0...nelem]
		push(zero)
		for j in [0...n]
			ai[l] = j
			ai[m] = j
			h = 0
			for k in [0...ndim]
				h = (h * an[k]) + ai[k]
			push(a[h])
			add()
		b[i] = pop()
		for j in [(ndim - 1)..0]
			if (j == l || j == m)
				continue
			if (++ai[j] < an[j])
				break
			ai[j] = 0

	if (nelem == 1)
		push(b[0])
	else
		push(p2)

