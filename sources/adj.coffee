### adj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
m

General description
-------------------
Returns the adjunct of matrix m. The inverse of m is equal to adj(m) divided by det(m).

###


Eval_adj = ->
	push(cadr(p1))
	Eval()
	adj()

adj = ->
	i = 0
	j = 0
	n = 0

	save()

	p1 = pop()

	if (istensor(p1) && p1.tensor.ndim == 2 && p1.tensor.dim[0] == p1.tensor.dim[1])
		doNothing = 1
	else
		stop("adj: square matrix expected")

	n = p1.tensor.dim[0]

	p2 = alloc_tensor(n * n)

	p2.tensor.ndim = 2
	p2.tensor.dim[0] = n
	p2.tensor.dim[1] = n

	for i in [0...n]
		for j in [0...n]
			cofactor(p1, n, i, j)
			p2.tensor.elem[n * j + i] = pop(); # transpose

	push(p2)

	restore()


