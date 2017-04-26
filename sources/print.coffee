power_str = "^"
codeGen = false

# this is only invoked when user invokes
# "print" explicitly
Eval_print = ->
	stringsEmittedByUserPrintouts += _print(cdr(p1),environment_printmode)
	push(symbol(NIL));

# this is only invoked when user invokes
# "print2dascii" explicitly
Eval_print2dascii = ->
	stringsEmittedByUserPrintouts +=_print(cdr(p1),PRINTMODE_2DASCII)
	push(symbol(NIL));

# this is only invoked when user invokes
# "printfull" explicitly
Eval_printfull = ->
	stringsEmittedByUserPrintouts +=_print(cdr(p1),PRINTMODE_FULL)
	push(symbol(NIL));

# this is only invoked when user invokes
# "printlatex" explicitly
Eval_printlatex = ->
	stringsEmittedByUserPrintouts +=_print(cdr(p1),PRINTMODE_LATEX)
	push(symbol(NIL));

# this is only invoked when user invokes
# "printplain" explicitly
Eval_printplain = ->
	# test flag needs to be suspended
	# because otherwise "printfull" mode
	# will happen.
	original_test_flag = test_flag
	test_flag = 0
	stringsEmittedByUserPrintouts +=_print(cdr(p1),PRINTMODE_PLAIN)
	test_flag = original_test_flag
	push(symbol(NIL));

# this is only invoked when user invokes
# "printlist" explicitly
Eval_printlist = ->	
	beenPrinted = _print(cdr(p1),PRINTMODE_LIST)
	stringsEmittedByUserPrintouts += beenPrinted
	push(symbol(NIL))	


_print = (p, passedPrintMode) ->
	accumulator = ""

	while (iscons(p))

		push(car(p));
		Eval();
		p2 = pop();

		# display single symbol as "symbol = result"

		# but don't display "symbol = symbol"

		###
		if (issymbol(car(p)) && car(p) != p2)
			push_symbol(SETQ);
			push(car(p));
			push(p2);
			list(3);
			p2 = pop();
		###

		origPrintMode = printMode
		if passedPrintMode == PRINTMODE_FULL
			printMode = PRINTMODE_FULL
			accumulator = printline(p2);
			rememberPrint(accumulator, LAST_FULL_PRINT)
		else if passedPrintMode == PRINTMODE_PLAIN
			printMode = PRINTMODE_PLAIN
			accumulator = printline(p2);
			rememberPrint(accumulator, LAST_PLAIN_PRINT)
		else if passedPrintMode == PRINTMODE_2DASCII
			printMode = PRINTMODE_2DASCII
			accumulator = print2dascii(p2);
			rememberPrint(accumulator, LAST_2DASCII_PRINT)
		else if passedPrintMode == PRINTMODE_LATEX
			printMode = PRINTMODE_LATEX
			accumulator = printline(p2);
			rememberPrint(accumulator, LAST_LATEX_PRINT)
		else if passedPrintMode == PRINTMODE_LIST
			printMode = PRINTMODE_LIST
			accumulator = print_list(p2);
			rememberPrint(accumulator, LAST_LIST_PRINT)
		printMode = origPrintMode


		p = cdr(p);

	if DEBUG then console.log "emttedString from display: " + stringsEmittedByUserPrintouts
	return accumulator

rememberPrint = (theString, theTypeOfPrint) ->
	scan('"' + theString + '"')
	parsedString = pop()
	set_binding(symbol(theTypeOfPrint), parsedString)

print_str = (s) ->
	if DEBUG then console.log "emttedString from print_str: " + stringsEmittedByUserPrintouts
	return s

print_char = (c) ->
	return c

collectLatexStringFromReturnValue = (p) ->
	origPrintMode = printMode
	printMode = PRINTMODE_LATEX
	originalCodeGen = codeGen
	codeGen = false
	returnedString = print_expr(p)
	# some variables might contain underscores, escape those
	returnedString = returnedString.replace(/_/g, "\\_");
	printMode = origPrintMode
	codeGen = originalCodeGen
	if DEBUG then console.log "emttedString from collectLatexStringFromReturnValue: " + stringsEmittedByUserPrintouts
	return returnedString

printline = (p) ->
	accumulator = ""
	accumulator += print_expr(p)
	return accumulator


print_base_of_denom = (p1) ->
	accumulator = ""
	if (isfraction(p1) || car(p1) == symbol(ADD) || car(p1) == symbol(MULTIPLY) || car(p1) == symbol(POWER) || lessp(p1, zero)) # p1 is BASE
			accumulator += print_char('(')
			accumulator += print_expr(p1); # p1 is BASE
			accumulator += print_char(')')
	else
		accumulator += print_expr(p1); # p1 is BASE
	return accumulator

print_expo_of_denom = (p2) ->
	accumulator = ""
	if (isfraction(p2) || car(p2) == symbol(ADD) || car(p2) == symbol(MULTIPLY) || car(p2) == symbol(POWER)) # p2 is EXPO
		accumulator += print_char('(')
		accumulator += print_expr(p2); # p2 is EXPO
		accumulator += print_char(')')
	else
		accumulator += print_expr(p2); # p2 is EXPO
	return accumulator

# prints stuff after the divide symbol "/"

# d is the number of denominators

#define BASE p1
#define EXPO p2

