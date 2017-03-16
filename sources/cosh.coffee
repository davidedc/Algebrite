### cosh =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the hyperbolic cosine of x

```
	          exp(x) + exp(-x)
	cosh(x) = ----------------
	                 2
```

###

Eval_cosh = ->
	push(cadr(p1))
	Eval()
	ycosh()

ycosh = ->
	save()
	yycosh()
	restore()

yycosh = ->
	d = 0.0
	p1 = pop()
	if (car(p1) == symbol(ARCCOSH))
		push(cadr(p1))
		return
	if (isdouble(p1))
		d = Math.cosh(p1.d)
		if (Math.abs(d) < 1e-10)
			d = 0.0
		push_double(d)
		return
	if (iszero(p1))
		push(one)
		return
	push_symbol(COSH)
	push(p1)
	list(2)

