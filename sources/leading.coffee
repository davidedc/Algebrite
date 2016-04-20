###
 Return the leading coefficient of a polynomial.

Example

	leading(5x^2+x+1,x)

Result

	5

The result is undefined if P is not a polynomial.
###

Eval_leading = ->
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	p1 = pop()
	if (p1 == symbol(NIL))
		guess()
	else
		push(p1)
	leading()

#define P p1
#define X p2
#define N p3

leading = ->
	save()

	p2 = pop()
	p1 = pop()

	push(p1)	# N = degree of P
	push(p2)
	degree()
	p3 = pop()

	push(p1)	# divide through by X ^ N
	push(p2)
	push(p3)
	power()
	divide()

	push(p2)	# remove terms that depend on X
	filter()

	restore()