print_denom = (p, d) ->
	accumulator = ""
	save()

	p1 = cadr(p); # p1 is BASE
	p2 = caddr(p); # p2 is EXPO

	# i.e. 1 / (2^(1/3))

	# get the cases like BASE^(-1) out of
	# the way, they just become 1/BASE
	if (isminusone(p2)) # p2 is EXPO
		accumulator += print_base_of_denom p1
		restore()
		return accumulator

	if (d == 1) # p2 is EXPO
		accumulator += print_char('(')

	# prepare the exponent
	# (needs to be negated)
	# before printing it out
	push(p2); # p2 is EXPO
	negate()
	p2 = pop(); # p2 is EXPO
	accumulator += print_power(p1,p2)
	if (d == 1)
		accumulator += print_char(')')
	restore()
	return accumulator


#define A p3
#define B p4

print_a_over_b = (p) ->
	accumulator = ""
	flag = 0
	n = 0
	d = 0

	save()

	# count numerators and denominators

	n = 0
	d = 0

	p1 = cdr(p)
	p2 = car(p1)

	if (isrational(p2))
		push(p2)
		mp_numerator()
		absval()
		p3 = pop(); # p3 is A
		push(p2)
		mp_denominator()
		p4 = pop(); # p4 is B
		if (!isplusone(p3)) # p3 is A
			n++
		if (!isplusone(p4)) # p4 is B
			d++
		p1 = cdr(p1)
	else
		p3 = one; # p3 is A
		p4 = one; # p4 is B

	while (iscons(p1))
		p2 = car(p1)
		if (is_denominator(p2))
			d++
		else
			n++
		p1 = cdr(p1)

	#debugger
	if printMode == PRINTMODE_LATEX
		accumulator += print_str('\\frac{')

	if (n == 0)
		accumulator += print_char('1')
	else
		flag = 0
		p1 = cdr(p)
		if (isrational(car(p1)))
			p1 = cdr(p1)
		if (!isplusone(p3)) # p3 is A
			accumulator += print_factor(p3); # p3 is A
			flag = 1
		while (iscons(p1))
			p2 = car(p1)
			if (is_denominator(p2))
				doNothing = 1
			else
				if (flag)
					accumulator += print_multiply_sign()
				accumulator += print_factor(p2)
				flag = 1
			p1 = cdr(p1)

	if printMode == PRINTMODE_LATEX
		accumulator += print_str('}{')
	else if printMode == PRINTMODE_PLAIN and !test_flag
		accumulator += print_str(" / ")
	else
		accumulator += print_str("/")

	if (d > 1 and printMode != PRINTMODE_LATEX)
		accumulator += print_char('(')


	flag = 0
	p1 = cdr(p)

	if (isrational(car(p1)))
		p1 = cdr(p1)

	if (!isplusone(p4)) # p4 is B
		accumulator += print_factor(p4); # p4 is B
		flag = 1

	while (iscons(p1))
		p2 = car(p1)
		if (is_denominator(p2))
			if (flag)
				accumulator += print_multiply_sign()
			accumulator += print_denom(p2, d)
			flag = 1
		p1 = cdr(p1)

	if (d > 1 and printMode != PRINTMODE_LATEX)
		accumulator += print_char(')')

	if printMode == PRINTMODE_LATEX
		accumulator += print_str('}')

	restore()
	return accumulator


print_expr = (p) ->
	accumulator = ""
	if (isadd(p))
		p = cdr(p)
		if (sign_of_term(car(p)) == '-')
			accumulator += print_str("-")
		accumulator += print_term(car(p))
		p = cdr(p)
		while (iscons(p))
			if (sign_of_term(car(p)) == '+')
				if printMode == PRINTMODE_PLAIN and !test_flag
					accumulator += print_str(" + ")
				else
					accumulator += print_str("+")
			else
				if printMode == PRINTMODE_PLAIN and !test_flag
					accumulator += print_str(" - ")
				else
					accumulator += print_str("-")
			accumulator += print_term(car(p))
			p = cdr(p)
	else
		if (sign_of_term(p) == '-')
			accumulator += print_str("-")
		accumulator += print_term(p)
	return accumulator

sign_of_term = (p) ->
	accumulator = ""
	if (car(p) == symbol(MULTIPLY) && isnum(cadr(p)) && lessp(cadr(p), zero))
		accumulator += '-'
	else if (isnum(p) && lessp(p, zero))
		accumulator += '-'
	else
		accumulator += '+'
	return accumulator

print_term = (p) ->
	accumulator = ""
	if (car(p) == symbol(MULTIPLY) && any_denominators(p))
		accumulator += print_a_over_b(p)
		return accumulator

	if (car(p) == symbol(MULTIPLY))
		p = cdr(p)

		# coeff -1?

		if (isminusone(car(p)))
			#			print_char('-')
			p = cdr(p)


		previousFactorWasANumber = false

		# print the first factor ------------
		if isnum(car(p))
			previousFactorWasANumber = true

		# this numberOneOverSomething thing is so that
		# we show things of the form
		#   numericFractionOfForm1/something * somethingElse
		# as
		#   somethingElse / something
		# so for example 1/2 * sqrt(2) is rendered as
		#   sqrt(2)/2
		# rather than the first form, which looks confusing.
		# NOTE that you might want to avoid this
		# when printing polynomials, as it could be nicer
		# to show the numeric coefficients well separated from
		# the variable, but we'll see when we'll
		# come to it if it's an issue.
		numberOneOverSomething = false
		if printMode == PRINTMODE_LATEX and iscons(cdr(p)) and isnumberoneoversomething(car(p))
			numberOneOverSomething = true
			denom = car(p).q.b.toString()


		if numberOneOverSomething
			origAccumulator = accumulator
			accumulator = ""
		else
			accumulator += print_factor(car(p))

		p = cdr(p)

		# print all the other factors -------
		while (iscons(p))
			# check if we end up having a case where two numbers
			# are next to each other. In those cases, latex needs
			# to insert a \cdot otherwise they end up
			# right next to each other and read like one big number
			if printMode == PRINTMODE_LATEX
				if previousFactorWasANumber
					# if what comes next is a power and the base
					# is a number, then we are in the case
					# of consecutive numbers.
					# Note that sqrt() i.e when exponent is 1/2
					# doesn't count because the radical gives
					# a nice graphical separation already.
					if caar(p) == symbol(POWER)
						if isnum(car(cdr(car(p))))
							# rule out square root
							if !isfraction(car(cdr(cdr(car(p)))))
								accumulator += " \\cdot "
			accumulator += print_multiply_sign()
			accumulator += print_factor(car(p))

			previousFactorWasANumber = false
			if isnum(car(p))
				previousFactorWasANumber = true

			p = cdr(p)

		if numberOneOverSomething
			accumulator = origAccumulator + "\\frac{" + accumulator + "}{" + denom + "}"

	else
		accumulator += print_factor(p)
	return accumulator

