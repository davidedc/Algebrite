

if !inited
	inited = true
	init()


$.init = init

parse_internal = (argu) ->
	if typeof argu == 'string'
		scan(argu)
		# now its in the stack
	else if typeof argu == 'number'
		if argu % 1 == 0
			push_integer(argu)
		else
			push_double(argu)
	else if argu instanceof U
		# hey look its a U
		push(argu)
	else
		console.warn('unknown argument type', argu)
		push(symbol(NIL))

parse = (argu) ->
	try
		parse_internal(argu)
		data = pop()
		check_stack()
	catch error
		reset_after_error()
		throw error
	return data

# exec handles the running ia JS of all the algebrite
# functions. The function name is passed in "name" and
# the corresponding function is pushed at the top of the stack
exec = (name, argus...) ->
	fn = get_binding(usr_symbol(name))
	check_stack()
	push(fn)

	for argu in argus
		parse_internal(argu)
	
	list(1 + argus.length)
	
	p1 = pop()
	push(p1)
	
	try
		fixed_top_level_eval()
		result = pop()
		check_stack()
	catch error
		reset_after_error()
		throw error

	return result


fixed_top_level_eval = ->
	save()

	trigmode = 0

	p1 = symbol(AUTOEXPAND)
	if (iszero(get_binding(p1)))
		expanding = 0
	else
		expanding = 1

	p1 = pop()
	push(p1)
	Eval()
	p2 = pop()
	
	if (p2 == symbol(NIL))
		push(p2)
		restore()
		return

	if (!iszero(get_binding(symbol(BAKE))))
		push(p2)
		bake()
		p2 = pop()

	push(p2)
	restore()


$.exec = exec
$.parse = parse

do ->
	builtin_fns = ["abs", "add", "adj", "and", "approxratio", "arccos", "arccosh", "arcsin", "arcsinh", "arctan", "arctanh", "arg", "atomize", "besselj", "bessely", "binding", "binomial", "ceiling", "check", "choose", "circexp", "clear", "clearall", "clearpatterns", "clock", "coeff", "cofactor", "condense", "conj", "contract", "cos", "cosh", "decomp", "defint", "deg", "denominator", "det", "derivative", "dim", "dirac", "divisors", "do", "dot", "draw", "dsolve", "eigen", "eigenval", "eigenvec", "erf", "erfc", "eval", "exp", "expand", "expcos", "expsin", "factor", "factorial", "factorpoly", "filter", "float", "floor", "for", "Gamma", "gcd", "hermite", "hilbert", "imag", "component", "inner", "integral", "inv", "invg", "isinteger", "isprime", "laguerre", "lcm", "leading", "legendre", "log", "mod", "multiply", "not", "nroots", "number", "numerator", "operator", "or", "outer", "pattern", "patternsinfo", "polar", "power", "prime", "print", "print2dascii", "printfull", "printlatex", "printlist", "printplain", "product", "quote", "quotient", "rank", "rationalize", "real", "rect", "roots", "round", "equals", "shape", "sgn", "silentpattern", "simplify", "sin", "sinh", "sqrt", "stop", "subst", "sum", "symbolsinfo", "tan", "tanh", "taylor", "test", "testeq", "testge", "testgt", "testle", "testlt", "transpose", "unit", "zero"]

	for fn in builtin_fns
		$[fn] = exec.bind(this, fn)
