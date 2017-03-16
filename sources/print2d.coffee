###

Prints in "2d", e.g. instead of 1/(x+1)^2 :

      1
 ----------
         2
  (1 + x)

 Note that although this looks more natural, a) it's not parsable and
 b) it can be occasionally be ambiguous, such as:

   1
 ----
   2
 x

is 1/x^2 but it also looks a little like x^(1/2)

###

#-----------------------------------------------------------------------------
#
#	Examples:
#
#	   012345678
#	-2 .........
#	-1 .........
#	 0 ..hello..	x=2, y=0, h=1, w=5
#	 1 .........
#	 2 .........
#
#	   012345678
#	-2 .........
#	-1 ..355....
#	 0 ..---....	x=2, y=-1, h=3, w=3
#	 1 ..113....
#	 2 .........
#
#-----------------------------------------------------------------------------



YMAX = 10000
class glyph
	c: 0
	x: 0
	y: 0

# will contain glyphs
chartab = []
for charTabIndex in [0...YMAX]
	chartab[charTabIndex] = new glyph()


yindex = 0
level = 0
emit_x = 0
expr_level = 0
display_flag = 0


# this is not really the translated version,
# the original is in window.cpp and is
# rather more complex
printchar_nowrap = (character) ->
	accumulator = ""
	accumulator += character
	return accumulator

printchar = (character) ->
	return printchar_nowrap character

print2dascii = (p) ->
	h = 0
	w = 0
	y = 0

	save()

	yindex = 0
	level = 0
	emit_x = 0
	emit_top_expr(p)

	# if too wide then print flat

	[h,w,y] = get_size(0, yindex)

	if (w > 100)
		printline(p)
		restore()
		return

	beenPrinted = print_glyphs()

	restore()
	return beenPrinted

emit_top_expr = (p) ->
	if (car(p) == symbol(SETQ))
		emit_expr(cadr(p))
		__emit_str(" = ")
		emit_expr(caddr(p))
		return

	if (istensor(p))
		emit_tensor(p)
	else
		emit_expr(p)

will_be_displayed_as_fraction = (p) ->
	if (level > 0)
		return 0
	if (isfraction(p))
		return 1
	if (car(p) != symbol(MULTIPLY))
		return 0
	if (isfraction(cadr(p)))
		return 1
	while (iscons(p))
		if (isdenominator(car(p)))
			return 1
		p = cdr(p)
	return 0

emit_expr = (p) ->
	#	if (level > 0) {
	#		printexpr(p)
	#		return
	#	}
	expr_level++
	if (car(p) == symbol(ADD))
		p = cdr(p)
		if (__is_negative(car(p)))
			__emit_char('-')
			if (will_be_displayed_as_fraction(car(p)))
				__emit_char(' ')
		emit_term(car(p))
		p = cdr(p)
		while (iscons(p))
			if (__is_negative(car(p)))
				__emit_char(' ')
				__emit_char('-')
				__emit_char(' ')
			else
				__emit_char(' ')
				__emit_char('+')
				__emit_char(' ')

			emit_term(car(p))
			p = cdr(p)
	else
		if (__is_negative(p))
			__emit_char('-')
			if (will_be_displayed_as_fraction(p))
				__emit_char(' ')
		emit_term(p)
	expr_level--

emit_unsigned_expr = (p) ->
	if (car(p) == symbol(ADD))
		p = cdr(p)
		#		if (__is_negative(car(p)))
		#			__emit_char('-')
		emit_term(car(p))
		p = cdr(p)
		while (iscons(p))
			if (__is_negative(car(p)))
				__emit_char(' ')
				__emit_char('-')
				__emit_char(' ')
			else
				__emit_char(' ')
				__emit_char('+')
				__emit_char(' ')
			emit_term(car(p))
			p = cdr(p)
	else
		#		if (__is_negative(p))
		#			__emit_char('-')
		emit_term(p)

__is_negative = (p) ->
	if (isnegativenumber(p))
		return 1
	if (car(p) == symbol(MULTIPLY) && isnegativenumber(cadr(p)))
		return 1
	return 0