print_subexpr = (p) ->
	accumulator = ""
	accumulator += print_char('(')
	accumulator += print_expr(p)
	accumulator += print_char(')')
	return accumulator

print_factorial_function = (p) ->
	accumulator = ""
	p = cadr(p)
	if (car(p) == symbol(ADD) || car(p) == symbol(MULTIPLY) || car(p) == symbol(POWER) || car(p) == symbol(FACTORIAL))
		accumulator += print_subexpr(p)
	else
		accumulator += print_expr(p)
	accumulator += print_char('!')
	return accumulator

print_ABS_latex = (p) ->
	accumulator = ""
	accumulator += print_str("\\left |")
	accumulator += print_expr(cadr(p))
	accumulator += print_str(" \\right |")
	return accumulator

print_BINOMIAL_latex = (p) ->
	accumulator = ""
	accumulator += print_str("\\binom{")
	accumulator += print_expr(cadr(p))
	accumulator += print_str("}{")
	accumulator += print_expr(caddr(p))
	accumulator += print_str("} ")
	return accumulator
	
print_DOT_latex = (p) ->
	accumulator = ""
	accumulator += print_expr(cadr(p))
	accumulator += print_str(" \\cdot ")
	accumulator += print_expr(caddr(p))
	return accumulator

print_DOT_codegen = (p) ->
	accumulator = "dot("
	accumulator += print_expr(cadr(p))
	accumulator += ", "
	accumulator += print_expr(caddr(p))
	accumulator += ")"
	return accumulator

print_SIN_codegen = (p) ->
	accumulator = "Math.sin("
	accumulator += print_expr(cadr(p))
	accumulator += ")"
	return accumulator

print_COS_codegen = (p) ->
	accumulator = "Math.cos("
	accumulator += print_expr(cadr(p))
	accumulator += ")"
	return accumulator

print_TAN_codegen = (p) ->
	accumulator = "Math.tan("
	accumulator += print_expr(cadr(p))
	accumulator += ")"
	return accumulator

print_ARCSIN_codegen = (p) ->
	accumulator = "Math.asin("
	accumulator += print_expr(cadr(p))
	accumulator += ")"
	return accumulator

print_ARCCOS_codegen = (p) ->
	accumulator = "Math.acos("
	accumulator += print_expr(cadr(p))
	accumulator += ")"
	return accumulator

print_ARCTAN_codegen = (p) ->
	accumulator = "Math.atan("
	accumulator += print_expr(cadr(p))
	accumulator += ")"
	return accumulator

print_SQRT_latex = (p) ->
	accumulator = ""
	accumulator += print_str("\\sqrt{")
	accumulator += print_expr(cadr(p))
	accumulator += print_str("} ")
	return accumulator
	
print_TRANSPOSE_latex = (p) ->
	accumulator = ""
	accumulator += print_str("{")
	if iscons(cadr(p))
		accumulator += print_str('(')
	accumulator += print_expr(cadr(p))
	if iscons(cadr(p))
		accumulator += print_str(')')
	accumulator += print_str("}")
	accumulator += print_str("^T")
	return accumulator

print_TRANSPOSE_codegen = (p) ->
	accumulator = ""
	accumulator += print_str("transpose(")
	accumulator += print_expr(cadr(p))
	accumulator += print_str(')')
	return accumulator

print_UNIT_codegen = (p) ->
	accumulator = ""
	accumulator += print_str("identity(")
	accumulator += print_expr(cadr(p))
	accumulator += print_str(')')
	return accumulator

print_INV_latex = (p) ->
	accumulator = ""
	accumulator += print_str("{")
	if iscons(cadr(p))
		accumulator += print_str('(')
	accumulator += print_expr(cadr(p))
	if iscons(cadr(p))
		accumulator += print_str(')')
	accumulator += print_str("}")
	accumulator += print_str("^{-1}")
	return accumulator

print_INV_codegen = (p) ->
	accumulator = ""
	accumulator += print_str("inv(")
	accumulator += print_expr(cadr(p))
	accumulator += print_str(')')
	return accumulator

print_DEFINT_latex = (p) ->
	accumulator = ""
	functionBody = car(cdr(p))

	p = cdr(p)
	originalIntegral = p
	numberOfIntegrals = 0

	while iscons(cdr(cdr(p)))
		numberOfIntegrals++
		theIntegral = cdr(cdr(p))

		accumulator += print_str("\\int^{")
		accumulator += print_expr(car(cdr(theIntegral)))
		accumulator += print_str("}_{")
		accumulator += print_expr(car(theIntegral))
		accumulator += print_str("} \\! ")
		p = cdr(theIntegral)

	accumulator += print_expr(functionBody)
	accumulator += print_str(" \\,")
	
	p = originalIntegral

	for i in [1..numberOfIntegrals]
		theVariable = cdr(p)
		accumulator += print_str(" \\mathrm{d} ")
		accumulator += print_expr(car(theVariable))
		if i < numberOfIntegrals
			accumulator += print_str(" \\, ")
		p = cdr(cdr(theVariable))
	return accumulator



