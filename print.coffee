print_str = (s) ->
	console.log s

printline = (p) ->
	print_expr(p)

print_expr = (p) ->
	if (isadd(p))
		p = cdr(p);
		if (sign_of_term(car(p)) == '-')
			print_str("-");
		print_term(car(p));
		p = cdr(p);
		while (iscons(p))
			if (sign_of_term(car(p)) == '+')
				if (test_flag == 0)
					print_str(" + ");
				else
					print_str("+");
			else
				if (test_flag == 0)
					print_str(" - ");
				else
					print_str("-");
			print_term(car(p));
			p = cdr(p);
	else
		if (sign_of_term(p) == '-')
			print_str("-");
		print_term(p);

sign_of_term = (p) ->
	if (car(p) == symbol(MULTIPLY) && isnum(cadr(p)) && lessp(cadr(p), zero))
		return '-';
	else if (isnum(p) && lessp(p, zero))
		return '-';
	else
		return '+';

print_term = (p) ->
	if (car(p) == symbol(MULTIPLY) && any_denominators(p))
		print_a_over_b(p);
		return;

	if (car(p) == symbol(MULTIPLY))
		p = cdr(p);

		# coeff -1?

		if (isminusone(car(p)))
			#			print_char('-');
			p = cdr(p);

		print_factor(car(p));
		p = cdr(p);
		while (iscons(p))
			print_multiply_sign();
			print_factor(car(p));
			p = cdr(p);
	else
		print_factor(p);

print_factor = (p) ->
	if (isnum(p))
		print_number(p);
		return;

	if (isstr(p))
		#print_str("\"");
		print_str(p.str);
		#print_str("\"");
		return;

	if (istensor(p))
		print_tensor(p);
		return;

	if (isadd(p) || car(p) == symbol(MULTIPLY))
		print_str("(");
		print_expr(p);
		print_str(")");
		return;

	if (car(p) == symbol(POWER))

		if (cadr(p) == symbol(E))
			print_str("exp(");
			print_expr(caddr(p));
			print_str(")");
			return;

		if (isminusone(caddr(p)))
			if (test_flag == 0)
				print_str("1 / ");
			else
				print_str("1/");
			if (iscons(cadr(p)))
				print_str("(");
				print_expr(cadr(p));
				print_str(")");
			else
				print_expr(cadr(p));
			return;

		if (isadd(cadr(p)) || caadr(p) == symbol(MULTIPLY) || caadr(p) == symbol(POWER) || isnegativenumber(cadr(p)))
			print_str("(");
			print_expr(cadr(p));
			print_str(")");
		else if (isnum(cadr(p)) && (lessp(cadr(p), zero) || isfraction(cadr(p))))
			print_str("(");
			print_factor(cadr(p));
			print_str(")");
		else
			print_factor(cadr(p));

		if (test_flag == 0)
			#print_str(" ^ ");
			print_str(power_str);
		else
			print_str("^");

		if (iscons(caddr(p)) || isfraction(caddr(p)) || (isnum(caddr(p)) && lessp(caddr(p), zero)))
			print_str("(");
			print_expr(caddr(p));
			print_str(")");
		else
			print_factor(caddr(p));
		return;

	#	if (car(p) == _list) {
	#		print_str("{");
	#		p = cdr(p);
	#		if (iscons(p)) {
	#			print_expr(car(p));
	#			p = cdr(p);
	#		}
	#		while (iscons(p)) {
	#			print_str(",");
	#			print_expr(car(p));
	#			p = cdr(p);
	#		}
	#		print_str("}");
	#		return;
	#	}

	if (car(p) == symbol(INDEX) && issymbol(cadr(p)))
		print_index_function(p);
		return;

	if (car(p) == symbol(FACTORIAL))
		print_factorial_function(p);
		return;

	if (iscons(p))
		#if (car(p) == symbol(FORMAL) && cadr(p)->k == SYM) {
		#	print_str(((struct symbol *) cadr(p))->name);
		#	return;
		#}
		print_factor(car(p));
		p = cdr(p);
		print_str("(");
		if (iscons(p))
			print_expr(car(p));
			p = cdr(p);
			while (iscons(p))
				if (test_flag == 0)
					print_str(",");
				else
					print_str(",");
				print_expr(car(p));
				p = cdr(p);
		print_str(")");
		return;

	if (p == symbol(DERIVATIVE))
		print_char('d');
	else if (p == symbol(E))
		print_str("exp(1)");
	else if (p == symbol(PI))
		print_str("pi");
	else
		print_str(get_printname(p));


print1 = (p, accumulator) ->
	topLevelCall = false
	if !accumulator?
		topLevelCall = true
		accumulator = ""
	switch (p.k)
		when CONS
			accumulator += ("(");
			accumulator = print1(car(p), accumulator);
			#if p == cdr(p)
			#	console.log "oh no recursive!"
			#	debugger
			p = cdr(p);
			while (iscons(p))
				accumulator += (" ");
				accumulator = print1(car(p), accumulator);
				p = cdr(p);
				#if p == cdr(p)
				#	console.log "oh no recursive!"
				#	debugger
			if (p != symbol(NIL))
				accumulator += (" . ");
				accumulator = print1(p, accumulator);
			accumulator += (")");
		when STR
			#print_str("\"");
			accumulator += (p.str);
			#print_str("\"");
		when NUM, DOUBLE
			accumulator = print_number(p, accumulator);
		when SYM
			accumulator += get_printname(p);
		else
			accumulator += ("<tensor>");
	if topLevelCall
		console.log accumulator
	else
		return accumulator

print_multiply_sign = ->
	if (test_flag == 0)
		print_str(" ");
	else
		print_str("*");

is_denominator = (p) ->
	if (car(p) == symbol(POWER) && cadr(p) != symbol(E) && isnegativeterm(caddr(p)))
		return 1;
	else
		return 0;

# don't consider the leading fraction
# we want 2/3*a*b*c instead of 2*a*b*c/3

any_denominators = (p) ->
	p = cdr(p);
	#	if (isfraction(car(p)))
	#		return 1;
	while (iscons(p))
		q = car(p);
		if (is_denominator(q))
			return 1;
		p = cdr(p);
	return 0;

