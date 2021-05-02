import {
  U,
  DOUBLE,
  STR,
  SYM,
  CONS,
  TENSOR,
  NUM,
  iscons,
  car,
  cdr,
  Cons,
  Num,
  Double,
  Sym,
  Str,
  Tensor,
  issymbol,
  BaseAtom,
} from './runtime/defs';
import { length } from './sources/misc';

class AtomFormatter {
  header(object: unknown) {
    if (!this.isValidAtom(object)) {
      return null;
    }
    return ['span', {}, this.atomTypeNode(object), this.summary(object)];
  }

  hasBody(object: U) {
    switch (object.k) {
      case DOUBLE:
      case STR:
      case SYM:
        return false;
      case CONS:
      case TENSOR:
      case NUM:
        return true;
    }
  }

  body(x: U) {
    if (x.k == NUM) {
      return propertyList([
        { name: 'a', value: x.q.a.toString() },
        { name: 'b', value: x.q.b.toString() },
      ]);
    } else if (x.k == CONS) {
      const items = iscons(x) ? [...x] : [];
      return propertyList(items);
    } else if (x.k == TENSOR) {
      const elems = split_tensor(x, 0, 0)[1];
      return propertyList(elems);
    }
    return null;
  }

  isValidAtom(x: unknown): x is U {
    switch (x.constructor) {
      case Cons:
      case Num:
      case Double:
      case Sym:
      case Str:
      case Tensor:
        return true;
    }
    return false;
  }

  atomTypeNode(a: U) {
    return ['span', { style: 'font-weight: bold' }, this.atomType(a), ' '];
  }

  atomType(a: U) {
    switch (a.k) {
      case CONS:
        return 'Cons';
      case NUM:
        return 'Num';
      case DOUBLE:
        return 'Double';
      case STR:
        return 'String';
      case TENSOR:
        return 'Tensor';
      case SYM:
        return 'Sym';
    }
  }

  summary(a: U) {
    switch (a.k) {
      case SYM:
      case NUM:
      case DOUBLE:
      case STR:
        return a.toString();
      case TENSOR:
        const dims = (a.tensor.dim as number[]).slice(0, a.tensor.ndim);
        return `size = ${dims.join('x')}`;
      case CONS:
        let name = issymbol(a.cons.car) ? `${a.cons.car} ` : '';
        return `${name}length = ${length(a)}`;
    }
  }
}

type Atoms = U | Atoms[];

interface Property {
  name: string;
  value: Atoms | string;
}

function isProperty(x: Atoms | Property): x is Property {
  if (x instanceof BaseAtom || Array.isArray(x)) {
    return false;
  }
  return true;
}

type TemplateTag =
  | [
      'div' | 'span' | 'ol' | 'li' | 'table' | 'tr' | 'td',
      { style?: string },
      ...(TemplateTag | string)[]
    ]
  | ['object', { object: any }];

function propertyList(items: (Atoms | Property)[]): TemplateTag {
  const ol: TemplateTag = [
    'ol',
    {
      style:
        'list-style-type:none; padding-left: 0px; margin-top: 0px; margin-bottom: 0px; margin-left: 12px',
    },
  ];
  items.forEach((x, i) => {
    const name = isProperty(x) ? x.name : `${i}`;
    const nameSpan: TemplateTag = [
      'span',
      { style: '"color: rgb(136, 19, 145); background-color: #bada55"' },
      `${name}: `,
    ];
    const child: TemplateTag = [
      'object',
      { object: isProperty(x) ? x.value : x },
    ];
    ol.push(['li', {}, nameSpan, child]);
  });
  return ol;
}

function split_tensor(p: Tensor, j: number, k: number): [number, Atoms[]] {
  // based on print_tensor_inner
  let accumulator = [];
  if (j < p.tensor.ndim - 1) {
    for (let i = 0; i < p.tensor.dim[j]; i++) {
      let result: Atoms[];
      [k, result] = split_tensor(p, j + 1, k);
      accumulator.push(result);
    }
  } else {
    for (let i = 0; i < p.tensor.dim[j]; i++) {
      accumulator.push(p.tensor.elem[k]);
      k++;
    }
  }
  return [k, accumulator];
}

(globalThis as any)['devtoolsFormatters'] = [new AtomFormatter()];
