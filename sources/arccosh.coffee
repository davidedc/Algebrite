### arccosh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the inverse hyperbolic cosine of x.

###

Eval_arccosh = ->
	push(cadr(p1))
	Eval()
	arccosh()

arccosh = ->
	d = 0.0
	save()
	p1 = pop()
	if (car(p1) == symbol(COSH))
		push(cadr(p1))
		restore()
		return

	if (isdouble(p1))
		d = p1.d
		if (d < 1.0)
			stop("arccosh function argument is less than 1.0")
		d = Math.log(d + Math.sqrt(d * d - 1.0))
		push_double(d)
		restore()
		return

	if (isplusone(p1))
		push(zero)
		restore()
		return

	push_symbol(ARCCOSH)
	push(p1)
	list(2)
	restore()