print_tensor = (p) ->
	accumulator = ""
	accumulator += print_tensor_inner(p, 0, 0)[1]
	return accumulator

# j scans the dimensions
# k is an increment for all the printed elements
#   since they are all together in sequence in one array
print_tensor_inner = (p, j, k) ->
	accumulator = ""

	accumulator += print_str("[")

	# only the last dimension prints the actual elements
	# e.g. in a matrix, the first dimension contains
	# vectors, not elements, and the second dimension
	# actually contains the elements
	
	# if not the last dimension, we are just printing wrappers
	# and recursing down i.e. we print the next dimension
	if (j < p.tensor.ndim - 1)
		for i in [0...p.tensor.dim[j]]
			[k, retString] = print_tensor_inner(p, j + 1, k)
			accumulator += retString
			# add separator between elements dimensions
			# "above" the inner-most dimension
			if i != p.tensor.dim[j] - 1
				accumulator += print_str(",")
	# if we reached the last dimension, we print the actual
	# elements
	else
		for i in [0...p.tensor.dim[j]]
			accumulator += print_expr(p.tensor.elem[k])
			# add separator between elements in the
			# inner-most dimension
			if i != p.tensor.dim[j] - 1
				accumulator += print_str(",")
			k++

	accumulator += print_str("]")
	return [k, accumulator]

print_tensor_latex = (p) ->
	accumulator = ""
	if p.tensor.ndim <= 2
		accumulator += print_tensor_inner_latex(true, p, 0, 0)[1]
	return accumulator

# firstLevel is needed because printing a matrix
# is not exactly an elegant recursive procedure:
# the vector on the first level prints the latex
# "wrap", while the vectors that make up the
# rows don't. so it's a bit asymmetric and this
# flag helps.
# j scans the dimensions
# k is an increment for all the printed elements
#   since they are all together in sequence in one array
print_tensor_inner_latex = (firstLevel, p, j, k) ->
	accumulator = ""

	# open the outer latex wrap
	if firstLevel
		accumulator += "\\begin{bmatrix} "

	# only the last dimension prints the actual elements
	# e.g. in a matrix, the first dimension contains
	# vectors, not elements, and the second dimension
	# actually contains the elements
	
	# if not the last dimension, we are just printing wrappers
	# and recursing down i.e. we print the next dimension
	if (j < p.tensor.ndim - 1)
		for i in [0...p.tensor.dim[j]]
			[k, retString] = print_tensor_inner_latex(0, p, j + 1, k)
			accumulator += retString
			if i != p.tensor.dim[j] - 1
				# add separator between rows
				accumulator += print_str(" \\\\ ")
	# if we reached the last dimension, we print the actual
	# elements
	else
		for i in [0...p.tensor.dim[j]]
			accumulator += print_expr(p.tensor.elem[k])
			# separator between elements in each row
			if i != p.tensor.dim[j] - 1
				accumulator += print_str(" & ")
			k++


	# close the outer latex wrap
	if firstLevel
		accumulator += " \\end{bmatrix}"

	return [k, accumulator]

print_SUM_latex = (p) ->
	accumulator = "\\sum_{"
	accumulator += print_expr(caddr(p))
	accumulator += "="
	accumulator += print_expr(cadddr(p))
	accumulator += "}^{"
	accumulator += print_expr(caddddr(p))
	accumulator += "}{"
	accumulator += print_expr(cadr(p))
	accumulator += "}"
	return accumulator

print_SUM_codegen = (p) ->

	body =  cadr(p)
	variable = caddr(p)
	lowerlimit = cadddr(p)
	upperlimit = caddddr(p)

	accumulator =
		"(function(){" +
		" var " + variable + "; " +
		" var holderSum = 0; " +
		" var lowerlimit = " + print_expr(lowerlimit) + "; " +
		" var upperlimit = " + print_expr(upperlimit) + "; " +
		" for (" + variable + " = lowerlimit; " + variable + " < upperlimit; " + variable + "++) { " +
		"   holderSum += " + print_expr(body) + ";" +
		" } "+
		" return holderSum;" +
		"})()"

	return accumulator

print_TEST_latex = (p) ->
	accumulator = "\\left\\{ \\begin{array}{ll}"

	p = cdr(p)
	while (iscons(p))

		# odd number of parameters means that the
		# last argument becomes the default case
		# i.e. the one without a test.
		if (cdr(p) == symbol(NIL))
			accumulator += "{"
			accumulator += print_expr(car(p))
			accumulator += "} & otherwise "
			accumulator += " \\\\\\\\"
			break

		accumulator += "{"
		accumulator += print_expr(cadr(p))
		accumulator += "} & if & "
		accumulator += print_expr(car(p))
		accumulator += " \\\\\\\\"

		# test unsuccessful, continue to the
		# next pair of test,value
		p = cddr(p)
	accumulator = accumulator.substring(0, accumulator.length - 4);
	accumulator += "\\end{array} \\right."

