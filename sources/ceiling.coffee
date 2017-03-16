### ceiling =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Returns the smallest integer not less than x.

###


Eval_ceiling = ->
	push(cadr(p1))
	Eval()
	ceiling()

ceiling = ->
	save()
	yyceiling()
	restore()

yyceiling = ->
	d = 0.0

	p1 = pop()

	if (!isnum(p1))
		push_symbol(CEILING)
		push(p1)
		list(2)
		return

	if (isdouble(p1))
		d = Math.ceil(p1.d)
		push_double(d)
		return

	if (isinteger(p1))
		push(p1)
		return

	p3 = new U()
	p3.k = NUM
	p3.q.a = mdiv(p1.q.a, p1.q.b)
	p3.q.b = mint(1)
	push(p3)

	if (isnegativenumber(p1))
		doNothing = 1
	else
		push_integer(1)
		add()


