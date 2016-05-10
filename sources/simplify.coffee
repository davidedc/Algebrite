

Eval_simplify = ->
	push(cadr(p1))
	Eval()
	simplify()

simplify = ->
	save()
	simplify_main()
	restore()

simplify_main = ->
	p1 = pop()

	if (istensor(p1))
		simplify_tensor()
		return

	if (Find(p1, symbol(FACTORIAL)))
		push(p1)
		simfac()
		p2 = pop()
		push(p1)
		rationalize()
		simfac()
		p3 = pop()
		if (count(p2) < count(p3))
			p1 = p2
		else
			p1 = p3

	f1()
	f2()
	f3()
	f4()
	f5()
	f9()
	simplify_polarRect()

	push(p1)

simplify_tensor = ->
	i = 0
	p2 = alloc_tensor(p1.tensor.nelem)
	p2.tensor.ndim = p1.tensor.ndim
	for i in [0...p1.tensor.ndim]
		p2.tensor.dim[i] = p1.tensor.dim[i]
	for i in [0...p1.tensor.nelem]
		push(p1.tensor.elem[i])
		simplify()
		p2.tensor.elem[i] = pop()

	if p2.tensor.nelem != p2.tensor.elem.length
		console.log "something wrong in tensor dimensions"
		debugger

	if (iszero(p2))
		p2 = zero; # null tensor becomes scalar zero
	push(p2)

count = (p) ->
	if (iscons(p))
		n = 0
		while (iscons(p))
			n += count(car(p)) + 1
			p = cdr(p)
	else
		n = 1
	return n

# try rationalizing

f1 = ->
	if (car(p1) != symbol(ADD))
		return
	push(p1)
	rationalize()
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2

# try condensing

f2 = ->
	if (car(p1) != symbol(ADD))
		return
	push(p1)
	Condense()
	p2 = pop()
	if (count(p2) <= count(p1))
		p1 = p2

# this simplifies forms like (A-B) / (B-A)

f3 = ->
	push(p1)
	rationalize()
	negate()
	rationalize()
	negate()
	rationalize()
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2

# try expanding denominators

f4 = ->
	if (iszero(p1))
		return
	push(p1)
	rationalize()
	inverse()
	rationalize()
	inverse()
	rationalize()
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2

# simplifies trig forms

simplify_trig = ->
	save()
	p1 = pop()
	f5()
	push(p1)
	restore()

f5 = ->
	if (Find(p1, symbol(SIN)) == 0 && Find(p1, symbol(COS)) == 0)
		return

	p2 = p1

	trigmode = 1
	push(p2)
	Eval()
	p3 = pop()

	trigmode = 2
	push(p2)
	Eval()
	p4 = pop()

	trigmode = 0

	if (count(p4) < count(p3) || nterms(p4) < nterms(p3))
		p3 = p4

	if (count(p3) < count(p1) || nterms(p3) < nterms(p1))
		p1 = p3

# if it's a sum then try to simplify each term

f9 = ->
	if (car(p1) != symbol(ADD))
		return
	push_integer(0)
	p2 = cdr(p1)
	while (iscons(p2))
		push(car(p2))
		simplify()
		add()
		p2 = cdr(p2)
	p2 = pop()
	if (count(p2) < count(p1))
		p1 = p2

simplify_polarRect = ->
	push(p1)
	polarRectAMinusOneBase()
	Eval()

	p2 = pop(); # put new (hopefully simplified expr) in p2

	if (count(p2) < count(p1))
		p1 = p2

polarRectAMinusOneBase = ->
	save()
	p1 = pop()
	
	if isimaginaryunit(p1)
		push(p1)
		restore()
		return

	if (equal(car(p1), symbol(POWER)) and isminusone(cadr(p1)) )

		# base we just said is minus 1
		push(one)
		negate()

		# exponent
		push(caddr(p1))
		polarRectAMinusOneBase()
		
		power()
		# try to simplify it using polar and rect
		polar()
		rect()

	else if (iscons(p1))
		h = tos
		while (iscons(p1))
			#console.log("recursing on: " + car(p1).toString())
			push(car(p1))
			polarRectAMinusOneBase()
			#console.log("...transformed into: " + stack[tos-1].toString())
			p1 = cdr(p1)
		list(tos - h)
	else
		push(p1)

	restore()
	return

nterms = (p) ->
	if (car(p) != symbol(ADD))
		return 1
	else
		return length(p) - 1