print_TEST_codegen = (p) ->

	accumulator = "(function(){"

	p = cdr(p)
	howManyIfs = 0
	while (iscons(p))

		# odd number of parameters means that the
		# last argument becomes the default case
		# i.e. the one without a test.
		if (cdr(p) == symbol(NIL))
			accumulator += "else {"
			accumulator += "return (" + print_expr(car(p)) + ");"
			accumulator += "}"
			break

		if howManyIfs
			accumulator += " else "

		accumulator += "if (" + print_expr(car(p)) + "){"
		accumulator += "return (" + print_expr(cadr(p)) + ");"
		accumulator += "}"

		# test unsuccessful, continue to the
		# next pair of test,value
		howManyIfs++
		p = cddr(p)

	accumulator += "})()"

	return accumulator


print_TESTLT_latex = (p) ->
	accumulator = "{"
	accumulator += print_expr(cadr(p))
	accumulator += "}"
	accumulator += " < "
	accumulator += "{"
	accumulator += print_expr(caddr(p))
	accumulator += "}"

print_TESTLE_latex = (p) ->
	accumulator = "{"
	accumulator += print_expr(cadr(p))
	accumulator += "}"
	accumulator += " \\leq "
	accumulator += "{"
	accumulator += print_expr(caddr(p))
	accumulator += "}"

print_TESTGT_latex = (p) ->
	accumulator = "{"
	accumulator += print_expr(cadr(p))
	accumulator += "}"
	accumulator += " > "
	accumulator += "{"
	accumulator += print_expr(caddr(p))
	accumulator += "}"

print_TESTGE_latex = (p) ->
	accumulator = "{"
	accumulator += print_expr(cadr(p))
	accumulator += "}"
	accumulator += " \\geq "
	accumulator += "{"
	accumulator += print_expr(caddr(p))
	accumulator += "}"

print_TESTEQ_latex = (p) ->
	accumulator = "{"
	accumulator += print_expr(cadr(p))
	accumulator += "}"
	accumulator += " = "
	accumulator += "{"
	accumulator += print_expr(caddr(p))
	accumulator += "}"

print_FOR_codegen = (p) ->
	body =  cadr(p)
	variable = caddr(p)
	lowerlimit = cadddr(p)
	upperlimit = caddddr(p)

	accumulator =
		"(function(){" +
		" var " + variable + "; " +
		" var lowerlimit = " + print_expr(lowerlimit) + "; " +
		" var upperlimit = " + print_expr(upperlimit) + "; " +
		" for (" + variable + " = lowerlimit; " + variable + " < upperlimit; " + variable + "++) { " +
		"   " + print_expr(body) +
		" } "+
		"})()"

	return accumulator

print_DO_codegen = (p) ->
	accumulator = ""

	p = cdr(p)
	while iscons(p)
		accumulator += print_expr(car(p))
		p = cdr(p)

	return accumulator

print_SETQ_codegen = (p) ->
	accumulator = ""
	accumulator += print_expr(cadr(p))
	accumulator += " = "
	accumulator += print_expr(caddr(p))
	accumulator += "; "
	return accumulator
	

print_PRODUCT_latex = (p) ->
	accumulator = "\\prod_{"
	accumulator += print_expr(caddr(p))
	accumulator += "="
	accumulator += print_expr(cadddr(p))
	accumulator += "}^{"
	accumulator += print_expr(caddddr(p))
	accumulator += "}{"
	accumulator += print_expr(cadr(p))
	accumulator += "}"
	return accumulator

print_PRODUCT_codegen = (p) ->

	body =  cadr(p)
	variable = caddr(p)
	lowerlimit = cadddr(p)
	upperlimit = caddddr(p)

	accumulator =
		"(function(){" +
		" var " + variable + "; " +
		" var holderProduct = 1; " +
		" var lowerlimit = " + print_expr(lowerlimit) + "; " +
		" var upperlimit = " + print_expr(upperlimit) + "; " +
		" for (" + variable + " = lowerlimit; " + variable + " < upperlimit; " + variable + "++) { " +
		"   holderProduct *= " + print_expr(body) + ";" +
		" } "+
		" return holderProduct;" +
		"})()"

	return accumulator


print_base = (p) ->
	accumulator = ""
	if (isadd(cadr(p)) || caadr(p) == symbol(MULTIPLY) || caadr(p) == symbol(POWER) || isnegativenumber(cadr(p)))
		accumulator += print_str('(')
		accumulator += print_expr(cadr(p))
		accumulator += print_str(')')
	else if (isnum(cadr(p)) && (lessp(cadr(p), zero) || isfraction(cadr(p))))
		accumulator += print_str('(')
		accumulator += print_factor(cadr(p))
		accumulator += print_str(')')
	else
		accumulator += print_factor(cadr(p))
	return accumulator

print_exponent = (p) ->
	accumulator = ""
	if (iscons(caddr(p)) || isfraction(caddr(p)) || (isnum(caddr(p)) && lessp(caddr(p), zero)))
		accumulator += print_str('(')
		accumulator += print_expr(caddr(p))
		accumulator += print_str(')')
	else
		accumulator += print_factor(caddr(p))
	return accumulator

