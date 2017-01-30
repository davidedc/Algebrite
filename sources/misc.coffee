

# s is a string
new_string = (s) ->
	save()
	p1 = new U()
	p1.k = STR
	p1.str = s
	push(p1)
	restore()

out_of_memory = ->
	stop("out of memory")

# both ints
push_zero_matrix = (i,j) ->
	push(alloc_tensor(i * j))
	stack[tos - 1].tensor.ndim = 2
	stack[tos - 1].tensor.dim[0] = i
	stack[tos - 1].tensor.dim[1] = j

push_identity_matrix = (n) ->
	push_zero_matrix(n, n)
	i = 0
	for i in [0...n]
		stack[tos - 1].tensor.elem[i * n + i] = one

	check_tensor_dimensions stack[tos - 1]

push_cars = (p) ->
	while (iscons(p))
		push(car(p))
		p = cdr(p)

peek = ->
	save()
	p1 = pop()
	push(p1)
	restore()

# see cmp_expr definition, this
# function alone just does simple structure comparison
# or compares numbers (either rationals or integers or doubles)
# but can't be used alone to test
# more complex mathematical equalities...
equal = (p1,p2) ->
	if (cmp_expr(p1, p2) == 0)
		return 1
	else
		return 0

lessp = (p1,p2) ->
	if (cmp_expr(p1, p2) < 0)
		return 1
	else
		return 0

sign = (n) ->
	if (n < 0)
		return -1
	else if (n > 0)
		return 1
	else
		return 0

# compares whether two expressions
# have the same structure.
# For example this method alone
# would compare "1+1" and "2"
# as different.
# It just so happens though that one oftens
# evaluates the two sides before passing them
# to this function, so chances are that the two
# sides have the same normal form.
# Even a simple evaluation might not cut it
# though... a simplification of both sides
# would then help. And even that might not
# cut it in some cases...
cmp_expr = (p1, p2) ->
	n = 0

	if (p1 == p2)
		return 0

	if (p1 == symbol(NIL))
		return -1

	if (p2 == symbol(NIL))
		return 1

	if (isnum(p1) && isnum(p2))
		return sign(compare_numbers(p1, p2))

	if (isnum(p1))
		return -1

	if (isnum(p2))
		return 1

	if (isstr(p1) && isstr(p2))
		return sign(strcmp(p1.str,p2.str))

	if (isstr(p1))
		return -1

	if (isstr(p2))
		return 1

	if (issymbol(p1) && issymbol(p2))
		return sign(strcmp(get_printname(p1),get_printname(p2)))

	if (issymbol(p1))
		return -1

	if (issymbol(p2))
		return 1

	if (istensor(p1) && istensor(p2))
		return compare_tensors(p1, p2)

	if (istensor(p1))
		return -1

	if (istensor(p2))
		return 1

	# recursion here
	while (iscons(p1) && iscons(p2))
		n = cmp_expr(car(p1), car(p2))
		if (n != 0)
			return n
		p1 = cdr(p1)
		p2 = cdr(p2)

	if (iscons(p2))
		return -1

	if (iscons(p1))
		return 1

	return 0

length = (p) ->
	n = 0
	while (iscons(p))
		p = cdr(p)
		n++
	return n

unique = (p) ->
	save()
	p1 = symbol(NIL)
	p2 = symbol(NIL)
	unique_f(p)
	if (p2 != symbol(NIL))
		p1 = symbol(NIL)
	p = p1
	restore()
	return p

unique_f = (p) ->
	if (isstr(p))
		if (p1 == symbol(NIL))
			p1 = p
		else if (p != p1)
			p2 = p
		return
	while (iscons(p))
		unique_f(car(p))
		if (p2 != symbol(NIL))
			return
		p = cdr(p)


ssqrt = ->
	push_rational(1, 2)
	power()

yyexpand = ->
	prev_expanding = expanding
	expanding = 1
	Eval()
	expanding = prev_expanding

exponential = ->
	push_symbol(E)
	swap()
	power()

square = ->
	push_integer(2)
	power()

#__cmp = (p1, p2) ->
#	return cmp_expr(p1, p2)

# n an integer
sort_stack = (n) ->
	#qsort(stack + tos - n, n, sizeof (U *), __cmp)

	h = tos - n
	subsetOfStack = stack.slice(h,h+n)
	subsetOfStack.sort(cmp_expr)
	stack = stack.slice(0,h).concat(subsetOfStack).concat(stack.slice(h+n))


$.equal = equal
$.length = length
