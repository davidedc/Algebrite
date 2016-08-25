power_str = "^"
stringToBePrinted = ""
latexMode = false
codeGen = false

Eval_printlatex = ->
	latexMode = true
	Eval_display()
	latexMode = false

Eval_display = ->
	p1 = cdr(p1);

	while (iscons(p1))

		push(car(p1));
		Eval();
		p2 = pop();

		# display single symbol as "symbol = result"

		# but don't display "symbol = symbol"

		###
		if (issymbol(car(p1)) && car(p1) != p2)
			push_symbol(SETQ);
			push(car(p1));
			push(p2);
			list(3);
			p2 = pop();
		###

		if (equaln(get_binding(symbol(TTY)), 1))
			beenPrinted = printline(p2);
		else
			beenPrinted = printline(p2);
			#push(p2);
			#cmdisplay();

		# we put the printed string into
		# a special variable that we are
		# then going to check for the tests
		if latexMode
			scan('"' + beenPrinted + '"')
			parsedString = pop()
			set_binding(symbol(LAST_LATEX_PRINT), parsedString)


		p1 = cdr(p1);

	push(symbol(NIL));

print_str = (s) ->
	stringToBePrinted += s

print_char = (c) ->
	stringToBePrinted += c

collectPlainResultLine = (p) ->
	stringToBePrinted = ""
	print_expr(p)
	return stringToBePrinted

collectLatexResultLine = (p) ->
	stringToBePrinted = ""
	latexMode = true
	print_expr(p)
	latexMode = false
	return stringToBePrinted

printline = (p) ->
	#debugger
	stringToBePrinted = ""
	print_expr(p)
	console.log stringToBePrinted
	return stringToBePrinted


print_base_of_denom = (p1) ->
	if (isfraction(p1) || car(p1) == symbol(ADD) || car(p1) == symbol(MULTIPLY) || car(p1) == symbol(POWER) || lessp(p1, zero)) # p1 is BASE
			print_char('(')
			print_expr(p1); # p1 is BASE
			print_char(')')
	else
		print_expr(p1); # p1 is BASE

print_expo_of_denom = (p2) ->
	if (isfraction(p2) || car(p2) == symbol(ADD) || car(p2) == symbol(MULTIPLY) || car(p2) == symbol(POWER)) # p2 is EXPO
		print_char('(')
		print_expr(p2); # p2 is EXPO
		print_char(')')
	else
		print_expr(p2); # p2 is EXPO

# prints stuff after the divide symbol "/"

# d is the number of denominators

#define BASE p1
#define EXPO p2

print_denom = (p, d) ->
	save()

	p1 = cadr(p); # p1 is BASE
	p2 = caddr(p); # p2 is EXPO

	# i.e. 1 / (2^(1/3))

	# get the cases like BASE^(-1) out of
	# the way, they just become 1/BASE
	if (isminusone(p2)) # p2 is EXPO
		print_base_of_denom p1
		restore()
		return

	if (d == 1) # p2 is EXPO
		print_char('(')

	# prepare the exponent
	# (needs to be negated)
	# before printing it out
	push(p2); # p2 is EXPO
	negate()
	p2 = pop(); # p2 is EXPO
	print_power(p1,p2)
	if (d == 1)
		print_char(')')
	restore()


#define A p3
#define B p4

print_a_over_b = (p) ->
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
	if latexMode
		print_str('\\frac{')

	if (n == 0)
		print_char('1')
	else
		flag = 0
		p1 = cdr(p)
		if (isrational(car(p1)))
			p1 = cdr(p1)
		if (!isplusone(p3)) # p3 is A
			print_factor(p3); # p3 is A
			flag = 1
		while (iscons(p1))
			p2 = car(p1)
			if (is_denominator(p2))
				doNothing = 1
			else
				if (flag)
					print_multiply_sign()
				print_factor(p2)
				flag = 1
			p1 = cdr(p1)

	if latexMode
		print_str('}{')
	else if (test_flag == 0)
		print_str(" / ")
	else
		print_str("/")

	if (d > 1 and !latexMode)
		print_char('(')


	flag = 0
	p1 = cdr(p)

	if (isrational(car(p1)))
		p1 = cdr(p1)

	if (!isplusone(p4)) # p4 is B
		print_factor(p4); # p4 is B
		flag = 1

	while (iscons(p1))
		p2 = car(p1)
		if (is_denominator(p2))
			if (flag)
				print_multiply_sign()
			print_denom(p2, d)
			flag = 1
		p1 = cdr(p1)

	if (d > 1 and !latexMode)
		print_char(')')

	if latexMode
		print_str('}')

	restore()


