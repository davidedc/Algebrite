### defint =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
f,x,a,b[,y,c,d...]

General description
-------------------
Returns the definite integral of f with respect to x evaluated from "a" to b.
The argument list can be extended for multiple integrals (or "iterated
integrals"), for example a double integral (which can represent for
example a volume under a surface), or a triple integral, etc. For
example, defint(f,x,a,b,y,c,d).

###



#define F p2
#define X p3
#define A p4
#define B p5

Eval_defint = ->
	push(cadr(p1))
	Eval()
	p2 = pop() # p2 is F

	p1 = cddr(p1)

	# defint can handle multiple
	# integrals, so we loop over the
	# multiple integrals here
	while (iscons(p1))

		push(car(p1))
		p1 = cdr(p1)
		Eval()
		p3 = pop() # p3 is X

		push(car(p1))
		p1 = cdr(p1)
		Eval()
		p4 = pop() # p4 is A

		push(car(p1))
		p1 = cdr(p1)
		Eval()
		p5 = pop() # p5 is B

		# obtain the primitive of F against the
		# specified variable X
		# note that the primitive changes over
		# the calculation of the multiple
		# integrals.
		push(p2)
		push(p3)
		integral()
		p2 = pop() # contains the antiderivative of F

		# evaluate the integral in A
		push(p2)
		push(p3)
		push(p5)
		subst()
		Eval()

		# evaluate the integral in B
		push(p2)
		push(p3)
		push(p4)
		subst()
		Eval()

		# integral between B and A is the
		# subtraction. Note that this could
		# be a number but also a function.
		# and we might have to integrate this
		# number/function again doing the while
		# loop again if this is a multiple
		# integral.
		subtract()
		p2 = pop()

	push(p2)


