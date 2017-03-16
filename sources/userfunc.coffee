# Evaluate a user defined function


#define F p3 # F is the function body
#define A p4 # A is the formal argument list
#define B p5 # B is the calling argument list
#define S p6 # S is the argument substitution list

# we got here because there was a function invocation and
# it's not been parsed (and consequently tagged) as any
# system function.
# So we are dealing with another function.
# The function could be actually defined, or not yet,
# so we'll deal with both cases.

### d =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept

Parameters
----------
f,x

General description
-------------------
Returns the partial derivative of f with respect to x. x can be a vector e.g. [x,y].

###

Eval_user_function = ->

	# Use "derivative" instead of "d" if there is no user function "d"

	if DEBUG then console.log "Eval_user_function evaluating: " + car(p1)
	if (car(p1) == symbol(SYMBOL_D) && get_binding(symbol(SYMBOL_D)) == symbol(SYMBOL_D))
		Eval_derivative()
		return

	# normally car(p1) is a symbol with the function name
	# but it could be something that has to be
	# evaluated to get to the function definition instead
	# (e.g. the function is an element of an array)
	# so we do an eval to sort it all out. 
	push(car(p1))
	Eval()

	# we expect to find either the body and
	# formula arguments, OR, if the function
	# has not been defined yet, then the
	# function will just contain its own name, as
	# all undefined variables do.
	bodyAndFormalArguments = pop()

	p3 = car(cdr(bodyAndFormalArguments))  # p3 is function body F
	# p4 is the formal argument list
	# that is also contained here in the FUNCTION node 
	p4 = car(cdr(cdr(bodyAndFormalArguments)))

	p5 = cdr(p1); # p5 is B

	# example:
	#  f(x) = x+2
	# then:
	#  p3.toString() = "x + 2"
	#  p4 = x
	#  p5 = 2

	# Undefined function?
	if (bodyAndFormalArguments == car(p1)) # p3 is F
		h = tos
		push(bodyAndFormalArguments); # p3 is F
		p1 = p5; # p5 is B
		while (iscons(p1))
			push(car(p1))
			Eval()
			p1 = cdr(p1)
		list(tos - h)
		return

	# Create the argument substitution list p6(S)

	p1 = p4; # p4 is A
	p2 = p5; # p5 is B
	h = tos
	while (iscons(p1) && iscons(p2))
		push(car(p1))
		push(car(p2))
		# why explicitly Eval the parameters when
		# the body of the function is
		# evalled anyways? Commenting it out. All tests pass...
		#Eval()
		p1 = cdr(p1)
		p2 = cdr(p2)

	list(tos - h)
	p6 = pop(); # p6 is S

	# Evaluate the function body

	push(p3); # p3 is F
	if (iscons(p6)) # p6 is S
		push(p6); # p6 is S
		rewrite_args()
		#console.log "rewritten body: " + stack[tos-1]
	Eval()

# Rewrite by expanding symbols that contain args

rewrite_args = ->
	n = 0
	save()

	# subst. list which is a list
	# where each consecutive pair
	# is what needs to be substituted and with what
	p2 = pop();
	#console.log "subst. list " + p2

	# expr to substitute in i.e. the
	# function body
	p1 = pop();
	#console.log "expr: " + p1

	if (istensor(p1))
		n = rewrite_args_tensor()
		restore()
		return n

	if (iscons(p1))
		h = tos
		if (car(p1) == car(p2))
			# rewrite a function in
			# the body with the one
			# passed from the paramaters
			push_symbol(EVAL)
			push(car(cdr(p2)));
			list(2)
		else
			# if there is no match
			# then no substitution necessary
			push(car(p1));

		# continue recursively to
		# rewrite the rest of the body
		p1 = cdr(p1)
		while (iscons(p1))
			push(car(p1))
			push(p2)
			n += rewrite_args()
			p1 = cdr(p1)
		list(tos - h)
		restore()
		return n

	# ground cases here
	# (apart from function name which has
	# already been substituted as it's in the head
	# of the cons)
	# -----------------

	# If not a symbol then no
	# substitution to be done
	if (!issymbol(p1))
		push(p1)
		restore()
		return 0

	# Here we are in a symbol case
	# so we need to substitute

	# Check if there is a direct match
	# of symbols right away
	p3 = p2
	while (iscons(p3))
		if (p1 == car(p3))
			push(cadr(p3))
			restore()
			return 1
		p3 = cddr(p3)

	# Get the symbol's content, if _that_
	# matches then do the substitution
	p3 = get_binding(p1)
	push(p3)
	if (p1 != p3)
		push(p2); # subst. list
		n = rewrite_args()
		if (n == 0)
			pop()
			push(p1); # restore if not rewritten with arg

	restore()
	return n

rewrite_args_tensor = ->
	n = 0
	i = 0
	push(p1)
	copy_tensor()
	p1 = pop()
	for i in [0...p1.tensor.nelem]
		push(p1.tensor.elem[i])
		push(p2)
		n += rewrite_args()
		p1.tensor.elem[i] = pop()

	check_tensor_dimensions p1

	push(p1)
	return n
