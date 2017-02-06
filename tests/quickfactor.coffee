test_quickfactor = ->
	i = 0
	logout("testing quickfactor\n")
	for i in [2...10001]
		if i % 1000 == 0
			console.log i
		base = i
		push_integer(base)
		push_integer(1)
		quickfactor()
		h = tos
		j = 0
		while (base > 1)
			expo = 0
			while (base % primetab[j] == 0)
				base /= primetab[j]
				expo++
			if (expo)
				push_integer(primetab[j])
				push_integer(expo)
				quickpower()
			j++
		multiply_all(tos - h)
		p2 = pop()
		p1 = pop()
		if (!equal(p1, p2))
			logout("failed\n")
			print_lisp(p1)
			print_lisp(p2)
			errout()
	console.log "quickfactor is ok"
	logout("ok\n")

#endif
