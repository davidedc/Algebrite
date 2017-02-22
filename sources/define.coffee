# Store a function definition
#
# Example:
#
#      f(x,y)=x^y
#
# For this definition, p1 points to the following structure.
#
#     p1
#      |
#   ___v__    ______                        ______ 
#  |CONS  |->|CONS  |--------------------->|CONS  |
#  |______|  |______|                      |______|
#      |         |                             |
#   ___v__    ___v__    ______    ______    ___v__    ______    ______
#  |SETQ  |  |CONS  |->|CONS  |->|CONS  |  |CONS  |->|CONS  |->|CONS  |
#  |______|  |______|  |______|  |______|  |______|  |______|  |______|
#                |         |         |         |         |         |
#             ___v__    ___v__    ___v__    ___v__    ___v__    ___v__
#            |SYM f |  |SYM x |  |SYM y |  |POWER |  |SYM x |  |SYM y |
#            |______|  |______|  |______|  |______|  |______|  |______|
#
# the result (in f) is a FUNCTION node
# that contains both the body and the argument list.
#
# We have
#
#	caadr(p1) points to the function name i.e. f
#	cdadr(p1) points to the arguments i.e. the list (x y)
#	caddr(p1) points to the function body i.e. (power x y)



#define F p3 # F points to the function name
#define A p4 # A points to the argument list
#define B p5 # B points to the function body

define_user_function = ->
	p3 = caadr(p1); # p3 is F
	p4 = cdadr(p1); # p4 is A
	p5 = caddr(p1); # p5 is B

	if (!issymbol(p3)) # p3 is F
		stop("function name?")

	# evaluate function body (maybe)

	if (car(p5) == symbol(EVAL))  # p5 is B
		push(cadr(p5));  # p5 is B
		Eval()
		p5 = pop();  # p5 is B

	# note how, unless explicitly forced by an eval,
	# (handled by the if just above)
	# we don't eval/simplify
	# the body.
	# Why? because it's the easiest way
	# to solve scope problems i.e.
	#   x = 0
	#   f(x) = x + 1
	#   f(4) # would reply 1
	# which would need to otherwise
	# be solved by some scope device
	# somehow
	push_symbol(FUNCTION)
	push p5
	push p4
	list(3)
	p5 = pop()


	set_binding(p3, p5);  # p3 is F (function name)  # p4 is A  # p5 is B

	# return value is nil

	push_symbol(NIL)

Eval_function_reference = ->
	push p1

