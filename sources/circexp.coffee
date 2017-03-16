### circexp =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
x

General description
-------------------

Returns expression x with circular and hyperbolic functions converted to exponential forms. Sometimes this will simplify an expression.

###


Eval_circexp = ->
	push(cadr(p1))
	Eval()

	circexp()

	# normalize

	Eval()

circexp = ->
	i = 0
	h = 0
	save()
	p1 = pop()

	if (car(p1) == symbol(COS))
		push(cadr(p1))
		expcos()
		restore()
		return

	if (car(p1) == symbol(SIN))
		push(cadr(p1))
		expsin()
		restore()
		return

	if (car(p1) == symbol(TAN))
		p1 = cadr(p1)
		push(imaginaryunit)
		push(p1)
		multiply()
		exponential()
		p2 = pop()
		push(imaginaryunit)
		push(p1)
		multiply()
		negate()
		exponential()
		p3 = pop()
		push(p3)
		push(p2)
		subtract()
		push(imaginaryunit)
		multiply()
		push(p2)
		push(p3)
		add()
		divide()
		restore()
		return

	if (car(p1) == symbol(COSH))
		p1 = cadr(p1)
		push(p1)
		exponential()
		push(p1)
		negate()
		exponential()
		add()
		push_rational(1, 2)
		multiply()
		restore()
		return

	if (car(p1) == symbol(SINH))
		p1 = cadr(p1)
		push(p1)
		exponential()
		push(p1)
		negate()
		exponential()
		subtract()
		push_rational(1, 2)
		multiply()
		restore()
		return

	if (car(p1) == symbol(TANH))
		p1 = cadr(p1)
		push(p1)
		push_integer(2)
		multiply()
		exponential()
		p1 = pop()
		push(p1)
		push_integer(1)
		subtract()
		push(p1)
		push_integer(1)
		add()
		divide()
		restore()
		return

	if (iscons(p1))
		h = tos
		while (iscons(p1))
			push(car(p1))
			circexp()
			p1 = cdr(p1)
		list(tos - h)
		restore()
		return

	if (p1.k == TENSOR)
		push(p1)
		copy_tensor()
		p1 = pop()
		for i in [0...p1.tensor.nelem]
			push(p1.tensor.elem[i])
			circexp()
			p1.tensor.elem[i] = pop()
		push(p1)
		restore()
		return

	push(p1)
	restore()


