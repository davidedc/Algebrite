###
 Symbolic addition

	Terms in a sum are combined if they are identical modulo rational
	coefficients.

	For example, A + 2A becomes 3A.

	However, the sum A + sqrt(2) A is not modified.

	Combining terms can lead to second-order effects.

	For example, consider the case of

		1/sqrt(2) A + 3/sqrt(2) A + sqrt(2) A

	The first two terms are combined to yield 2 sqrt(2) A.

	This result can now be combined with the third term to yield

		3 sqrt(2) A
###



flag = 0

Eval_add = ->
	h = tos
	p1 = cdr(p1)
	while (iscons(p1))
		push(car(p1))
		Eval()
		p2 = pop()
		push_terms(p2)
		p1 = cdr(p1)
	add_terms(tos - h)

# Add n terms, returns one expression on the stack.

stackAddsCount = 0
add_terms = (n) ->
	stackAddsCount++
	i = 0

	h = tos - n

	s = h

	# ensure no infinite loop, use "for"

	if DEBUG then console.log "stack before adding terms #" + stackAddsCount
	#if stackAddsCount == 137
	#	debugger

	if DEBUG
		for i in [0...tos]
			console.log print_list stack[i]

	for i in [0...10]

		if (n < 2)
			break

		flag = 0


		#qsort(s, n, sizeof (U *), cmp_terms)
		subsetOfStack = stack.slice(h,h+n)
		subsetOfStack.sort(cmp_terms)
		stack = stack.slice(0,h).concat(subsetOfStack).concat(stack.slice(h+n))

		if (flag == 0)
			break

		n = combine_terms(h, n)

	moveTos h + n

	switch (n)
		when 0
			if evaluatingAsFloats then push_double(0.0) else push(zero)
		when 1
		else
			list(n)
			p1 = pop()
			push_symbol(ADD)
			push(p1)
			cons()

	if DEBUG then console.log "stack after adding terms #" + stackAddsCount
	#if stackAddsCount == 5
	#	debugger

	if DEBUG
		for i in [0...tos]
			console.log print_list stack[i]

# Compare terms for order, clobbers p1 and p2.

cmp_terms_count = 0
cmp_terms = (p1, p2) ->
	cmp_terms_count++
	#if cmp_terms_count == 52
	#	debugger

	i = 0
	# numbers can be combined

	if (isnum(p1) && isnum(p2))
		flag = 1
		#if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 0"
		return 0

	# congruent tensors can be combined

	if (istensor(p1) && istensor(p2))
		if (p1.tensor.ndim < p2.tensor.ndim)
			#if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns -1"
			return -1
		if (p1.tensor.ndim > p2.tensor.ndim)
			#if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 1"
			return 1
		for i in [0...p1.tensor.ndim]
			if (p1.tensor.dim[i] < p2.tensor.dim[i])
				#if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns -1"
				return -1
			if (p1.tensor.dim[i] > p2.tensor.dim[i])
				#if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 1"
				return 1
		flag = 1
		#if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns 0"
		return 0

	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1)
		if (isnum(car(p1)))
			p1 = cdr(p1)
			if (cdr(p1) == symbol(NIL))
				p1 = car(p1)

	if (car(p2) == symbol(MULTIPLY))
		p2 = cdr(p2)
		if (isnum(car(p2)))
			p2 = cdr(p2)
			if (cdr(p2) == symbol(NIL))
				p2 = car(p2)

	t = cmp_expr(p1, p2)

	if (t == 0)
		flag = 1

	#if DEBUG then console.log "cmp_terms #" + cmp_terms_count + " returns " + t
	return t

###
 Compare adjacent terms in s[] and combine if possible.

	Returns the number of terms remaining in s[].

	n	number of terms in s[] initially
###

combine_terms = (s, n) ->

	#debugger

	# I had to turn the coffeescript for loop into
	# a more mundane while loop because the i
	# variable was changed from within the body,
	# which is something that is not supposed to
	# happen in the coffeescript 'vector' form.
	# Also this means I had to add a 'i++' jus before
	# the end of the body and before the "continue"s
	i=0
	while i < (n-1)
		check_esc_flag()

		p3 = stack[s+i]
		p4 = stack[s+i + 1]

		if (istensor(p3) && istensor(p4))
			push(p3)
			push(p4)
			tensor_plus_tensor()
			p1 = pop()
			if (p1 != symbol(NIL))
				stack[s+i] = p1
				for j in [(i + 1)...(n - 1)]
					stack[s+j] = stack[s+j + 1]
				n--
				i--

			i++
			continue

		if (istensor(p3) || istensor(p4))

			i++
			continue

		if (isnum(p3) && isnum(p4))
			push(p3)
			push(p4)
			add_numbers()
			p1 = pop()
			if (iszero(p1))
				for j in [i...(n - 2)]
					stack[s+j] = stack[s+j + 2]
				n -= 2
			else
				stack[s+i] = p1
				for j in [(i + 1)...(n - 1)]
					stack[s+j] = stack[s+j + 1]
				n--
			i--

			i++
			continue

		if (isnum(p3) || isnum(p4))

			i++
			continue

		if evaluatingAsFloats
			p1 = one_as_double
			p2 = one_as_double
		else
			p1 = one
			p2 = one

		t = 0

		if (car(p3) == symbol(MULTIPLY))
			p3 = cdr(p3)
			t = 1; # p3 is now denormal
			if (isnum(car(p3)))
				p1 = car(p3)
				p3 = cdr(p3)
				if (cdr(p3) == symbol(NIL))
					p3 = car(p3)
					t = 0

		if (car(p4) == symbol(MULTIPLY))
			p4 = cdr(p4)
			if (isnum(car(p4)))
				p2 = car(p4)
				p4 = cdr(p4)
				if (cdr(p4) == symbol(NIL))
					p4 = car(p4)

		if (!equal(p3, p4))

			i++
			continue

		push(p1)
		push(p2)
		add_numbers()

		p1 = pop()

		if (iszero(p1))
			for j in [i...(n - 2)]
				stack[s+j] = stack[s+j + 2]
			n -= 2
			i--

			i++
			continue

		push(p1)

		if (t)
			push(symbol(MULTIPLY))
			push(p3)
			cons()
		else
			push(p3)

		multiply()

		stack[s+i] = pop()

		for j in [(i + 1)...(n - 1)]
			stack[s+j] = stack[s+j + 1]

		n--
		i--

	  	# this i++ is to match the while
		i++

	return n

push_terms = (p) ->
	if (car(p) == symbol(ADD))
		p = cdr(p)
		while (iscons(p))
			push(car(p))
			p = cdr(p)
	else if (!iszero(p))
		push(p)

# add two expressions

add = ->
	save()
	p2 = pop()
	p1 = pop()
	h = tos
	push_terms(p1)
	push_terms(p2)
	add_terms(tos - h)
	restore()

add_all = (k) ->
	i = 0
	save()
	s = tos - k
	h = tos
	for i in [0...k]
		push_terms(stack[s+i])
	add_terms(tos - h)
	p1 = pop()
	moveTos tos - k
	push(p1)
	restore()

subtract = ->
	negate()
	add()