emit_term = (p) ->
	if (car(p) == symbol(MULTIPLY))
		n = count_denominators(p)
		if (n && level == 0)
			emit_fraction(p, n)
		else
			emit_multiply(p, n)
	else
		emit_factor(p)

isdenominator = (p) ->
	if (car(p) == symbol(POWER) && cadr(p) != symbol(E) && __is_negative(caddr(p)))
		return 1
	else
		return 0

count_denominators = (p) ->
	count = 0
	p = cdr(p)
	#	if (isfraction(car(p))) {
	#		count++
	#		p = cdr(p)
	#	}
	while (iscons(p))
		q = car(p)
		if (isdenominator(q))
			count++
		p = cdr(p)
	return count

# n is the number of denominators, not counting a fraction like 1/2
emit_multiply = (p, n) ->
	if (n == 0)
		p = cdr(p)
		if (isplusone(car(p)) || isminusone(car(p)))
			p = cdr(p)
		emit_factor(car(p))
		p = cdr(p)
		while (iscons(p))
			__emit_char(' ')
			emit_factor(car(p))
			p = cdr(p)
	else
		emit_numerators(p)
		__emit_char('/')
		# need grouping if more than one denominator
		if (n > 1 || isfraction(cadr(p)))
			__emit_char('(')
			emit_denominators(p)
			__emit_char(')')
		else
			emit_denominators(p)

#define A p3
#define B p4

# sign of term has already been emitted

emit_fraction = (p, d) ->
	count = 0
	k1 = 0
	k2 = 0
	n = 0
	x = 0

	save()

	p3 = one; # p3 is A
	p4 = one; # p4 is B

	# handle numerical coefficient

	if (isrational(cadr(p)))
		push(cadr(p))
		mp_numerator()
		absval()
		p3 = pop();  # p3 is A
		push(cadr(p))
		mp_denominator()
		p4 = pop(); # p4 is B

	if (isdouble(cadr(p)))
		push(cadr(p))
		absval()
		p3 = pop(); # p3 is A

	# count numerators

	if (isplusone(p3)) # p3 is A
		n = 0
	else
		n = 1
	p1 = cdr(p)
	if (isnum(car(p1)))
		p1 = cdr(p1)
	while (iscons(p1))
		p2 = car(p1)
		if (isdenominator(p2))
			doNothing = 1
		else
			n++
		p1 = cdr(p1)

	# emit numerators

	x = emit_x

	k1 = yindex

	count = 0

	# emit numerical coefficient

	if (!isplusone(p3))  # p3 is A
		emit_number(p3, 0);  # p3 is A
		count++

	# skip over "multiply"

	p1 = cdr(p)

	# skip over numerical coefficient, already handled

	if (isnum(car(p1)))
		p1 = cdr(p1)

	while (iscons(p1))
		p2 = car(p1)
		if (isdenominator(p2))
			doNothing = 1
		else
			if (count > 0)
				__emit_char(' ')
			if (n == 1)
				emit_expr(p2)
			else
				emit_factor(p2)
			count++
		p1 = cdr(p1)

	if (count == 0)
		__emit_char('1')

	# emit denominators

	k2 = yindex

	count = 0

	if (!isplusone(p4))  # p4 is B
		emit_number(p4, 0);  # p4 is B
		count++
		d++

	p1 = cdr(p)

	if (isrational(car(p1)))
		p1 = cdr(p1)

	while (iscons(p1))
		p2 = car(p1)
		if (isdenominator(p2))
			if (count > 0)
				__emit_char(' ')
			emit_denominator(p2, d)
			count++
		p1 = cdr(p1)

	fixup_fraction(x, k1, k2)

	restore()

# p points to a multiply

