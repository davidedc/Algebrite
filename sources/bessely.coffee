### bessely =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x,n

General description
-------------------

Bessel function of second kind.

###


Eval_bessely = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	bessely()

bessely = ->
	save()
	yybessely()
	restore()

#define X p1
#define N p2

yybessely = ->
	d = 0.0
	n = 0

	p2 = pop()
	p1 = pop()

	push(p2)
	n = pop_integer()

	if (isdouble(p1) && !isNaN(n))
		d = yn(n, p1.d)
		push_double(d)
		return
	
	if (isnegativeterm(p2))
		push_integer(-1)
		push(p2)
		power()
		push_symbol(BESSELY)
		push(p1)
		push(p2)
		negate()
		list(3)
		multiply()
		return

	push_symbol(BESSELY)
	push(p1)
	push(p2)
	list(3)
	return