print_power = (base, exponent) ->
	accumulator = ""

	#debugger
	if DEBUG then console.log "power base: " + base + " " + " exponent: " + exponent

	# quick check is this is actually a square root.
	if isoneovertwo(exponent)
		if equaln(base, 2)
			if codeGen
				accumulator += print_str("Math.SQRT2")
				return accumulator
		else
			if printMode == PRINTMODE_LATEX
				accumulator += print_str("\\sqrt{")
				accumulator += print_expr(base)
				accumulator += print_str("}")
				return accumulator
			else if codeGen
				accumulator += print_str("Math.sqrt(")
				accumulator += print_expr(base)
				accumulator += print_str(')')
				return accumulator


	if ((equaln(get_binding(symbol(PRINT_LEAVE_E_ALONE)), 1)) and base == symbol(E))
		if codeGen
			accumulator += print_str("Math.exp(")
			accumulator += print_expo_of_denom exponent
			accumulator += print_str(')')
			return accumulator

		if printMode == PRINTMODE_LATEX
			accumulator += print_str("e^{")
			accumulator += print_expr(exponent)
			accumulator += print_str("}")
		else
			accumulator += print_str("exp(")
			accumulator += print_expr(exponent)
			accumulator += print_str(')')
		return accumulator

	if codeGen
		accumulator += print_str("Math.pow(")
		accumulator += print_base_of_denom base
		accumulator += print_str(", ")
		accumulator += print_expo_of_denom exponent
		accumulator += print_str(')')
		return accumulator

	
	if ((equaln(get_binding(symbol(PRINT_LEAVE_X_ALONE)), 0)) or base.printname != "x")
		# if the exponent is negative then
		# we invert the base BUT we don't do
		# that if the base is "e", because for
		# example when trigonometric functions are
		# expressed in terms of exponential functions
		# that would be really confusing, one wants to
		# keep "e" as the base and the negative exponent
		if (base != symbol(E))
			if (isminusone(exponent))
				if printMode == PRINTMODE_LATEX
					accumulator += print_str("\\frac{1}{")
				else if printMode == PRINTMODE_PLAIN and !test_flag
					accumulator += print_str("1 / ")
				else
					accumulator += print_str("1/")

				if (iscons(base) and printMode != PRINTMODE_LATEX)
					accumulator += print_str('(')
					accumulator += print_expr(base)
					accumulator += print_str(')')
				else
					accumulator += print_expr(base)

				if printMode == PRINTMODE_LATEX
					accumulator += print_str("}")

				return accumulator

			if (isnegativeterm(exponent))
				if printMode == PRINTMODE_LATEX
					accumulator += print_str("\\frac{1}{")
				else if printMode == PRINTMODE_PLAIN and !test_flag
					accumulator += print_str("1 / ")
				else
					accumulator += print_str("1/")

				push(exponent)
				push_integer(-1)
				multiply()
				newExponent = pop()

				if (iscons(base) and printMode != PRINTMODE_LATEX)
					accumulator += print_str('(')
					accumulator += print_power(base, newExponent)
					accumulator += print_str(')')
				else
					accumulator += print_power(base, newExponent)


				if printMode == PRINTMODE_LATEX
					accumulator += print_str("}")

				return accumulator


		if (isfraction(exponent) and printMode == PRINTMODE_LATEX)
				accumulator += print_str("\\sqrt")
				push(exponent)
				denominator()
				denomExponent = pop()
				# we omit the "2" on the radical
				if !isplustwo(denomExponent)
					accumulator += print_str("[")
					accumulator += print_expr(denomExponent)
					accumulator += print_str("]")
				accumulator += print_str("{")
				push(exponent)
				numerator()
				numExponent = pop()
				exponent = numExponent
				accumulator += print_power(base, exponent)
				accumulator += print_str("}")
				return accumulator

	if printMode == PRINTMODE_LATEX and isplusone(exponent)
		# if we are in latex mode we turn many
		# radicals into a radix sign with a power
		# underneath, and the power is often one
		# (e.g. square root turns into a radical
		# with a power one underneath) so handle
		# this case simply here, just print the base
		accumulator += print_expr(base)
	else
		# print the base,
		# determining if it needs to be
		# wrapped in parentheses or not
		if (isadd(base) || isnegativenumber(base))
			accumulator += print_str('(')
			accumulator += print_expr(base)
			accumulator += print_str(')')
		else if ( car(base) == symbol(MULTIPLY) || car(base) == symbol(POWER))
			if printMode != PRINTMODE_LATEX then accumulator += print_str('(')
			accumulator += print_factor(base, true)
			if printMode != PRINTMODE_LATEX then accumulator += print_str(')')
		else if (isnum(base) && (lessp(base, zero) || isfraction(base)))
			accumulator += print_str('(')
			accumulator += print_factor(base)
			accumulator += print_str(')')
		else
			accumulator += print_factor(base)

		# print the power symbol
		#debugger
		if printMode == PRINTMODE_PLAIN and !test_flag
			#print_str(" ^ ")
			accumulator += print_str(power_str)
		else
			accumulator += print_str("^")

		# print the exponent
		if printMode == PRINTMODE_LATEX
			# in latex mode, one can omit the curly braces
			# wrapping the exponent if the exponent is only
			# one character long
			if print_expr(exponent).length > 1
				accumulator += print_str("{")
				accumulator += print_expr(exponent)
				accumulator += print_str("}")
			else
				accumulator += print_expr(exponent)
		else if (iscons(exponent) || isfraction(exponent) || (isnum(exponent) && lessp(exponent, zero)))
			accumulator += print_str('(')
			accumulator += print_expr(exponent)
			accumulator += print_str(')')
		else
			accumulator += print_factor(exponent)
	return accumulator

print_index_function = (p) ->
	accumulator = ""
	p = cdr(p);
	if (caar(p) == symbol(ADD) || caar(p) == symbol(MULTIPLY) || caar(p) == symbol(POWER) || caar(p) == symbol(FACTORIAL))
		accumulator += print_subexpr(car(p));
	else
		accumulator += print_expr(car(p));
	accumulator += print_str('[');
	p = cdr(p);
	if (iscons(p))
		accumulator += print_expr(car(p));
		p = cdr(p);
		while(iscons(p))
			accumulator += print_str(',');
			accumulator += print_expr(car(p));
			p = cdr(p);
	accumulator += print_str(']');
	return accumulator