emit_numerators = (p) ->
	save()

	n = 0

	p1 = one

	p = cdr(p)

	if (isrational(car(p)))
		push(car(p))
		mp_numerator()
		absval()
		p1 = pop()
		p = cdr(p)
	else if (isdouble(car(p)))
		push(car(p))
		absval()
		p1 = pop()
		p = cdr(p)

	n = 0

	if (!isplusone(p1))
		emit_number(p1, 0)
		n++

	while (iscons(p))
		if (isdenominator(car(p)))
			doNothing = 1
		else
			if (n > 0)
				__emit_char(' ')
			emit_factor(car(p))
			n++
		p = cdr(p)

	if (n == 0)
		__emit_char('1')

	restore()

# p points to a multiply

emit_denominators = (p) ->

	save()

	n = 0

	p = cdr(p)

	if (isfraction(car(p)))
		push(car(p))
		mp_denominator()
		p1 = pop()
		emit_number(p1, 0)
		n++
		p = cdr(p)

	while (iscons(p))
		if (isdenominator(car(p)))
			if (n > 0)
				__emit_char(' ')
			emit_denominator(car(p), 0)
			n++
		p = cdr(p)

	restore()

emit_factor = (p) ->
	if (istensor(p))
		if (level == 0)
			#emit_tensor(p)
			emit_flat_tensor(p)
		else
			emit_flat_tensor(p)
		return

	if (isdouble(p))
		emit_number(p, 0)
		return

	if (car(p) == symbol(ADD) || car(p) == symbol(MULTIPLY))
		emit_subexpr(p)
		return

	if (car(p) == symbol(POWER))
		emit_power(p)
		return

	if (iscons(p))
		#if (car(p) == symbol(FORMAL) && cadr(p).k == SYM)
		#	emit_symbol(cadr(p))
		#else
		emit_function(p)
		return

	if (isnum(p))
		if (level == 0)
			emit_numerical_fraction(p)
		else
			emit_number(p, 0)
		return

	if (issymbol(p))
		emit_symbol(p)
		return

	if (isstr(p))
		emit_string(p)
		return

emit_numerical_fraction = (p) ->
	k1 = 0
	k2 = 0
	x = 0

	save()

	push(p)
	mp_numerator()
	absval()
	p3 = pop();  # p3 is A

	push(p)
	mp_denominator()
	p4 = pop(); # p4 is B

	if (isplusone(p4))  # p4 is B
		emit_number(p3, 0); # p3 is A
		restore()
		return

	x = emit_x

	k1 = yindex

	emit_number(p3, 0);  # p3 is A

	k2 = yindex

	emit_number(p4, 0)  # p4 is B

	fixup_fraction(x, k1, k2)

	restore()

# if it's a factor then it doesn't need parens around it, i.e. 1/sin(theta)^2

isfactor = (p) ->
	if (iscons(p) && car(p) != symbol(ADD) && car(p) != symbol(MULTIPLY) && car(p) != symbol(POWER))
		return 1
	if (issymbol(p))
		return 1
	if (isfraction(p))
		return 0
	if (isnegativenumber(p))
		return 0
	if (isnum(p))
		return 1
	return 0

emit_power = (p) ->
	k1 = 0
	k2 = 0
	x = 0

	if (cadr(p) == symbol(E))
		__emit_str("exp(")
		emit_expr(caddr(p))
		__emit_char(')')
		return

	if (level > 0)
		if (isminusone(caddr(p)))
			__emit_char('1')
			__emit_char('/')
			if (isfactor(cadr(p)))
				emit_factor(cadr(p))
			else
				emit_subexpr(cadr(p))
		else
			if (isfactor(cadr(p)))
				emit_factor(cadr(p))
			else
				emit_subexpr(cadr(p))
			__emit_char('^')
			if (isfactor(caddr(p)))
				emit_factor(caddr(p))
			else
				emit_subexpr(caddr(p))
		return

	# special case: 1 over something

	if (__is_negative(caddr(p)))
		x = emit_x
		k1 = yindex
		__emit_char('1')
		k2 = yindex
		#level++
		emit_denominator(p, 1)
		#level--
		fixup_fraction(x, k1, k2)
		return

	k1 = yindex
	if (isfactor(cadr(p)))
		emit_factor(cadr(p))
	else
		emit_subexpr(cadr(p))
	k2 = yindex
	level++
	emit_expr(caddr(p))
	level--
	fixup_power(k1, k2)

