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

$.Find = Find