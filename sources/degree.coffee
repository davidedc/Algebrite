### deg =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p,x

General description
-------------------
Returns the degree of polynomial p(x).

###


Eval_degree = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	p1 = pop()
	if (p1 == symbol(NIL))
		guess()
	else
		push(p1)
	degree()

#-----------------------------------------------------------------------------
#
#	Find the degree of a polynomial
#
#	Input:		tos-2		p(x)
#
#			tos-1		x
#
#	Output:		Result on stack
#
#	Note: Finds the largest numerical power of x. Does not check for
#	weirdness in p(x).
#
#-----------------------------------------------------------------------------

#define POLY p1
#define X p2
#define DEGREE p3

degree = ->
	save()
	p2 = pop()
	p1 = pop()
	p3 = zero
	yydegree(p1)
	push(p3)
	restore()

yydegree = (p) ->
	if (equal(p, p2))
		if (iszero(p3))
			p3 = one
	else if (car(p) == symbol(POWER))
		if (equal(cadr(p), p2) && isnum(caddr(p)) && lessp(p3, caddr(p)))
			p3 = caddr(p)
	else if (iscons(p))
		p = cdr(p)
		while (iscons(p))
			yydegree(car(p))
			p = cdr(p)
