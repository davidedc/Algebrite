#-----------------------------------------------------------------------------
#
#	Create a Hilbert matrix
#
#	Input:		Dimension on stack
#
#	Output:		Hilbert matrix on stack
#
#	Example:
#
#	> hilbert(5)
#	((1,1/2,1/3,1/4),(1/2,1/3,1/4,1/5),(1/3,1/4,1/5,1/6),(1/4,1/5,1/6,1/7))
#
#-----------------------------------------------------------------------------



#define A p1
#define N p2

#define AELEM(i, j) A->u.tensor->elem[i * n + j]

hilbert = ->
	i = 0
	j = 0
	n = 0
	save()
	p2 = pop()
	push(p2)
	n = pop_integer()
	if (n < 2)
		push_symbol(HILBERT)
		push(p2)
		list(2)
		restore()
		return
	push_zero_matrix(n, n)
	p1 = pop()
	for i in [0...n]
		for j in [0...n]
			push_integer(i + j + 1)
			inverse()
			p1.tensor.elem[i * n + j] = pop()
	push(p1)
	restore()
