print1 = (p) ->
	switch (p.k)
		when CONS
			console.log("(");
			print1(car(p));
			#if p == cdr(p)
			#	console.log "oh no recursive!"
			#	debugger
			p = cdr(p);
			while (iscons(p))
				console.log(" ");
				print1(car(p));
				p = cdr(p);
				#if p == cdr(p)
				#	console.log "oh no recursive!"
				#	debugger
			if (p != symbol(NIL))
				console.log(" . ");
				print1(p);
			console.log(")");
		when STR
			#print_str("\"");
			console.log(p.str);
			#print_str("\"");
		when NUM, DOUBLE
			print_number(p);
		when SYM
			console.log(get_printname(p));
		else
			console.log("<tensor>");

