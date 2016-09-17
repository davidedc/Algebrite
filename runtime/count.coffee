count = (p) ->
	if (iscons(p))
		n = 0
		while (iscons(p))
			n += count(car(p)) + 1
			p = cdr(p)
	else
		n = 1
	return n

# this probably works out to be
# more general than just counting symbols, it can
# probably count instances of anything you pass as
# first argument but didn't try it.
countOccurrencesOfSymbol = (needle,p) ->
	n = 0
	if (iscons(p))
		while (iscons(p))
			n += countOccurrencesOfSymbol(needle,car(p))
			p = cdr(p)
	else
		if equal(needle,p)
			n = 1
	return n