# if n == 1 then emit as expr (no parens)

# p is a power

emit_denominator = (p, n) ->
	k1 = 0
	k2 = 0

	# special case: 1 over something

	if (isminusone(caddr(p)))
		if (n == 1)
			emit_expr(cadr(p))
		else
			emit_factor(cadr(p))
		return

	k1 = yindex

	# emit base

	if (isfactor(cadr(p)))
		emit_factor(cadr(p))
	else
		emit_subexpr(cadr(p))

	k2 = yindex

	# emit exponent, don't emit minus sign

	level++

	emit_unsigned_expr(caddr(p))

	level--

	fixup_power(k1, k2)

emit_function = (p) ->
	if (car(p) == symbol(INDEX) && issymbol(cadr(p)))
		emit_index_function(p)
		return

	if (car(p) == symbol(FACTORIAL))
		emit_factorial_function(p)
		return

	if (car(p) == symbol(DERIVATIVE))
		__emit_char('d')
	else
		emit_symbol(car(p))
	__emit_char('(')
	p = cdr(p)
	if (iscons(p))
		emit_expr(car(p))
		p = cdr(p)
		while (iscons(p))
			__emit_char(',')
			#__emit_char(' ')
			emit_expr(car(p))
			p = cdr(p)
	__emit_char(')')

emit_index_function = (p) ->
	p = cdr(p)
	if (caar(p) == symbol(ADD) || caar(p) == symbol(MULTIPLY) || caar(p) == symbol(POWER) || caar(p) == symbol(FACTORIAL))
		emit_subexpr(car(p))
	else
		emit_expr(car(p))
	__emit_char('[')
	p = cdr(p)
	if (iscons(p))
		emit_expr(car(p))
		p = cdr(p)
		while(iscons(p))
			__emit_char(',')
			emit_expr(car(p))
			p = cdr(p)
	__emit_char(']')

emit_factorial_function = (p) ->
	p = cadr(p)
	if (car(p) == symbol(ADD) || car(p) == symbol(MULTIPLY) || car(p) == symbol(POWER) || car(p) == symbol(FACTORIAL))
		emit_subexpr(p)
	else
		emit_expr(p)
	__emit_char('!')

emit_subexpr = (p) ->
	__emit_char('(')
	emit_expr(p)
	__emit_char(')')

emit_symbol = (p) ->

	i = 0
	if (p == symbol(E))
		__emit_str("exp(1)")
		return

	pPrintName = get_printname(p)
	for i in [0...pPrintName.length]
		__emit_char(pPrintName[i])

emit_string = (p) ->
	i = 0
	pString = p.str
	__emit_char('"')
	for i in [0...pString.length]
		__emit_char(pString[i])
	__emit_char('"')

fixup_fraction = (x, k1, k2) ->
	dx = 0
	dy = 0
	i = 0
	w = 0
	y = 0
	h1 = 0
	w1 = 0
	y1 = 0
	h2 = 0
	w2 = 0
	y2 = 0

	[h1,w1,y1] = get_size(k1, k2)
	[h2,w2,y2] = get_size(k2, yindex)

	if (w2 > w1)
		dx = (w2 - w1) / 2;	# shift numerator right
	else
		dx = 0

	dx++
	# this is how much is below the baseline

	y = y1 + h1 - 1

	dy = -y - 1

	move(k1, k2, dx, dy)

	if (w2 > w1)
		dx = -w1
	else
		dx = -w1 + (w1 - w2) / 2
	
	dx++
	dy = -y2 + 1

	move(k2, yindex, dx, dy)

	if (w2 > w1)
		w = w2
	else
		w = w1
	
	w+=2
	emit_x = x

	for i in [0...w]
		__emit_char('-')

