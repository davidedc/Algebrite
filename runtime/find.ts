import { equaln, isimaginaryunit, isinteger } from '../sources/is';
import { equal } from '../sources/misc';
import {
  caddr,
  cadr,
  car,
  cdr,
  Constants,
  E,
  iscons,
  ispower,
  istensor,
  symbol,
  U,
} from './defs';

// returns true if expr p contains expr q, otherwise returns false
export function Find(p: U, q: U): boolean {
  if (equal(p, q)) {
    return true;
  }

  if (istensor(p)) {
    for (let i = 0; i < p.tensor.nelem; i++) {
      if (Find(p.tensor.elem[i], q)) {
        return true;
      }
    }
    return false;
  }

  while (iscons(p)) {
    if (Find(car(p), q)) {
      return true;
    }
    p = cdr(p);
  }

  return false;
}

// find stuff like (-1)^(something (but disregard
// imaginary units which are in the form (-1)^(1/2))
export function findPossibleClockForm(p: U, p1: U): boolean {
  if (isimaginaryunit(p)) {
    return false;
  }

  if (ispower(p) && !isinteger(caddr(p1))) {
    if (Find(cadr(p), Constants.imaginaryunit)) {
      //console.log "found i^fraction " + p
      return true;
    }
  }

  if (ispower(p) && equaln(cadr(p), -1) && !isinteger(caddr(p1))) {
    //console.log "found -1^fraction in " + p
    return true;
  }

  if (istensor(p)) {
    for (let i = 0; i < p.tensor.nelem; i++) {
      if (findPossibleClockForm(p.tensor.elem[i], p1)) {
        return true;
      }
    }
    return false;
  }

  while (iscons(p)) {
    if (findPossibleClockForm(car(p), p1)) {
      return true;
    }
    p = cdr(p);
  }

  return false;
}

// find stuff like (e)^(i something)
export function findPossibleExponentialForm(p: U): boolean {
  if (ispower(p) && cadr(p) === symbol(E)) {
    return Find(caddr(p), Constants.imaginaryunit);
  }

  if (istensor(p)) {
    for (let i = 0; i < p.tensor.nelem; i++) {
      if (findPossibleExponentialForm(p.tensor.elem[i])) {
        return true;
      }
    }
    return false;
  }

  while (iscons(p)) {
    if (findPossibleExponentialForm(car(p))) {
      return true;
    }
    p = cdr(p);
  }

  return false;
}
