###
 Symbolic addition

	Terms in a sum are combined if they are identical modulo rational
	coefficients.

	For example, A + 2A becomes 3A.

	However, the sum A + sqrt(2) A is not modified.

	Combining terms can lead to second-order effects.

	For example, consider the case of

		1/sqrt(2) A + 3/sqrt(2) A + sqrt(2) A

	The first two terms are combined to yield 2 sqrt(2) A.

	This result can now be combined with the third term to yield

		3 sqrt(2) A
###

#include "stdafx.h"
#include "defs.h"

flag = 0;

eval_add = ->
	int h = tos;
	p1 = cdr(p1);
	while (iscons(p1))
		push(car(p1));
		eval();
		p2 = pop();
		push_terms(p2);
		p1 = cdr(p1);
	add_terms(tos - h);

# Add n terms, returns one expression on the stack.

add_terms = (n) ->

	h = tos - n;

	s = stack + h;

	# ensure no infinite loop, use "for"

	for i in [0...10]

		if (n < 2)
			break;

		flag = 0;

		console.log "!!!! qsort not implemented"
		debugger
		#qsort(s, n, sizeof (U *), cmp_terms);

		if (flag == 0)
			break;

		n = combine_terms(s, n);

	tos = h + n;

	switch (n)
		when 0
			push_integer(0);
		when 1
		else
			list(n);
			p1 = pop();
			push_symbol(ADD);
			push(p1);
			cons();

# Compare terms for order, clobbers p1 and p2.

cmp_terms = (p1, p2) ->

	# numbers can be combined

	if (isnum(p1) && isnum(p2))
		flag = 1;
		return 0;

	# congruent tensors can be combined

	if (istensor(p1) && istensor(p2))
		if (p1.tensor.ndim < p2.tensor.ndim)
			return -1;
		if (p1.tensor.ndim > p2.tensor.ndim)
			return 1;
		for i in [0...p1.tensor.ndim]
			if (p1.tensor.dim[i] < p2.tensor.dim[i])
				return -1;
			if (p1.tensor.dim[i] > p2.tensor.dim[i])
				return 1;
		flag = 1;
		return 0;

	if (car(p1) == symbol(MULTIPLY))
		p1 = cdr(p1);
		if (isnum(car(p1)))
			p1 = cdr(p1);
			if (cdr(p1) == symbol(NIL))
				p1 = car(p1);

	if (car(p2) == symbol(MULTIPLY))
		p2 = cdr(p2);
		if (isnum(car(p2)))
			p2 = cdr(p2);
			if (cdr(p2) == symbol(NIL))
				p2 = car(p2);

	t = cmp_expr(p1, p2);

	if (t == 0)
		flag = 1;

	return t;

###
 Compare adjacent terms in s[] and combine if possible.

	Returns the number of terms remaining in s[].

	n	number of terms in s[] initially
###

combine_terms = (s, n) ->

	for i in [0...n]
		check_esc_flag();

		p3 = s[i];
		p4 = s[i + 1];

		if (istensor(p3) && istensor(p4))
			push(p3);
			push(p4);
			tensor_plus_tensor();
			p1 = pop();
			if (p1 != symbol(NIL))
				s[i] = p1;
				for j in [(i + 1)...(n - 1)]
					s[j] = s[j + 1];
				n--;
				i--;
			continue;

		if (istensor(p3) || istensor(p4))
			continue;

		if (isnum(p3) && isnum(p4))
			push(p3);
			push(p4);
			add_numbers();
			p1 = pop();
			if (iszero(p1))
				for j in [i...(n - 2)]
					s[j] = s[j + 2];
				n -= 2;
			else
				s[i] = p1;
				for j in [(i + 1)...(n - 1)]
					s[j] = s[j + 1];
				n--;
			i--;
			continue;

		if (isnum(p3) || isnum(p4))
			continue;

		p1 = one;
		p2 = one;

		t = 0;

		if (car(p3) == symbol(MULTIPLY))
			p3 = cdr(p3);
			t = 1; # p3 is now denormal
			if (isnum(car(p3)))
				p1 = car(p3);
				p3 = cdr(p3);
				if (cdr(p3) == symbol(NIL))
					p3 = car(p3);
					t = 0;

		if (car(p4) == symbol(MULTIPLY))
			p4 = cdr(p4);
			if (isnum(car(p4)))
				p2 = car(p4);
				p4 = cdr(p4);
				if (cdr(p4) == symbol(NIL))
					p4 = car(p4);

		if (!equal(p3, p4))
			continue;

		push(p1);
		push(p2);
		add_numbers();

		p1 = pop();

		if (iszero(p1))
			for j in [i...(n - 2)]
				s[j] = s[j + 2];
			n -= 2;
			i--;
			continue;

		push(p1);

		if (t)
			push(symbol(MULTIPLY));
			push(p3);
			cons();
		else
			push(p3);

		multiply();

		s[i] = pop();

		for j in [(i + 1)...(n - 1)]
			s[j] = s[j + 1];

		n--;
		i--;

	return n;

push_terms = (p) ->
	if (car(p) == symbol(ADD))
		p = cdr(p);
		while (iscons(p))
			push(car(p));
			p = cdr(p);
	else if (!iszero(p))
		push(p);

# add two expressions

add = ->
	save();
	p2 = pop();
	p1 = pop();
	h = tos;
	push_terms(p1);
	push_terms(p2);
	add_terms(tos - h);
	restore();

add_all = (k) ->
	save();
	s = stack + tos - k;
	h = tos;
	for i in [0...k]
		push_terms(s[i]);
	add_terms(tos - h);
	p1 = pop();
	tos -= k;
	push(p1);
	restore();

subtract = ->
	negate();
	add();