fixup_power = (k1, k2) ->
	dy = 0
	h1 = 0
	w1 = 0
	y1 = 0
	h2 = 0
	w2 = 0
	y2 = 0

	[h1,w1,y1] = get_size(k1, k2)
	[h2,w2,y2] = get_size(k2, yindex)

	# move superscript to baseline

	dy = -y2 - h2 + 1

	# now move above base

	dy += y1 - 1

	move(k2, yindex, 0, dy)

move = (j, k, dx, dy) ->
	i = 0
	for i in [j...k]
		chartab[i].x += dx
		chartab[i].y += dy

# finds the bounding rectangle and vertical position

get_size = (j, k)->
	i = 0
	min_x = chartab[j].x
	max_x = chartab[j].x
	min_y = chartab[j].y
	max_y = chartab[j].y
	for i in [(j + 1)...k]
		if (chartab[i].x < min_x)
			min_x = chartab[i].x
		if (chartab[i].x > max_x)
			max_x = chartab[i].x
		if (chartab[i].y < min_y)
			min_y = chartab[i].y
		if (chartab[i].y > max_y)
			max_y = chartab[i].y
	h = max_y - min_y + 1
	w = max_x - min_x + 1
	y = min_y
	return [h,w,y]

displaychar = (c) ->
	__emit_char(c)

__emit_char = (c) ->
	if (yindex == YMAX)
		return
	if !chartab[yindex]?
		debugger
	chartab[yindex].c = c
	chartab[yindex].x = emit_x
	chartab[yindex].y = 0
	yindex++
	emit_x++

__emit_str = (s) ->
	i = 0
	for i in [0...s.length]
		__emit_char(s[i])

emit_number = (p, emit_sign) ->
	tmpString = ""
	i = 0
	switch (p.k)
		when NUM
			tmpString = p.q.a.toString()
			if (tmpString[0] == '-' && emit_sign == 0)
				tmpString = tmpString.substring(1)
			for i in [0...tmpString.length]
				__emit_char(tmpString[i])
			tmpString = p.q.b.toString()
			if (tmpString == "1")
				break
			__emit_char('/')
			for i in [0...tmpString.length]
				__emit_char(tmpString[i])

		when DOUBLE
			tmpString = doubleToReasonableString(p.d)
			if (tmpString[0] == '-' && emit_sign == 0)
				tmpString = tmpString.substring(1)
			for i in [0...tmpString.length]
				__emit_char(tmpString[i])

# a and b are glyphs
cmpGlyphs = (a, b) ->

	if (a.y < b.y)
		return -1

	if (a.y > b.y)
		return 1

	if (a.x < b.x)
		return -1

	if (a.x > b.x)
		return 1

	return 0

print_glyphs = ->

	i = 0
	accumulator = ""
	
	# now sort the glyphs by their vertical positions,
	# since we are going to build a string where obviously the
	# "upper" line has to printed out first, followed by
	# a new line, followed by the other lines.
	#qsort(chartab, yindex, sizeof (struct glyph), __cmp)
	subsetOfStack = chartab.slice(0,yindex)
	subsetOfStack.sort(cmpGlyphs)
	chartab = [].concat(subsetOfStack).concat(chartab.slice(yindex))

	x = 0

	y = chartab[0].y

	for i in [0...yindex]

		while (chartab[i].y > y)
			accumulator += printchar('\n')
			x = 0
			y++

		while (chartab[i].x > x)
			accumulator += printchar_nowrap(' ')
			x++

		accumulator += printchar_nowrap(chartab[i].c)

		x++

	return accumulator

buffer = ""

getdisplaystr = ->
	yindex = 0
	level = 0
	emit_x = 0
	emit_expr(pop())
	fill_buf()
	return buffer

fill_buf = ->
	tmpBuffer = buffer
	sIndex = 0
	i = 0

	#qsort(chartab, yindex, sizeof (struct glyph), __cmp)
	subsetOfStack = chartab.slice(0,yindex)
	subsetOfStack.sort(cmpGlyphs)
	chartab = [].concat(subsetOfStack).concat(chartab.slice(yindex))

	x = 0

	y = chartab[0].y

	for i in [0...yindex]

		while (chartab[i].y > y)
			tmpBuffer[sIndex++] = '\n'
			x = 0
			y++

		while (chartab[i].x > x)
			tmpBuffer[sIndex++] = ' '
			x++

		tmpBuffer[sIndex++] = chartab[i].c

		x++

	tmpBuffer[sIndex++] = '\n'


