import { car, cdr, Constants, iscons, U } from '../runtime/defs';
import { Find } from '../runtime/find';
import { multiply } from './multiply';

/*
 Partition a term

  Input:
    p1: term (factor or product of factors)
    p2: free variable

  Output:
    constant expression
    variable expression
*/
export function partition(p1: U, p2: U): [U, U] {
  let p3: U = Constants.one;
  let p4: U = p3;

  p1 = cdr(p1);

  while (iscons(p1)) {
    if (Find(car(p1), p2)) {
      p4 = multiply(p4, car(p1));
    } else {
      p3 = multiply(p3, car(p1));
    }
    p1 = cdr(p1);
  }

  return [p3, p4];
}
