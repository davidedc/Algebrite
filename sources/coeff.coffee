### coeff =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
p,x,n

General description
-------------------
Returns the coefficient of x^n in polynomial p. The x argument can be omitted for polynomials in x.

###



#define P p1
#define X p2
#define N p3

Eval_coeff = ->
	push(cadr(p1));			# 1st arg, p
	Eval()

	push(caddr(p1));		# 2nd arg, x
	Eval()

	push(cadddr(p1));		# 3rd arg, n
	Eval()

	p3 = pop(); # p3 is N
	p2 = pop(); # p2 is X
	p1 = pop(); # p1 is P

	if (p3 == symbol(NIL))	 # p3 is N	# only 2 args?
		p3 = p2;  # p2 is X  # p3 is N
		p2 = symbol(SYMBOL_X);  # p2 is X

	push(p1);  # p1 is P			# divide p by x^n
	push(p2);  # p2 is X
	push(p3);  # p3 is N
	power()
	divide()

	push(p2);  # p2 is X			# keep the constant part
	filter()

#-----------------------------------------------------------------------------
#
#	Put polynomial coefficients on the stack
#
#	Input:	tos-2		p(x) (the polynomial)
#
#			tos-1		x (the variable)
#
#	Output:		Returns number of coefficients on stack
#
#			tos-n		Coefficient of x^0
#
#			tos-1		Coefficient of x^(n-1)
#
#-----------------------------------------------------------------------------

coeff = ->

	save()

	p2 = pop()
	p1 = pop()

	h = tos

	while 1

		push(p1)
		push(p2)
		push(zero)
		subst()
		Eval()

		p3 = pop()
		push(p3)

		push(p1)
		push(p3)
		subtract()

		p1 = pop()

		if (equal(p1, zero))
			n = tos - h
			restore()
			return n

		push(p1)
		push(p2)
		prev_expanding = expanding
		expanding = 1
		divide()
		expanding = prev_expanding
		#console.log("just divided: " + stack[tos-1].toString())
		p1 = pop()