print_expr = (p) ->
	if (isadd(p))
		p = cdr(p)
		if (sign_of_term(car(p)) == '-')
			print_str("-")
		print_term(car(p))
		p = cdr(p)
		while (iscons(p))
			if (sign_of_term(car(p)) == '+')
				if (test_flag == 0)
					print_str(" + ")
				else
					print_str("+")
			else
				if (test_flag == 0)
					print_str(" - ")
				else
					print_str("-")
			print_term(car(p))
			p = cdr(p)
	else
		if (sign_of_term(p) == '-')
			print_str("-")
		print_term(p)

sign_of_term = (p) ->
	if (car(p) == symbol(MULTIPLY) && isnum(cadr(p)) && lessp(cadr(p), zero))
		return '-'
	else if (isnum(p) && lessp(p, zero))
		return '-'
	else
		return '+'

print_term = (p) ->
	if (car(p) == symbol(MULTIPLY) && any_denominators(p))
		print_a_over_b(p)
		return

	if (car(p) == symbol(MULTIPLY))
		p = cdr(p)

		# coeff -1?

		if (isminusone(car(p)))
			#			print_char('-')
			p = cdr(p)

		print_factor(car(p))
		p = cdr(p)
		while (iscons(p))
			print_multiply_sign()
			print_factor(car(p))
			p = cdr(p)
	else
		print_factor(p)

print_subexpr = (p) ->
	print_char('(')
	print_expr(p)
	print_char(')')

print_factorial_function = (p) ->
	p = cadr(p)
	if (car(p) == symbol(ADD) || car(p) == symbol(MULTIPLY) || car(p) == symbol(POWER) || car(p) == symbol(FACTORIAL))
		print_subexpr(p)
	else
		print_expr(p)
	print_char('!')

print_ABS_latex = (p) ->
	print_str("\\left |")
	print_expr(cadr(p))
	print_str(" \\right |")

print_BINOMIAL_latex = (p) ->
	print_str("\\binom{")
	print_expr(cadr(p))
	print_str("}{")
	print_expr(caddr(p))
	if (test_flag == 0)
	 	print_str("} ")
	 else
	 	print_str("}")

print_DOT_latex = (p) ->
	if (test_flag == 0)
	 	print_str(" ")
	print_expr(cadr(p))
	if (test_flag == 0)
		print_str(" \\cdot ")
	else
		# note that the space "after"
		# is needed
		print_str("\\cdot ")
	print_expr(caddr(p))
	if (test_flag == 0)
	 	print_str(" ")

print_SQRT_latex = (p) ->
	print_str("\\sqrt{")
	print_expr(cadr(p))
	if (test_flag == 0)
	 	print_str("} ")
	 else
	 	print_str("}")

print_TRANSPOSE_latex = (p) ->
	print_str("{")
	print_expr(cadr(p))
	print_str("}")
	print_str("^T")

print_DEFINT_latex = (p) ->
	functionBody = car(cdr(p))

	p = cdr(p)
	originalIntegral = p
	numberOfIntegrals = 0

	while iscons(cdr(cdr(p)))
		numberOfIntegrals++
		theIntegral = cdr(cdr(p))

		print_str("\\int^{")
		print_expr(car(cdr(theIntegral)))
		print_str("}_{")
		print_expr(car(theIntegral))
		if (test_flag == 0)
			print_str("} \\! ")
		else
			print_str("}\\!")
		p = cdr(theIntegral)

	print_expr(functionBody)
	if (test_flag == 0)
		print_str(" \\,")
	else
		print_str("\\,")

	p = originalIntegral

	for i in [1..numberOfIntegrals]
		theVariable = cdr(p)
		if (test_flag == 0)
			print_str(" \\mathrm{d} ")
		else
			print_str("\\mathrm{d}")
		print_expr(car(theVariable))
		if i < numberOfIntegrals
			if (test_flag == 0)
				print_str(" \\, ")
			else
				print_str("\\,")
		p = cdr(cdr(theVariable))