print_factor = (p, omitParens) ->
	# debugger
	accumulator = ""
	if (isnum(p))
		accumulator += print_number(p, false)
		return accumulator

	if (isstr(p))
		accumulator += print_str("\"")
		accumulator += print_str(p.str)
		accumulator += print_str("\"")
		return accumulator

	if (istensor(p))
		if printMode == PRINTMODE_LATEX
			accumulator += print_tensor_latex(p)
		else
			accumulator += print_tensor(p)
		return accumulator

	if (car(p) == symbol(MULTIPLY))
		if !omitParens
			if (sign_of_term(p) == '-' or printMode != PRINTMODE_LATEX)
				if printMode == PRINTMODE_LATEX
					accumulator += print_str(" \\left (")
				else
					accumulator += print_str('(')
		accumulator += print_expr(p)
		if !omitParens
			if (sign_of_term(p) == '-' or printMode != PRINTMODE_LATEX)
				if printMode == PRINTMODE_LATEX
					accumulator += print_str(" \\right ) ")
				else
					accumulator += print_str(')')
		return accumulator
	else if (isadd(p))
		if !omitParens then accumulator += print_str('(')
		accumulator += print_expr(p)
		if !omitParens then accumulator += print_str(')')
		return accumulator

	if (car(p) == symbol(POWER))
		base = cadr(p)
		exponent = caddr(p)
		accumulator += print_power(base, exponent)
		return accumulator

	#	if (car(p) == _list) {
	#		print_str("{")
	#		p = cdr(p)
	#		if (iscons(p)) {
	#			print_expr(car(p))
	#			p = cdr(p)
	#		}
	#		while (iscons(p)) {
	#			print_str(",")
	#			print_expr(car(p))
	#			p = cdr(p)
	#		}
	#		print_str("}")
	#		return
	#	}

	if (car(p) == symbol(FUNCTION))
		fbody = cadr(p)
		
		if !codeGen
			parameters = caddr(p)
			accumulator += print_str "function "
			if DEBUG then console.log "emittedString from print_factor " + stringsEmittedByUserPrintouts
			returned = print_list parameters
			accumulator += returned
			accumulator += print_str " -> "
		accumulator += print_expr fbody
		return accumulator

	if (car(p) == symbol(PATTERN))

		accumulator += print_expr(caadr(p))
		if printMode == PRINTMODE_LATEX
			accumulator += print_str(" \\rightarrow ")
		else
			if printMode == PRINTMODE_PLAIN and !test_flag
				accumulator += print_str(" -> ")
			else
				accumulator += print_str("->")

		accumulator += print_expr car(cdr(cadr(p)))
		return accumulator


	if (car(p) == symbol(INDEX) && issymbol(cadr(p)))
		accumulator += print_index_function(p)
		return accumulator

	if (car(p) == symbol(FACTORIAL))
		accumulator += print_factorial_function(p)
		return accumulator
	else if (car(p) == symbol(ABS) && printMode == PRINTMODE_LATEX)
		accumulator += print_ABS_latex(p)
		return accumulator
	else if (car(p) == symbol(SQRT) && printMode == PRINTMODE_LATEX)
		#debugger
		accumulator += print_SQRT_latex(p)
		return accumulator
	else if car(p) == symbol(TRANSPOSE)
		if printMode == PRINTMODE_LATEX
			accumulator += print_TRANSPOSE_latex(p)
			return accumulator
		else if codeGen
			accumulator += print_TRANSPOSE_codegen(p)
			return accumulator
	else if car(p) == symbol(UNIT)
		if codeGen
			accumulator += print_UNIT_codegen(p)
			return accumulator
	else if car(p) == symbol(INV)
		if printMode == PRINTMODE_LATEX
			accumulator += print_INV_latex(p)
			return accumulator
		else if codeGen
			accumulator += print_INV_codegen(p)
			return accumulator
	else if (car(p) == symbol(BINOMIAL) && printMode == PRINTMODE_LATEX)
		accumulator += print_BINOMIAL_latex(p)
		return accumulator
	else if (car(p) == symbol(DEFINT) && printMode == PRINTMODE_LATEX)
		accumulator += print_DEFINT_latex(p)
		return accumulator
	else if isinnerordot(p)
		if printMode == PRINTMODE_LATEX
			accumulator += print_DOT_latex(p)
			return accumulator
		else if codeGen
			accumulator += print_DOT_codegen(p)
			return accumulator
	else if car(p) == symbol(SIN)
		if codeGen
			accumulator += print_SIN_codegen(p)
			return accumulator
	else if car(p) == symbol(COS)
		if codeGen
			accumulator += print_COS_codegen(p)
			return accumulator
	else if car(p) == symbol(TAN)
		if codeGen
			accumulator += print_TAN_codegen(p)
			return accumulator
	else if car(p) == symbol(ARCSIN)
		if codeGen
			accumulator += print_ARCSIN_codegen(p)
			return accumulator
	else if car(p) == symbol(ARCCOS)
		if codeGen
			accumulator += print_ARCCOS_codegen(p)
			return accumulator
	else if car(p) == symbol(ARCTAN)
		if codeGen
			accumulator += print_ARCTAN_codegen(p)
			return accumulator
	else if car(p) == symbol(SUM)
		if printMode == PRINTMODE_LATEX
			accumulator += print_SUM_latex(p)
			return accumulator
		else if codeGen
			accumulator += print_SUM_codegen(p)
			return accumulator
	#else if car(p) == symbol(QUOTE)
	#	if printMode == PRINTMODE_LATEX
	#		print_expr(cadr(p))
	#		return accumulator
	else if car(p) == symbol(PRODUCT)
		if printMode == PRINTMODE_LATEX
			accumulator += print_PRODUCT_latex(p)
			return accumulator
		else if codeGen
			accumulator += print_PRODUCT_codegen(p)
			return accumulator
	else if car(p) == symbol(FOR)
		if codeGen
			accumulator += print_FOR_codegen(p)
			return accumulator
	else if car(p) == symbol(DO)
		if codeGen
			accumulator += print_DO_codegen(p)
			return accumulator
	else if car(p) == symbol(TEST)
		if codeGen
			accumulator += print_TEST_codegen(p)
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += print_TEST_latex(p)
			return accumulator
	else if car(p) == symbol(TESTLT)
		if codeGen
			accumulator += "(("+print_expr(cadr(p))+") < ("+print_expr(caddr(p))+"))"
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += print_TESTLT_latex(p)
			return accumulator
	else if car(p) == symbol(TESTLE)
		if codeGen
			accumulator += "(("+print_expr(cadr(p))+") <= ("+print_expr(caddr(p))+"))"
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += print_TESTLE_latex(p)
			return accumulator
	else if car(p) == symbol(TESTGT)
		if codeGen
			accumulator += "(("+print_expr(cadr(p))+") > ("+print_expr(caddr(p))+"))"
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += print_TESTGT_latex(p)
			return accumulator
	else if car(p) == symbol(TESTGE)
		if codeGen
			accumulator += "(("+print_expr(cadr(p))+") >= ("+print_expr(caddr(p))+"))"
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += print_TESTGE_latex(p)
			return accumulator
	else if car(p) == symbol(TESTEQ)
		if codeGen
			accumulator += "(("+print_expr(cadr(p))+") === ("+print_expr(caddr(p))+"))"
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += print_TESTEQ_latex(p)
			return accumulator
	else if car(p) == symbol(FLOOR)
		if codeGen
			accumulator += "Math.floor("+print_expr(cadr(p))+")"
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += " \\lfloor {" + print_expr(cadr(p)) + "} \\rfloor "
			return accumulator
	else if car(p) == symbol(CEILING)
		debugger
		if codeGen
			accumulator += "Math.ceiling("+print_expr(cadr(p))+")"
			return accumulator
		if printMode == PRINTMODE_LATEX
			accumulator += " \\lceil {" + print_expr(cadr(p)) + "} \\rceil "
			return accumulator
	else if car(p) == symbol(ROUND)
		if codeGen
			accumulator += "Math.round("+print_expr(cadr(p))+")"
			return accumulator
	else if car(p) == symbol(SETQ)
		if codeGen
			accumulator += print_SETQ_codegen(p)
			return accumulator
		else
			accumulator += print_expr cadr p
			accumulator += print_str("=")
			accumulator += print_expr caddr p
			return accumulator


	if (iscons(p))
		#if (car(p) == symbol(FORMAL) && cadr(p)->k == SYM) {
		#	print_str(((struct symbol *) cadr(p))->name)
		#	return
		#}
		accumulator += print_factor(car(p))
		p = cdr(p)
		if !omitParens then accumulator += print_str('(')
		if (iscons(p))
			accumulator += print_expr(car(p))
			p = cdr(p)
			while (iscons(p))
				accumulator += print_str(",")
				accumulator += print_expr(car(p))
				p = cdr(p)
		if !omitParens then accumulator += print_str(')')
		return accumulator

	if (p == symbol(DERIVATIVE))
		accumulator += print_char('d')
	else if (p == symbol(E))
		if codeGen
			accumulator += print_str("Math.E")
		else
			accumulator += print_str("e")
	else if (p == symbol(PI))
		if printMode == PRINTMODE_LATEX
			accumulator += print_str("\\pi")
		else
			accumulator += print_str("pi")
	else
		accumulator += print_str(get_printname(p))
	return accumulator


