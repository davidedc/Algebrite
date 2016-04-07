###
Remove terms that involve a given symbol or expression. For example...

	filter(x^2 + x + 1, x)		=>	1

	filter(x^2 + x + 1, x^2)	=>	x + 1
###



Eval_filter = ->
	p1 = cdr(p1)
	push(car(p1))
	Eval()
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		filter()
		p1 = cdr(p1)

###
 For example...

	push(F)
	push(X)
	filter()
	F = pop()
###

filter = ->
	save()
	p2 = pop()
	p1 = pop()
	filter_main()
	restore()

filter_main = ->
	if (car(p1) == symbol(ADD))
		filter_sum()
	else if (istensor(p1))
		filter_tensor()
	else if (Find(p1, p2))
		push_integer(0)
	else
		push(p1)

filter_sum = ->
	push_integer(0)
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		push(p2)
		filter()
		add()
		p1 = cdr(p1)

filter_tensor = ->
	i = 0
	n = 0
	n = p1.tensor.nelem
	p3 = alloc_tensor(n)
	p3.tensor.ndim = p1.tensor.ndim
	for i in [0...p1.tensor.ndim]
		p3.tensor.dim[i] = p1.tensor.dim[i]
	for i in [0...n]
		push(p1.tensor.elem[i])
		push(p2)
		filter()
		p3.tensor.elem[i] = pop()
	push(p3)
