#include "stdafx.h"
#include "defs.h"

#define F p3
#define X p4
#define N p5

Eval_integral = ->
	i = 0
	n = 0

	# evaluate 1st arg to get function F

	p1 = cdr(p1);
	push(car(p1));
	Eval();

	# evaluate 2nd arg and then...

	# example		result of 2nd arg	what to do
	#
	# integral(f)		nil			guess X, N = nil
	# integral(f,2)	2			guess X, N = 2
	# integral(f,x)	x			X = x, N = nil
	# integral(f,x,2)	x			X = x, N = 2
	# integral(f,x,y)	x			X = x, N = y

	p1 = cdr(p1);
	push(car(p1));
	Eval();

	p2 = pop();
	if (p2 == symbol(NIL))
		guess();
		push(symbol(NIL));
	else if (isnum(p2))
		guess();
		push(p2);
	else
		push(p2);
		p1 = cdr(p1);
		push(car(p1));
		Eval();

	p5 = pop();
	p4 = pop();
	p3 = pop();

	while (1)

		# N might be a symbol instead of a number

		if (isnum(p5))
			push(p5);
			n = pop_integer();
			if (n == 0x80000000)
				stop("nth integral: check n");
		else
			n = 1;

		push(p3);

		if (n >= 0)
			for i in [0...n]
				push(p4);
				integral();
		else
			n = -n;
			for i in [0...n]
				push(p4);
				derivative();

		p3 = pop();

		# if N is nil then arglist is exhausted

		if (p5 == symbol(NIL))
			break;

		# otherwise...

		# N		arg1		what to do
		#
		# number	nil		break
		# number	number		N = arg1, continue
		# number	symbol		X = arg1, N = arg2, continue
		#
		# symbol	nil		X = N, N = nil, continue
		# symbol	number		X = N, N = arg1, continue
		# symbol	symbol		X = N, N = arg1, continue

		if (isnum(p5))
			p1 = cdr(p1);
			push(car(p1));
			Eval();
			p5 = pop();
			if (p5 == symbol(NIL))
				break;		# arglist exhausted
			if (isnum(p5))
				doNothing = 1		# N = arg1
			else
				p4 = p5;		# X = arg1
				p1 = cdr(p1);
				push(car(p1));
				Eval();
				p5 = pop();	# N = arg2
		else
			p4 = p5;			# X = N
			p1 = cdr(p1);
			push(car(p1));
			Eval();
			p5 = pop();		# N = arg1

	push(p3);	# final result

integral = ->
	save();
	p2 = pop();
	p1 = pop();
	if (car(p1) == symbol(ADD))
		integral_of_sum();
	else if (car(p1) == symbol(MULTIPLY))
		integral_of_product();
	else
		integral_of_form();
	p1 = pop();
	if (Find(p1, symbol(INTEGRAL)))
		stop("integral: sorry, could not find a solution");
	push(p1);
	simplify();	# polish the result
	Eval();		# normalize the result
	restore();

integral_of_sum = ->
	p1 = cdr(p1);
	push(car(p1));
	push(p2);
	integral();
	p1 = cdr(p1);
	while (iscons(p1))
		push(car(p1));
		push(p2);
		integral();
		add();
		p1 = cdr(p1);

integral_of_product = ->
	push(p1);
	push(p2);
	partition();
	p1 = pop();			# pop variable part
	integral_of_form();
	multiply();			# multiply constant part

integral_of_form = ->
	push(p1);
	push(p2);
	transform(itab);
	p3 = pop();
	if (p3 == symbol(NIL))
		push_symbol(INTEGRAL);
		push(p1);
		push(p2);
		list(3);
	else
		push(p3);
