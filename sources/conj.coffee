### conj =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
z

General description
-------------------
Returns the complex conjugate of z.

###


Eval_conj = ->
	push(cadr(p1))
	Eval()
	p1 = pop()
	push(p1)
	if (!Find(p1, imaginaryunit)) # example: (-1)^(1/3)
		polar()
		conjugate()
		clockform()
	else
		conjugate()


# careful is you pass this one an expression with
# i (instead of (-1)^(1/2)) then this doesn't work!
conjugate = ->
	push(imaginaryunit)
	push(imaginaryunit)
	negate()
	subst()
	Eval()