print_tensor = (p) ->
	print_tensor_inner(p, 0, 0)

print_tensor_inner = (p, j, k) ->
	i = 0
	if codeGen then print_str("[") else print_str("(")
	for i in [0...p.tensor.dim[j]]
		if (j + 1 == p.tensor.ndim)
			print_expr(p.tensor.elem[k])
			k++
		else
			k = print_tensor_inner(p, j + 1, k)
		if (i + 1 < p.tensor.dim[j])
			if (test_flag == 0)
				print_str(",")
			else
				print_str(",")
	if codeGen then print_str("]") else print_str(")")
	return k

print_base = (p) ->
	if (isadd(cadr(p)) || caadr(p) == symbol(MULTIPLY) || caadr(p) == symbol(POWER) || isnegativenumber(cadr(p)))
		print_str("(")
		print_expr(cadr(p))
		print_str(")")
	else if (isnum(cadr(p)) && (lessp(cadr(p), zero) || isfraction(cadr(p))))
		print_str("(")
		print_factor(cadr(p))
		print_str(")")
	else
		print_factor(cadr(p))

print_exponent = (p) ->
	if (iscons(caddr(p)) || isfraction(caddr(p)) || (isnum(caddr(p)) && lessp(caddr(p), zero)))
		print_str("(")
		print_expr(caddr(p))
		print_str(")")
	else
		print_factor(caddr(p))

print_power = (base, exponent) ->

	#debugger

	if codeGen
		print_str("Math.pow(")
		print_base_of_denom base
		print_str(", ")
		print_expo_of_denom exponent
		print_str(")")
		return

	if ((equaln(get_binding(symbol(PRINT_LEAVE_E_ALONE)), 1)) and base == symbol(E))
		if latexMode
			print_str("e^{")
			print_expr(exponent)
			print_str("}")
		else
			print_str("exp(")
			print_expr(exponent)
			print_str(")")
		return

	
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
				if latexMode
					print_str("\\frac{1}{")
				else if (test_flag == 0)
					print_str("1 / ")
				else
					print_str("1/")

				if (iscons(base) and !latexMode)
					print_str("(")
					print_expr(base)
					print_str(")")
				else
					print_expr(base)

				if latexMode
					print_str("}")

				return

			if (isnegativeterm(exponent))
				if latexMode
					print_str("\\frac{1}{")
				else if (test_flag == 0)
					print_str("1 / ")
				else
					print_str("1/")

				push(exponent)
				push_integer(-1)
				multiply()
				newExponent = pop()

				if (iscons(base) and !latexMode)
					print_str("(")
					print_power(base, newExponent)
					print_str(")")
				else
					print_power(base, newExponent)


				if latexMode
					print_str("}")

				return


		if (isfraction(exponent) and latexMode)
				print_str("\\sqrt")
				push(exponent)
				denominator()
				denomExponent = pop()
				# we omit the "2" on the radical
				if !isplustwo(denomExponent)
					print_str("[")
					print_expr(denomExponent)
					print_str("]")
				print_str("{")
				push(exponent)
				numerator()
				numExponent = pop()
				exponent = numExponent
				print_power(base, exponent)
				print_str("}")
				return

	if latexMode and isplusone(exponent)
		# if we are in latex mode we turn many
		# radicals into a radix sign with a power
		# underneath, and the power is often one
		# (e.g. square root turns into a radical
		# with a power one underneath) so handle
		# this case simply here, just print the base
		print_expr(base)
	else
		# print the base,
		# determining if it needs to be
		# wrapped in parentheses or not
		if (isadd(base) || isnegativenumber(base))
			print_str("(")
			print_expr(base)
			print_str(")")
		else if ( car(base) == symbol(MULTIPLY) || car(base) == symbol(POWER))
			if !latexMode then print_str("(")
			print_factor(base)
			if !latexMode then print_str(")")
		else if (isnum(base) && (lessp(base, zero) || isfraction(base)))
			print_str("(")
			print_factor(base)
			print_str(")")
		else
			print_factor(base)

		# print the power symbol
		#debugger
		if (test_flag == 0)
			#print_str(" ^ ")
			print_str(power_str)
		else
			print_str("^")

		# print the exponent
		if (iscons(exponent) || isfraction(exponent) || (isnum(exponent) && lessp(exponent, zero)))
			if latexMode
				print_str("{")
			else
				print_str("(")
			print_expr(exponent)
			if latexMode
				print_str("}")
			else
				print_str(")")
		else
			print_factor(exponent)


