### arctanh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse hyperbolic tangent of x.

###

Eval_arctanh = ->
	push(cadr(p1))
	Eval()
	arctanh()

arctanh = ->
	d = 0.0
	save()
	p1 = pop()
	if (car(p1) == symbol(TANH))
		push(cadr(p1))
		restore()
		return

	if (isdouble(p1))
		d = p1.d
		if (d < -1.0 || d > 1.0)
			stop("arctanh function argument is not in the interval [-1,1]")
		d = Math.log((1.0 + d) / (1.0 - d)) / 2.0
		push_double(d)
		restore()
		return

	if (iszero(p1))
		push(zero)
		restore()
		return

	push_symbol(ARCTANH)
	push(p1)
	list(2)
	restore()



