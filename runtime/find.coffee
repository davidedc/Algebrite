# returns 1 if expr p contains expr q, otherweise returns 0



Find = (p, q) ->

	i = 0
	if (equal(p, q))
		return 1

	if (istensor(p))
		for i in [0...p.tensor.nelem]
			if (Find(p.tensor.elem[i], q))
				return 1
		return 0

	while (iscons(p))
		if (Find(car(p), q))
			return 1
		p = cdr(p)

	return 0

# find stuff like (-1)^(something (but disregard
# imaginary units which are in the form (-1)^(1/2))
findPossibleClockForm = (p) ->

	i = 0

	if isimaginaryunit(p)
		return 0

	if (car(p) == symbol(POWER) and !isinteger(caddr(p1)))
		if Find(cadr(p), imaginaryunit)
			#console.log "found i^fraction " + p
			return 1

	if (car(p) == symbol(POWER) && equaln(cadr(p), -1) && !isinteger(caddr(p1)))
		#console.log "found -1^fraction in " + p
		return 1

	if (istensor(p))
		for i in [0...p.tensor.nelem]
			if (findPossibleClockForm(p.tensor.elem[i]))
				return 1
		return 0

	while (iscons(p))
		if (findPossibleClockForm(car(p)))
			return 1
		p = cdr(p)

	return 0

# find stuff like (e)^(i something)
findPossibleExponentialForm = (p) ->

	i = 0

	if car(p) == symbol(POWER) && cadr(p)== symbol(E)
		return Find(caddr(p),imaginaryunit)

	if (istensor(p))
		for i in [0...p.tensor.nelem]
			if (findPossibleExponentialForm(p.tensor.elem[i]))
				return 1
		return 0

	while (iscons(p))
		if (findPossibleExponentialForm(car(p)))
			return 1
		p = cdr(p)

	return 0

$.Find = Find