### arcsinh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse hyperbolic sine of x.

###

Eval_arcsinh = ->
	push(cadr(p1))
	Eval()
	arcsinh()

arcsinh = ->
	d = 0.0
	save()
	p1 = pop()
	if (car(p1) == symbol(SINH))
		push(cadr(p1))
		restore()
		return

	if (isdouble(p1))
		d = p1.d
		d = Math.log(d + Math.sqrt(d * d + 1.0))
		push_double(d)
		restore()
		return

	if (iszero(p1))
		push(zero)
		restore()
		return

	push_symbol(ARCSINH)
	push(p1)
	list(2)
	restore()


