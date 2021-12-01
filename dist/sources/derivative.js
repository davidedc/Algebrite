"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.derivative = exports.Eval_derivative = void 0;
const defs_1 = require("../runtime/defs");
const find_1 = require("../runtime/find");
const run_1 = require("../runtime/run");
const stack_1 = require("../runtime/stack");
const misc_1 = require("../sources/misc");
const add_1 = require("./add");
const besselj_1 = require("./besselj");
const bessely_1 = require("./bessely");
const bignum_1 = require("./bignum");
const cos_1 = require("./cos");
const cosh_1 = require("./cosh");
const dirac_1 = require("./dirac");
const eval_1 = require("./eval");
const guess_1 = require("./guess");
const hermite_1 = require("./hermite");
const integral_1 = require("./integral");
const is_1 = require("./is");
const list_1 = require("./list");
const log_2 = require("./log");
const multiply_1 = require("./multiply");
const power_1 = require("./power");
const sgn_1 = require("./sgn");
const simplify_1 = require("./simplify");
const sin_1 = require("./sin");
const sinh_1 = require("./sinh");
const subst_1 = require("./subst");
const tensor_1 = require("./tensor");
// derivative
//define F p3
//define X p4
//define N p5
function Eval_derivative(p1) {
    // evaluate 1st arg to get function F
    p1 = defs_1.cdr(p1);
    let F = eval_1.Eval(defs_1.car(p1));
    // evaluate 2nd arg and then...
    // example  result of 2nd arg  what to do
    //
    // d(f)    nil      guess X, N = nil
    // d(f,2)  2      guess X, N = 2
    // d(f,x)  x      X = x, N = nil
    // d(f,x,2)  x      X = x, N = 2
    // d(f,x,y)  x      X = x, N = y
    p1 = defs_1.cdr(p1);
    let X, N;
    const p2 = eval_1.Eval(defs_1.car(p1));
    if (p2 === defs_1.symbol(defs_1.NIL)) {
        X = guess_1.guess(F);
        N = defs_1.symbol(defs_1.NIL);
    }
    else if (defs_1.isNumericAtom(p2)) {
        X = guess_1.guess(F);
        N = p2;
    }
    else {
        X = p2;
        p1 = defs_1.cdr(p1);
        N = eval_1.Eval(defs_1.car(p1));
    }
    while (true) {
        // p5 (N) might be a symbol instead of a number
        let n;
        if (defs_1.isNumericAtom(N)) {
            n = bignum_1.nativeInt(N);
            if (isNaN(n)) {
                run_1.stop('nth derivative: check n');
            }
        }
        else {
            n = 1;
        }
        let temp = F;
        if (n >= 0) {
            for (let i = 0; i < n; i++) {
                temp = derivative(temp, X);
            }
        }
        else {
            n = -n;
            for (let i = 0; i < n; i++) {
                temp = integral_1.integral(temp, X);
            }
        }
        F = temp;
        // if p5 (N) is nil then arglist is exhausted
        if (N === defs_1.symbol(defs_1.NIL)) {
            break;
        }
        // otherwise...
        // N    arg1    what to do
        //
        // number  nil    break
        // number  number    N = arg1, continue
        // number  symbol    X = arg1, N = arg2, continue
        //
        // symbol  nil    X = N, N = nil, continue
        // symbol  number    X = N, N = arg1, continue
        // symbol  symbol    X = N, N = arg1, continue
        if (defs_1.isNumericAtom(N)) {
            p1 = defs_1.cdr(p1);
            N = eval_1.Eval(defs_1.car(p1));
            if (N === defs_1.symbol(defs_1.NIL)) {
                break; // arglist exhausted
            }
            if (!defs_1.isNumericAtom(N)) {
                X = N;
                p1 = defs_1.cdr(p1);
                N = eval_1.Eval(defs_1.car(p1));
            }
        }
        else {
            X = N;
            p1 = defs_1.cdr(p1);
            N = eval_1.Eval(defs_1.car(p1));
        }
    }
    stack_1.push(F); // final result
}
exports.Eval_derivative = Eval_derivative;
function derivative(p1, p2) {
    if (defs_1.isNumericAtom(p2)) {
        run_1.stop('undefined function');
    }
    if (defs_1.istensor(p1)) {
        if (defs_1.istensor(p2)) {
            return tensor_1.d_tensor_tensor(p1, p2);
        }
        else {
            return tensor_1.d_tensor_scalar(p1, p2);
        }
    }
    else {
        if (defs_1.istensor(p2)) {
            return tensor_1.d_scalar_tensor(p1, p2);
        }
        else {
            return d_scalar_scalar(p1, p2);
        }
    }
}
exports.derivative = derivative;
function d_scalar_scalar(p1, p2) {
    if (defs_1.issymbol(p2)) {
        return d_scalar_scalar_1(p1, p2);
    }
    // Example: d(sin(cos(x)),cos(x))
    // Replace cos(x) <- X, find derivative, then do X <- cos(x)
    const arg1 = subst_1.subst(p1, p2, defs_1.symbol(defs_1.SECRETX)); // p1: sin(cos(x)), p2: cos(x), symbol(SECRETX): X => sin(cos(x)) -> sin(X)
    return subst_1.subst(derivative(arg1, defs_1.symbol(defs_1.SECRETX)), defs_1.symbol(defs_1.SECRETX), p2); // p2:  cos(x)  =>  cos(X) -> cos(cos(x))
}
function d_scalar_scalar_1(p1, p2) {
    // d(x,x)?
    if (misc_1.equal(p1, p2)) {
        return defs_1.Constants.one;
    }
    // d(a,x)?
    if (!defs_1.iscons(p1)) {
        return defs_1.Constants.zero;
    }
    if (defs_1.isadd(p1)) {
        return dsum(p1, p2);
    }
    switch (defs_1.car(p1)) {
        case defs_1.symbol(defs_1.MULTIPLY):
            return dproduct(p1, p2);
        case defs_1.symbol(defs_1.POWER):
            return dpower(p1, p2);
        case defs_1.symbol(defs_1.DERIVATIVE):
            return dd(p1, p2);
        case defs_1.symbol(defs_1.LOG):
            return dlog(p1, p2);
        case defs_1.symbol(defs_1.SIN):
            return dsin(p1, p2);
        case defs_1.symbol(defs_1.COS):
            return dcos(p1, p2);
        case defs_1.symbol(defs_1.TAN):
            return dtan(p1, p2);
        case defs_1.symbol(defs_1.ARCSIN):
            return darcsin(p1, p2);
        case defs_1.symbol(defs_1.ARCCOS):
            return darccos(p1, p2);
        case defs_1.symbol(defs_1.ARCTAN):
            return darctan(p1, p2);
        case defs_1.symbol(defs_1.SINH):
            return dsinh(p1, p2);
        case defs_1.symbol(defs_1.COSH):
            return dcosh(p1, p2);
        case defs_1.symbol(defs_1.TANH):
            return dtanh(p1, p2);
        case defs_1.symbol(defs_1.ARCSINH):
            return darcsinh(p1, p2);
        case defs_1.symbol(defs_1.ARCCOSH):
            return darccosh(p1, p2);
        case defs_1.symbol(defs_1.ARCTANH):
            return darctanh(p1, p2);
        case defs_1.symbol(defs_1.ABS):
            return dabs(p1, p2);
        case defs_1.symbol(defs_1.SGN):
            return dsgn(p1, p2);
        case defs_1.symbol(defs_1.HERMITE):
            return dhermite(p1, p2);
        case defs_1.symbol(defs_1.ERF):
            return derf(p1, p2);
        case defs_1.symbol(defs_1.ERFC):
            return derfc(p1, p2);
        case defs_1.symbol(defs_1.BESSELJ):
            return dbesselj(p1, p2);
        case defs_1.symbol(defs_1.BESSELY):
            return dbessely(p1, p2);
        default:
        // pass through
    }
    if (defs_1.car(p1) === defs_1.symbol(defs_1.INTEGRAL) && defs_1.caddr(p1) === p2) {
        return derivative_of_integral(p1);
    }
    return dfunction(p1, p2);
}
function dsum(p1, p2) {
    const toAdd = defs_1.iscons(p1) ? p1.tail().map((el) => derivative(el, p2)) : [];
    return add_1.add_all(toAdd);
}
function dproduct(p1, p2) {
    const n = misc_1.length(p1) - 1;
    const toAdd = [];
    for (let i = 0; i < n; i++) {
        const arr = [];
        let p3 = defs_1.cdr(p1);
        for (let j = 0; j < n; j++) {
            let temp = defs_1.car(p3);
            if (i === j) {
                temp = derivative(temp, p2);
            }
            arr.push(temp);
            p3 = defs_1.cdr(p3);
        }
        toAdd.push(multiply_1.multiply_all(arr));
    }
    return add_1.add_all(toAdd);
}
//-----------------------------------------------------------------------------
//
//       v
//  y = u
//
//  log y = v log u
//
//  1 dy   v du           dv
//  - -- = - -- + (log u) --
//  y dx   u dx           dx
//
//  dy    v  v du           dv
//  -- = u  (- -- + (log u) --)
//  dx       u dx           dx
//
//-----------------------------------------------------------------------------
function dpower(p1, p2) {
    // v/u
    const arg1 = multiply_1.divide(defs_1.caddr(p1), defs_1.cadr(p1));
    // du/dx
    const deriv_1 = derivative(defs_1.cadr(p1), p2);
    // log u
    const log_1 = log_2.logarithm(defs_1.cadr(p1));
    // dv/dx
    const deriv_2 = derivative(defs_1.caddr(p1), p2);
    // u^v
    return multiply_1.multiply(add_1.add(multiply_1.multiply(arg1, deriv_1), multiply_1.multiply(log_1, deriv_2)), p1);
}
function dlog(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.divide(deriv, defs_1.cadr(p1));
}
//  derivative of derivative
//
//  example: d(d(f(x,y),y),x)
//
//  p1 = d(f(x,y),y)
//
//  p2 = x
//
//  cadr(p1) = f(x,y)
//
//  caddr(p1) = y
function dd(p1, p2) {
    // d(f(x,y),x)
    const p3 = derivative(defs_1.cadr(p1), p2);
    if (defs_1.car(p3) === defs_1.symbol(defs_1.DERIVATIVE)) {
        // sort dx terms
        if (misc_1.lessp(defs_1.caddr(p3), defs_1.caddr(p1))) {
            return list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), defs_1.cadr(p3), defs_1.caddr(p3)), defs_1.caddr(p1));
        }
        else {
            return list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), defs_1.cadr(p3), defs_1.caddr(p1)), defs_1.caddr(p3));
        }
    }
    return derivative(p3, defs_1.caddr(p1));
}
// derivative of a generic function
function dfunction(p1, p2) {
    const p3 = defs_1.cdr(p1); // p3 is the argument list for the function
    if (p3 === defs_1.symbol(defs_1.NIL) || find_1.Find(p3, p2)) {
        return list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), p1, p2);
    }
    return defs_1.Constants.zero;
}
function dsin(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, cos_1.cosine(defs_1.cadr(p1)));
}
function dcos(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.negate(multiply_1.multiply(deriv, sin_1.sine(defs_1.cadr(p1))));
}
function dtan(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, power_1.power(cos_1.cosine(defs_1.cadr(p1)), bignum_1.integer(-2)));
}
function darcsin(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, power_1.power(add_1.subtract(defs_1.Constants.one, power_1.power(defs_1.cadr(p1), bignum_1.integer(2))), bignum_1.rational(-1, 2)));
}
function darccos(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.negate(multiply_1.multiply(deriv, power_1.power(add_1.subtract(defs_1.Constants.one, power_1.power(defs_1.cadr(p1), bignum_1.integer(2))), bignum_1.rational(-1, 2))));
}
//        Without simplify  With simplify
//
//  d(arctan(y/x),x)  -y/(x^2*(y^2/x^2+1))  -y/(x^2+y^2)
//
//  d(arctan(y/x),y)  1/(x*(y^2/x^2+1))  x/(x^2+y^2)
function darctan(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return simplify_1.simplify(multiply_1.multiply(deriv, multiply_1.inverse(add_1.add(defs_1.Constants.one, power_1.power(defs_1.cadr(p1), bignum_1.integer(2))))));
}
function dsinh(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, cosh_1.ycosh(defs_1.cadr(p1)));
}
function dcosh(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, sinh_1.ysinh(defs_1.cadr(p1)));
}
function dtanh(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, power_1.power(cosh_1.ycosh(defs_1.cadr(p1)), bignum_1.integer(-2)));
}
function darcsinh(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, power_1.power(add_1.add(power_1.power(defs_1.cadr(p1), bignum_1.integer(2)), defs_1.Constants.one), bignum_1.rational(-1, 2)));
}
function darccosh(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, power_1.power(add_1.add(power_1.power(defs_1.cadr(p1), bignum_1.integer(2)), defs_1.Constants.negOne), bignum_1.rational(-1, 2)));
}
function darctanh(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, multiply_1.inverse(add_1.subtract(defs_1.Constants.one, power_1.power(defs_1.cadr(p1), bignum_1.integer(2)))));
}
function dabs(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, sgn_1.sgn(defs_1.cadr(p1)));
}
function dsgn(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(multiply_1.multiply(deriv, dirac_1.dirac(defs_1.cadr(p1))), bignum_1.integer(2));
}
function dhermite(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(multiply_1.multiply(deriv, multiply_1.multiply(bignum_1.integer(2), defs_1.caddr(p1))), hermite_1.hermite(defs_1.cadr(p1), add_1.add(defs_1.caddr(p1), defs_1.Constants.negOne)));
}
function derf(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(multiply_1.multiply(multiply_1.multiply(misc_1.exponential(multiply_1.multiply(power_1.power(defs_1.cadr(p1), bignum_1.integer(2)), defs_1.Constants.negOne)), power_1.power(defs_1.Constants.Pi(), bignum_1.rational(-1, 2))), bignum_1.integer(2)), deriv);
}
function derfc(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(multiply_1.multiply(multiply_1.multiply(misc_1.exponential(multiply_1.multiply(power_1.power(defs_1.cadr(p1), bignum_1.integer(2)), defs_1.Constants.negOne)), power_1.power(defs_1.Constants.Pi(), bignum_1.rational(-1, 2))), bignum_1.integer(-2)), deriv);
}
function dbesselj(p1, p2) {
    if (is_1.isZeroAtomOrTensor(defs_1.caddr(p1))) {
        return dbesselj0(p1, p2);
    }
    return dbesseljn(p1, p2);
}
function dbesselj0(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(multiply_1.multiply(deriv, besselj_1.besselj(defs_1.cadr(p1), defs_1.Constants.one)), defs_1.Constants.negOne);
}
function dbesseljn(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, add_1.add(besselj_1.besselj(defs_1.cadr(p1), add_1.add(defs_1.caddr(p1), defs_1.Constants.negOne)), multiply_1.multiply(multiply_1.divide(multiply_1.multiply(defs_1.caddr(p1), defs_1.Constants.negOne), defs_1.cadr(p1)), besselj_1.besselj(defs_1.cadr(p1), defs_1.caddr(p1)))));
}
function dbessely(p1, p2) {
    if (is_1.isZeroAtomOrTensor(defs_1.caddr(p1))) {
        return dbessely0(p1, p2);
    }
    return dbesselyn(p1, p2);
}
function dbessely0(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(multiply_1.multiply(deriv, besselj_1.besselj(defs_1.cadr(p1), defs_1.Constants.one)), defs_1.Constants.negOne);
}
function dbesselyn(p1, p2) {
    const deriv = derivative(defs_1.cadr(p1), p2);
    return multiply_1.multiply(deriv, add_1.add(bessely_1.bessely(defs_1.cadr(p1), add_1.add(defs_1.caddr(p1), defs_1.Constants.negOne)), multiply_1.multiply(multiply_1.divide(multiply_1.multiply(defs_1.caddr(p1), defs_1.Constants.negOne), defs_1.cadr(p1)), bessely_1.bessely(defs_1.cadr(p1), defs_1.caddr(p1)))));
}
function derivative_of_integral(p1) {
    return defs_1.cadr(p1);
}
