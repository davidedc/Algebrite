

###
// up to 100 blocks of 100,000 atoms

#define M 100
#define N 100000

U *mem[M]
int mcount

U *free_list
int free_count

U *
alloc(void)
{
	U *p
	if (free_count == 0) {
		if (mcount == 0)
			alloc_mem()
		else {
			gc()
			if (free_count < N * mcount / 2)
				alloc_mem()
		}
		if (free_count == 0)
			stop("atom space exhausted")
	}
	p = free_list
	free_list = free_list->u.cons.cdr
	free_count--
	return p
}
###

allocatedId = 0
alloc_tensor = (nelem) ->
	i = 0
	p = new U()
	p.k = TENSOR
	p.tensor = new tensor()

	p.tensor.nelem = nelem
	for i in [0...nelem]
		p.tensor.elem[i] = zero

	p.tensor.allocatedId = allocatedId
	#if allocatedId == 9
	#	debugger
	allocatedId++

	check_tensor_dimensions p

	return p

###
// garbage collector

void
gc(void)
{
	int i, j
	U *p

	// tag everything

	for (i = 0; i < mcount; i++) {
		p = mem[i]
		for (j = 0; j < N; j++)
			p[j].tag = 1
	}

	// untag what's used

	untag(p0)
	untag(p1)
	untag(p2)
	untag(p3)
	untag(p4)
	untag(p5)
	untag(p6)
	untag(p7)
	untag(p8)
	untag(p9)

	untag(one)
	untag(zero)
	untag(imaginaryunit)

	for (i = 0; i < NSYM; i++) {
		untag(binding[i])
		untag(arglist[i])
	}

	for (i = 0; i < tos; i++)
		untag(stack[i])

	for (i = (int) (frame - stack); i < TOS; i++)
		untag(stack[i])

	// collect everything that's still tagged

	free_count = 0

	for (i = 0; i < mcount; i++) {
		p = mem[i]
		for (j = 0; j < N; j++) {
			if (p[j].tag == 0)
				continue
			// still tagged so it's unused, put on free list
			switch (p[j].k) {
			case TENSOR:
				free(p[j].u.tensor)
				break
			case STR:
				free(p[j].u.str)
				break
			case NUM:
				mfree(p[j].u.q.a)
				mfree(p[j].u.q.b)
				break
			}
			p[j].k = CONS; // so no double free occurs above
			p[j].u.cons.cdr = free_list
			free_list = p + j
			free_count++
		}
	}
}

void
untag(U *p)
{
	int i

	if (iscons(p)) {
		do {
			if (p->tag == 0)
				return
			p->tag = 0
			untag(p->u.cons.car)
			p = p->u.cons.cdr
		} while (iscons(p))
		untag(p)
		return
	}

	if (p->tag) {
		p->tag = 0
 		if (istensor(p)) {
			for (i = 0; i < p->u.tensor->nelem; i++)
				untag(p->u.tensor->elem[i])
		}
	}
}

// get memory for 100,000 atoms

void
alloc_mem(void)
{
	int i
	U *p
	if (mcount == M)
		return
	p = (U *) malloc(N * sizeof (struct U))
	if (p == NULL)
		return
	mem[mcount++] = p
	for (i = 0; i < N; i++) {
		p[i].k = CONS; // so no free in gc
		p[i].u.cons.cdr = p + i + 1
	}
	p[N - 1].u.cons.cdr = free_list
	free_list = p
	free_count += N
}

void
print_mem_info(void)
{
	char buf[100]

	sprintf(buf, "%d blocks (%d bytes/block)\n", N * mcount, (int) sizeof (U))
	printstr(buf)

	sprintf(buf, "%d free\n", free_count)
	printstr(buf)

	sprintf(buf, "%d used\n", N * mcount - free_count)
	printstr(buf)
}
###