N = 100

class oneElement
	x: 0
	y: 0
	h: 0
	w: 0
	index: 0
	count: 0

elem = []
for elelmIndex in [0...10000]
	elem[elelmIndex] = new oneElement

SPACE_BETWEEN_COLUMNS = 3
SPACE_BETWEEN_ROWS = 1

emit_tensor = (p) ->
	i = 0
	n = 0
	nrow = 0
	ncol = 0
	x = 0
	y = 0
	h = 0
	w = 0
	dx = 0
	dy = 0
	eh = 0
	ew = 0
	row = 0
	col = 0

	if (p.tensor.ndim > 2)
		emit_flat_tensor(p)
		return

	nrow = p.tensor.dim[0]

	if (p.tensor.ndim == 2)
		ncol = p.tensor.dim[1]
	else
		ncol = 1

	n = nrow * ncol

	if (n > N)
		emit_flat_tensor(p)
		return

	# horizontal coordinate of the matrix

	#if 0
	#emit_x += 2; # make space for left paren
	#endif

	x = emit_x

	# emit each element

	for i in [0...n]
		elem[i].index = yindex
		elem[i].x = emit_x
		emit_expr(p.tensor.elem[i])
		elem[i].count = yindex - elem[i].index
		[elem[i].h, elem[i].w, elem[i].y] = get_size(elem[i].index, yindex)

	# find element height and width

	eh = 0
	ew = 0

	for i in [0...n]
		if (elem[i].h > eh)
			eh = elem[i].h
		if (elem[i].w > ew)
			ew = elem[i].w

	# this is the overall height of the matrix

	h = nrow * eh + (nrow - 1) * SPACE_BETWEEN_ROWS

	# this is the overall width of the matrix

	w = ncol * ew + (ncol - 1) * SPACE_BETWEEN_COLUMNS

	# this is the vertical coordinate of the matrix

	y = -(h / 2)

	# move elements around

	for row in [0...nrow]
		for col in [0...ncol]

			i = row * ncol + col

			# first move to upper left corner of matrix

			dx = x - elem[i].x
			dy = y - elem[i].y

			move(elem[i].index, elem[i].index + elem[i].count, dx, dy)

			# now move to official position

			dx = 0

			if (col > 0)
				dx = col * (ew + SPACE_BETWEEN_COLUMNS)

			dy = 0

			if (row > 0)
				dy = row * (eh + SPACE_BETWEEN_ROWS)

			# small correction for horizontal centering

			dx += (ew - elem[i].w) / 2

			# small correction for vertical centering

			dy += (eh - elem[i].h) / 2

			move(elem[i].index, elem[i].index + elem[i].count, dx, dy)

	emit_x = x + w

	###
	if 0

		# left brace

		for (i = 0; i < h; i++) {
			if (yindex == YMAX)
				break
			chartab[yindex].c = '|'
			chartab[yindex].x = x - 2
			chartab[yindex].y = y + i
			yindex++
		}

		# right brace

		emit_x++

		for (i = 0; i < h; i++) {
			if (yindex == YMAX)
				break
			chartab[yindex].c = '|'
			chartab[yindex].x = emit_x
			chartab[yindex].y = y + i
			yindex++
		}

		emit_x++

	endif
	###


emit_flat_tensor = (p) ->
	emit_tensor_inner(p, 0, 0)

emit_tensor_inner = (p, j, k) ->
	i = 0
	__emit_char('(')
	for i in [0...p.tensor.dim[j]]
		if (j + 1 == p.tensor.ndim)
			emit_expr(p.tensor.elem[k])
			k = k + 1
		else
			k = emit_tensor_inner(p, j + 1, k)
		if (i + 1 < p.tensor.dim[j])
			__emit_char(',')
	__emit_char(')')
	return k


