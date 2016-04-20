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
# We have
#
#	caadr(p1) points to f
#	cdadr(p1) points to the list (x y)
#	caddr(p1) points to (power x y)



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

	set_binding_and_arglist(p3, p5, p4);  # p3 is F  # p4 is A  # p5 is B

	# return value is nil

	push_symbol(NIL)