print_list = (p) ->
	accumulator = ""
	switch (p.k)
		when CONS
			accumulator += ('(')
			accumulator += print_list(car(p))
			if p == cdr(p) and p != symbol(NIL)
				console.log "oh no recursive!"
				debugger
			p = cdr(p)
			while (iscons(p))
				accumulator += (" ")
				accumulator += print_list(car(p))
				p = cdr(p)
				if p == cdr(p) and p != symbol(NIL)
					console.log "oh no recursive!"
					debugger
			if (p != symbol(NIL))
				accumulator += (" . ")
				accumulator += print_list(p)
			accumulator += (')')
		when STR
			#print_str("\"")
			accumulator += (p.str)
			#print_str("\"")
		when NUM, DOUBLE
			accumulator += print_number(p, true)
		when SYM
			accumulator += get_printname(p)
		else
			accumulator += ("<tensor>")
	return accumulator

print_multiply_sign = ->
	accumulator = ""
	if printMode == PRINTMODE_LATEX
		if printMode == PRINTMODE_PLAIN and !test_flag
			accumulator += print_str(" ")
		else
			return accumulator

	if printMode == PRINTMODE_PLAIN and !test_flag and !codeGen
		accumulator += print_str(" ")
	else
		accumulator += print_str("*")
	return accumulator

is_denominator = (p) ->
	if (car(p) == symbol(POWER) && cadr(p) != symbol(E) && isnegativeterm(caddr(p)))
		return 1
	else
		return 0

# don't consider the leading fraction
# we want 2/3*a*b*c instead of 2*a*b*c/3

any_denominators = (p) ->
	p = cdr(p)
	#	if (isfraction(car(p)))
	#		return 1
	while (iscons(p))
		q = car(p)
		if (is_denominator(q))
			return 1
		p = cdr(p)
	return 0

