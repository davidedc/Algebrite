# this function extract parts subtrees from a tree.
# It is used in two
# places that have to do with pattern matching.
# One is for integrals, where an expression or its
# subparts are matched against cases in an
# integrals table.
# Another one is for applyging tranformation patterns
# defined via PATTERN, again patterns are applied to
# either the whole expression or any of its parts.



# unclear to me at the moment
# why this is exposed as something that can
# be evalled. Never called.

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


pushTryNotToDuplicate = (toBePushed) ->
	if tos > 0
		if DEBUG then console.log "comparing " + toBePushed + " to: " + stack[tos-1]
		if equal(toBePushed, stack[tos-1])
			if DEBUG then console.log "skipping " + toBePushed + " because it's already on stack "
			return
	push(toBePushed)


# returns constant expressions on the stack

decomp = (generalTransform) ->
	save()

	p2 = pop()
	p1 = pop()

	if DEBUG then console.log "DECOMPOSING " + p1

	# is the entire expression constant?

	if generalTransform
		if !iscons(p1)
			if DEBUG then console.log " ground thing: " + p1
			pushTryNotToDuplicate p1
			restore()
			return
	else
		if (Find(p1, p2) == 0)
			if DEBUG then console.log " entire expression is constant"
			pushTryNotToDuplicate(p1)
			#push(p1);	# may need later for pushing both +a, -a
			#negate()
			restore()
			return

	# sum?

	if (isadd(p1))
		decomp_sum(generalTransform)
		restore()
		return

	# product?

	if (ismultiply(p1))
		decomp_product(generalTransform)
		restore()
		return

	# naive decomp if not sum or product

	if DEBUG then console.log " naive decomp"
	p3 = cdr(p1)
	if DEBUG then console.log "startig p3: " + p3
	while (iscons(p3))

		# for a general transformations,
		# we want to match any part of the tree so
		# we need to push the subtree as well
		# as recurse to its parts
		if generalTransform
			push(car(p3))

		if DEBUG then console.log "recursive decomposition"
		push(car(p3))
		
		if DEBUG then console.log "car(p3): " + car(p3)
		push(p2)
		if DEBUG then console.log "p2: " + p2
		decomp(generalTransform)
		p3 = cdr(p3)

	restore()

decomp_sum = (generalTransform) ->
	if DEBUG then console.log " decomposing the sum "
	h = 0


	# decomp terms involving x

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2) or generalTransform)
			push(car(p3))
			push(p2)
			decomp(generalTransform)
		p3 = cdr(p3)

	# add together all constant terms

	h = tos

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2) == 0)
			pushTryNotToDuplicate(car(p3))
		p3 = cdr(p3)

	if (tos - h)
		add_all(tos - h)
		p3 = pop()
		pushTryNotToDuplicate(p3)
		push(p3)
		negate();	# need both +a, -a for some integrals

decomp_product = (generalTransform) ->
	if DEBUG then console.log " decomposing the product "
	h = 0

	# decomp factors involving x

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2) or generalTransform)
			push(car(p3))
			push(p2)
			decomp(generalTransform)
		p3 = cdr(p3)

	# multiply together all constant factors

	h = tos

	p3 = cdr(p1)

	while (iscons(p3))
		if (Find(car(p3), p2) == 0)
			pushTryNotToDuplicate(car(p3))
		p3 = cdr(p3)

	if (tos - h)
		multiply_all(tos - h)
		#p3 = pop();	# may need later for pushing both +a, -a
		#push(p3)
		#push(p3)
		#negate()
