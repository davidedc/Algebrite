### denominator =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------
Returns the denominator of expression x.

###


Eval_denominator = ->
	push(cadr(p1))
	Eval()
	denominator()

denominator = ->
	h = 0

	save()

	p1 = pop()
	#console.trace "denominator of: " + p1

	if (car(p1) == symbol(ADD))
		push(p1)
		rationalize()
		p1 = pop()

	if (car(p1) == symbol(MULTIPLY) and !isplusone(car(cdr(p1))))
		h = tos
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			denominator()
			p1 = cdr(p1)
		multiply_all(tos - h)
	else if (isrational(p1))
		push(p1)
		mp_denominator()
	else if (car(p1) == symbol(POWER) && isnegativeterm(caddr(p1)))
		push(p1)
		reciprocate()
	else
		push(one)

	restore()

