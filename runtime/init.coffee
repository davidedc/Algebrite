

init = ->
	#debugger
	#console.log "DOING AN INIT ========================================================================"
	i = 0
	flag = 0

	reset_after_error()
	chainOfUserSymbolsNotFunctionsBeingEvaluated = []

	if (flag)
		return		# already initted

	flag = 1


	# total clearout of symbol table
	for i in [0...NSYM]
		symtab[i] =  new U()
		symtab[i].k = SYM
		binding[i] = symtab[i]
		isSymbolReclaimable[i] = false

	defn()

### cross =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept, script_defined

Parameters
----------
u,v

General description
-------------------
Returns the cross product of vectors u and v.

###

### curl =====================================================================

Tags
----
scripting, JS, internal, treenode, general concept, script_defined

Parameters
----------
u

General description
-------------------
Returns the curl of vector u.

###

defn_str = [
	"version=\"" + version + "\"",
	"e=exp(1)",
	"i=sqrt(-1)",
	"autoexpand=1",
	"assumeRealVariables=1",
	"trange=[-pi,pi]",
	"xrange=[-10,10]",
	"yrange=[-10,10]",
	"last=0",
	"trace=0",
	"printLeaveEAlone=1",
	"printLeaveXAlone=0",
	# cross definition
	"cross(u,v)=[u[2]*v[3]-u[3]*v[2],u[3]*v[1]-u[1]*v[3],u[1]*v[2]-u[2]*v[1]]",
	# curl definition
	"curl(v)=[d(v[3],y)-d(v[2],z),d(v[1],z)-d(v[3],x),d(v[2],x)-d(v[1],y)]",
	# div definition
	"div(v)=d(v[1],x)+d(v[2],y)+d(v[3],z)",
	# Note that we use the mathematics / Javascript / Mathematica
	# convention that "log" is indeed the natural logarithm.
	#
	# In engineering, biology, astronomy, "log" can stand instead
	# for the "common" logarithm i.e. base 10. Also note that Google
	# calculations use log for the common logarithm.
	"ln(x)=log(x)",
]

