# returns 1 if expr p contains expr q, otherweise returns 0

#include "stdafx.h"
#include "defs.h"

Find = (p, q) ->

	if (equal(p, q))
		return 1;

	if (istensor(p))
		for i in [0...p.tensor.nelem]
			if (find(p.tensor.elem[i], q))
				return 1;
		return 0;

	while (iscons(p))
		if (find(car(p), q))
			return 1;
		p = cdr(p);

	return 0;