print_factor = (p) ->
	if (isnum(p))
		print_number(p)
		return

	if (isstr(p))
		print_str("\"")
		print_str(p.str)
		print_str("\"")
		return

	if (istensor(p))
		print_tensor(p)
		return

	if (car(p) == symbol(MULTIPLY))
		if (sign_of_term(p) == '-' or !latexMode)
			if latexMode
				print_str(" \\left (")
			else
				print_str("(")
		print_expr(p)
		if (sign_of_term(p) == '-' or !latexMode)
			if latexMode
				print_str(" \\right ) ")
			else
				print_str("(")
		return
	else if (isadd(p))
		print_str("(")
		print_expr(p)
		print_str(")")
		return

	if (car(p) == symbol(POWER))
		base = cadr(p)
		exponent = caddr(p)
		print_power(base, exponent)
		return

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

	if (car(p) == symbol(INDEX) && issymbol(cadr(p)))
		print_index_function(p)
		return

	if (car(p) == symbol(FACTORIAL))
		print_factorial_function(p)
		return
	else if (car(p) == symbol(ABS) && latexMode)
		print_ABS_latex(p)
		return
	else if (car(p) == symbol(SQRT) && latexMode)
		#debugger
		print_SQRT_latex(p)
		return
	else if (car(p) == symbol(TRANSPOSE) && latexMode)
		print_TRANSPOSE_latex(p)
		return
	else if (car(p) == symbol(BINOMIAL) && latexMode)
		print_BINOMIAL_latex(p)
		return
	else if (car(p) == symbol(DEFINT) && latexMode)
		print_DEFINT_latex(p)
		return
	else if ((car(p) == symbol(DOT) or car(p) == symbol(INNER)) && latexMode)
		print_DOT_latex(p)
		return


	if (iscons(p))
		#if (car(p) == symbol(FORMAL) && cadr(p)->k == SYM) {
		#	print_str(((struct symbol *) cadr(p))->name)
		#	return
		#}
		print_factor(car(p))
		p = cdr(p)
		print_str("(")
		if (iscons(p))
			print_expr(car(p))
			p = cdr(p)
			while (iscons(p))
				if (test_flag == 0)
					print_str(",")
				else
					print_str(",")
				print_expr(car(p))
				p = cdr(p)
		print_str(")")
		return

	if (p == symbol(DERIVATIVE))
		print_char('d')
	else if (p == symbol(E))
		if latexMode
			print_str("e")
		else
			print_str("exp(1)")
	else if (p == symbol(PI))
		if latexMode
			print_str("\\pi")
		else
			print_str("pi")
	else
		print_str(get_printname(p))


print1 = (p, accumulator) ->
	topLevelCall = false
	if !accumulator?
		topLevelCall = true
		accumulator = ""
	switch (p.k)
		when CONS
			accumulator += ("(")
			accumulator = print1(car(p), accumulator)
			if p == cdr(p)
				console.log "oh no recursive!"
				debugger
			p = cdr(p)
			while (iscons(p))
				accumulator += (" ")
				accumulator = print1(car(p), accumulator)
				p = cdr(p)
				if p == cdr(p)
					console.log "oh no recursive!"
					debugger
			if (p != symbol(NIL))
				accumulator += (" . ")
				accumulator = print1(p, accumulator)
			accumulator += (")")
		when STR
			#print_str("\"")
			accumulator += (p.str)
			#print_str("\"")
		when NUM, DOUBLE
			accumulator = print_number(p, accumulator)
		when SYM
			accumulator += get_printname(p)
		else
			accumulator += ("<tensor>")
	if topLevelCall
		console.log accumulator
	else
		return accumulator

print_multiply_sign = ->
	if latexMode
		if test_flag == 0
			print_str(" ")
		else
			return

	if test_flag == 0 and !codeGen
		print_str(" ")
	else
		print_str("*")

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

