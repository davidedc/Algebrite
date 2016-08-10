

# unclear to me at the moment
# why this is exposed as something that can
# be evalled

Eval_decomp = ->
	save()
	console.log "Eval_decomp is being called!!!!!!!!!!!!!!!!!!!!"
	h = tos
	push(symbol(NIL))
	push(cadr(p1))
	Eval()
	push(caddr(p1))
	Eval()
	p1 = pop()
	if (p1 == symbol(NIL))
		guess()
	else
		push(p1)
	decomp(false)
	list(tos - h)
	restore()

# returns constant expressions on the stack

decomp = (generalTransform) ->
	save()

	p2 = pop()
	p1 = pop()

	if DEBUG then console.log "DECOMPOSING " + p1

	# is the entire expression constant?

	if !generalTransform
		if (Find(p1, p2) == 0)
			if DEBUG then console.log "entire expression is constant"
			push(p1)
			#push(p1);	# may need later for pushing both +a, -a
			#negate()
			restore()
			return
	else
		if !iscons(p1)
			if DEBUG then console.log "ground thing: " + p1
			push p1
			restore()
			return

	# sum?

	if (isadd(p1))
		decomp_sum(generalTransform)
		restore()
		return

	# product?

	if (car(p1) == symbol(MULTIPLY))
		decomp_product(generalTransform)
		restore()
		return

	# naive decomp if not sum or product

	if DEBUG then console.log "naive decomp"
	p3 = cdr(p1)
	if DEBUG then console.log "startig p3: " + p3
	while (iscons(p3))
		if DEBUG then console.log "recursive decomposition"
		push(car(p3))
		if DEBUG then console.log "car(p3): " + car(p3)
		push(p2)
		if DEBUG then console.log "p2: " + p2
		decomp(generalTransform)
		p3 = cdr(p3)

	restore()

decomp_sum = (generalTransform) ->
	h = 0

	# decomp terms involving x

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2))
			push(car(p3))
			push(p2)
			decomp(generalTransform)
		p3 = cdr(p3)

	# add together all constant terms

	h = tos

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2) == 0)
			push(car(p3))
		p3 = cdr(p3)

	if (tos - h)
		add_all(tos - h)
		p3 = pop()
		push(p3)
		push(p3)
		negate();	# need both +a, -a for some integrals

decomp_product = (generalTransform) ->
	h = 0

	# decomp factors involving x

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2))
			push(car(p3))
			push(p2)
			decomp(generalTransform)
		p3 = cdr(p3)

	# multiply together all constant factors

	h = tos

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2) == 0)
			push(car(p3))
		p3 = cdr(p3)

	if (tos - h)
		multiply_all(tos - h)
		#p3 = pop();	# may need later for pushing both +a, -a
		#push(p3)
		#push(p3)
		#negate()
