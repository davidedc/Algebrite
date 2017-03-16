### erf =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Authors
-------
philippe.billet@noos.fr

Parameters
----------
x

General description
-------------------
Error function erf(x).
erf(-x)=erf(x)

###



Eval_erf = ->
	push(cadr(p1))
	Eval()
	yerf()

yerf = ->
	save()
	yyerf()
	restore()

yyerf = ->
	d = 0.0

	p1 = pop()

	if (isdouble(p1))
		d = 1.0 - erfc(p1.d)
		push_double(d)
		return

	if (isnegativeterm(p1))
		push_symbol(ERF)
		push(p1)
		negate()
		list(2)
		negate()
		return
	
	push_symbol(ERF)
	push(p1)
	list(2)
	return