defn = ->
	p0 = symbol(NIL)
	p1 = symbol(NIL)
	p2 = symbol(NIL)
	p3 = symbol(NIL)
	p4 = symbol(NIL)
	p5 = symbol(NIL)
	p6 = symbol(NIL)
	p7 = symbol(NIL)
	p8 = symbol(NIL)
	p9 = symbol(NIL)

	std_symbol("abs", ABS)
	std_symbol("add", ADD)
	std_symbol("adj", ADJ)
	std_symbol("and", AND)
	std_symbol("approxratio", APPROXRATIO)
	std_symbol("arccos", ARCCOS)
	std_symbol("arccosh", ARCCOSH)
	std_symbol("arcsin", ARCSIN)
	std_symbol("arcsinh", ARCSINH)
	std_symbol("arctan", ARCTAN)
	std_symbol("arctanh", ARCTANH)
	std_symbol("arg", ARG)
	std_symbol("atomize", ATOMIZE)
	std_symbol("besselj", BESSELJ)
	std_symbol("bessely", BESSELY)
	std_symbol("binding", BINDING)
	std_symbol("binomial", BINOMIAL)
	std_symbol("ceiling", CEILING)
	std_symbol("check", CHECK)
	std_symbol("choose", CHOOSE)
	std_symbol("circexp", CIRCEXP)
	std_symbol("clear", CLEAR)
	std_symbol("clearall", CLEARALL)
	std_symbol("clearpatterns", CLEARPATTERNS)
	std_symbol("clock", CLOCK)
	std_symbol("coeff", COEFF)
	std_symbol("cofactor", COFACTOR)
	std_symbol("condense", CONDENSE)
	std_symbol("conj", CONJ)
	std_symbol("contract", CONTRACT)
	std_symbol("cos", COS)
	std_symbol("cosh", COSH)
	std_symbol("decomp", DECOMP)
	std_symbol("defint", DEFINT)
	std_symbol("deg", DEGREE)
	std_symbol("denominator", DENOMINATOR)
	std_symbol("det", DET)
	std_symbol("derivative", DERIVATIVE)
	std_symbol("dim", DIM)
	std_symbol("dirac", DIRAC)
	std_symbol("divisors", DIVISORS)
	std_symbol("do", DO)
	std_symbol("dot", DOT)
	std_symbol("draw", DRAW)
	std_symbol("dsolve", DSOLVE)
	std_symbol("erf", ERF)
	std_symbol("erfc", ERFC)
	std_symbol("eigen", EIGEN)
	std_symbol("eigenval", EIGENVAL)
	std_symbol("eigenvec", EIGENVEC)
	std_symbol("eval", EVAL)
	std_symbol("exp", EXP)
	std_symbol("expand", EXPAND)
	std_symbol("expcos", EXPCOS)
	std_symbol("expsin", EXPSIN)
	std_symbol("factor", FACTOR)
	std_symbol("factorial", FACTORIAL)
	std_symbol("factorpoly", FACTORPOLY)
	std_symbol("filter", FILTER)
	std_symbol("float", FLOATF)
	std_symbol("floor", FLOOR)
	std_symbol("for", FOR)
	std_symbol("function", FUNCTION)
	std_symbol("Gamma", GAMMA)
	std_symbol("gcd", GCD)
	std_symbol("hermite", HERMITE)
	std_symbol("hilbert", HILBERT)
	std_symbol("imag", IMAG)
	std_symbol("component", INDEX)
	std_symbol("inner", INNER)
	std_symbol("integral", INTEGRAL)
	std_symbol("inv", INV)
	std_symbol("invg", INVG)
	std_symbol("isinteger", ISINTEGER)
	std_symbol("isprime", ISPRIME)
	std_symbol("laguerre", LAGUERRE)
	#	std_symbol("laplace", LAPLACE)
	std_symbol("lcm", LCM)
	std_symbol("leading", LEADING)
	std_symbol("legendre", LEGENDRE)
	std_symbol("log", LOG)
	std_symbol("lookup", LOOKUP)
	std_symbol("mod", MOD)
	std_symbol("multiply", MULTIPLY)
	std_symbol("not", NOT)
	std_symbol("nroots", NROOTS)
	std_symbol("number", NUMBER)
	std_symbol("numerator", NUMERATOR)
	std_symbol("operator", OPERATOR)
	std_symbol("or", OR)
	std_symbol("outer", OUTER)
	std_symbol("pattern", PATTERN)
	std_symbol("patternsinfo", PATTERNSINFO)
	std_symbol("polar", POLAR)
	std_symbol("power", POWER)
	std_symbol("prime", PRIME)
	std_symbol("print", PRINT)
	std_symbol("print2dascii", PRINT2DASCII)
	std_symbol("printfull", PRINTFULL)
	std_symbol("printlatex", PRINTLATEX)
	std_symbol("printlist", PRINTLIST)
	std_symbol("printplain", PRINTPLAIN)
	std_symbol("printLeaveEAlone", PRINT_LEAVE_E_ALONE)
	std_symbol("printLeaveXAlone", PRINT_LEAVE_X_ALONE)
	std_symbol("product", PRODUCT)
	std_symbol("quote", QUOTE)
	std_symbol("quotient", QUOTIENT)
	std_symbol("rank", RANK)
	std_symbol("rationalize", RATIONALIZE)
	std_symbol("real", REAL)
	std_symbol("rect", YYRECT)
	std_symbol("roots", ROOTS)
	std_symbol("round", ROUND)
	std_symbol("equals", SETQ)
	std_symbol("sgn", SGN)
	std_symbol("silentpattern", SILENTPATTERN)
	std_symbol("simplify", SIMPLIFY)
	std_symbol("sin", SIN)
	std_symbol("sinh", SINH)
	std_symbol("shape", SHAPE)
	std_symbol("sqrt", SQRT)
	std_symbol("stop", STOP)
	std_symbol("subst", SUBST)
	std_symbol("sum", SUM)
	std_symbol("symbolsinfo", SYMBOLSINFO)
	std_symbol("tan", TAN)
	std_symbol("tanh", TANH)
	std_symbol("taylor", TAYLOR)
	std_symbol("test", TEST)
	std_symbol("testeq", TESTEQ)
	std_symbol("testge", TESTGE)
	std_symbol("testgt", TESTGT)
	std_symbol("testle", TESTLE)
	std_symbol("testlt", TESTLT)
	std_symbol("transpose", TRANSPOSE)
	std_symbol("unit", UNIT)
	std_symbol("zero", ZERO)

	std_symbol("nil", NIL)

	std_symbol("autoexpand", AUTOEXPAND)
	std_symbol("bake", BAKE)
	std_symbol("assumeRealVariables", ASSUME_REAL_VARIABLES)


	std_symbol("last", LAST)

	std_symbol("lastprint", LAST_PRINT)
	std_symbol("last2dasciiprint", LAST_2DASCII_PRINT)
	std_symbol("lastfullprint", LAST_FULL_PRINT)
	std_symbol("lastlatexprint", LAST_LATEX_PRINT)
	std_symbol("lastlistprint", LAST_LIST_PRINT)
	std_symbol("lastplainprint", LAST_PLAIN_PRINT)

	std_symbol("trace", TRACE)

	std_symbol("~", YYE)	# tilde so sort puts it after other symbols

	std_symbol("$DRAWX", DRAWX)	# special purpose internal symbols
	std_symbol("$METAA", METAA)
	std_symbol("$METAB", METAB)
	std_symbol("$METAX", METAX)
	std_symbol("$SECRETX", SECRETX)

	std_symbol("version", VERSION)

	std_symbol("pi", PI)
	std_symbol("a", SYMBOL_A)
	std_symbol("b", SYMBOL_B)
	std_symbol("c", SYMBOL_C)
	std_symbol("d", SYMBOL_D)
	std_symbol("i", SYMBOL_I)
	std_symbol("j", SYMBOL_J)
	std_symbol("n", SYMBOL_N)
	std_symbol("r", SYMBOL_R)
	std_symbol("s", SYMBOL_S)
	std_symbol("t", SYMBOL_T)
	std_symbol("x", SYMBOL_X)
	std_symbol("y", SYMBOL_Y)
	std_symbol("z", SYMBOL_Z)
	std_symbol("I", SYMBOL_IDENTITY_MATRIX)

	std_symbol("a_", SYMBOL_A_UNDERSCORE)
	std_symbol("b_", SYMBOL_B_UNDERSCORE)
	std_symbol("x_", SYMBOL_X_UNDERSCORE)

	std_symbol("$C1", C1)
	std_symbol("$C2", C2)
	std_symbol("$C3", C3)
	std_symbol("$C4", C4)
	std_symbol("$C5", C5)
	std_symbol("$C6", C6)

	defineSomeHandyConstants()


	# don't add all these functions to the
	# symbolsDependencies, clone the original
	originalCodeGen = codeGen
	codeGen = false

	for defn_i in [0...defn_str.length]
		definitionOfInterest = defn_str[defn_i]
		scan(definitionOfInterest)
		if DEBUG
			console.log "... evaling " + definitionOfInterest
			console.log("top of stack:")
			console.log print_list(stack[tos-1])
		Eval()
		pop()

	# restore the symbol dependencies as they were before.
	codeGen = originalCodeGen

defineSomeHandyConstants = ->
	push_integer(0)
	zero = pop()		# must be untagged in gc

	push_integer(1)
	one = pop()		# must be untagged in gc

	push_double(1.0)
	one_as_double = pop()

	# i is the square root of -1 i.e. -1 ^ 1/2
	push_symbol(POWER)
	if DEBUG then console.log print_list(stack[tos-1])
	push_integer(-1)
	if DEBUG then console.log print_list(stack[tos-1])
	push_rational(1, 2)
	if DEBUG then console.log print_list(stack[tos-1])
	list(3)
	if DEBUG then console.log print_list(stack[tos-1])
	imaginaryunit = pop()	# must be untagged in gc
