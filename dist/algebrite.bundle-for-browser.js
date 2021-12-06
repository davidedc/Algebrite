(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // node_modules/big-integer/BigInteger.js
  var require_BigInteger = __commonJS({
    "node_modules/big-integer/BigInteger.js"(exports, module) {
      var bigInt = function(undefined2) {
        "use strict";
        var BASE = 1e7, LOG_BASE = 7, MAX_INT = 9007199254740992, MAX_INT_ARR = smallToArray(MAX_INT), DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
        var supportsNativeBigInt = typeof BigInt === "function";
        function Integer(v, radix, alphabet, caseSensitive) {
          if (typeof v === "undefined")
            return Integer[0];
          if (typeof radix !== "undefined")
            return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
          return parseValue(v);
        }
        function BigInteger(value, sign) {
          this.value = value;
          this.sign = sign;
          this.isSmall = false;
        }
        BigInteger.prototype = Object.create(Integer.prototype);
        function SmallInteger(value) {
          this.value = value;
          this.sign = value < 0;
          this.isSmall = true;
        }
        SmallInteger.prototype = Object.create(Integer.prototype);
        function NativeBigInt(value) {
          this.value = value;
        }
        NativeBigInt.prototype = Object.create(Integer.prototype);
        function isPrecise(n) {
          return -MAX_INT < n && n < MAX_INT;
        }
        function smallToArray(n) {
          if (n < 1e7)
            return [n];
          if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
          return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
        }
        function arrayToSmall(arr) {
          trim(arr);
          var length = arr.length;
          if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
              case 0:
                return 0;
              case 1:
                return arr[0];
              case 2:
                return arr[0] + arr[1] * BASE;
              default:
                return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
          }
          return arr;
        }
        function trim(v) {
          var i2 = v.length;
          while (v[--i2] === 0)
            ;
          v.length = i2 + 1;
        }
        function createArray(length) {
          var x = new Array(length);
          var i2 = -1;
          while (++i2 < length) {
            x[i2] = 0;
          }
          return x;
        }
        function truncate(n) {
          if (n > 0)
            return Math.floor(n);
          return Math.ceil(n);
        }
        function add(a, b) {
          var l_a = a.length, l_b = b.length, r = new Array(l_a), carry = 0, base = BASE, sum, i2;
          for (i2 = 0; i2 < l_b; i2++) {
            sum = a[i2] + b[i2] + carry;
            carry = sum >= base ? 1 : 0;
            r[i2] = sum - carry * base;
          }
          while (i2 < l_a) {
            sum = a[i2] + carry;
            carry = sum === base ? 1 : 0;
            r[i2++] = sum - carry * base;
          }
          if (carry > 0)
            r.push(carry);
          return r;
        }
        function addAny(a, b) {
          if (a.length >= b.length)
            return add(a, b);
          return add(b, a);
        }
        function addSmall(a, carry) {
          var l = a.length, r = new Array(l), base = BASE, sum, i2;
          for (i2 = 0; i2 < l; i2++) {
            sum = a[i2] - base + carry;
            carry = Math.floor(sum / base);
            r[i2] = sum - carry * base;
            carry += 1;
          }
          while (carry > 0) {
            r[i2++] = carry % base;
            carry = Math.floor(carry / base);
          }
          return r;
        }
        BigInteger.prototype.add = function(v) {
          var n = parseValue(v);
          if (this.sign !== n.sign) {
            return this.subtract(n.negate());
          }
          var a = this.value, b = n.value;
          if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
          }
          return new BigInteger(addAny(a, b), this.sign);
        };
        BigInteger.prototype.plus = BigInteger.prototype.add;
        SmallInteger.prototype.add = function(v) {
          var n = parseValue(v);
          var a = this.value;
          if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
          }
          var b = n.value;
          if (n.isSmall) {
            if (isPrecise(a + b))
              return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
          }
          return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
        };
        SmallInteger.prototype.plus = SmallInteger.prototype.add;
        NativeBigInt.prototype.add = function(v) {
          return new NativeBigInt(this.value + parseValue(v).value);
        };
        NativeBigInt.prototype.plus = NativeBigInt.prototype.add;
        function subtract(a, b) {
          var a_l = a.length, b_l = b.length, r = new Array(a_l), borrow = 0, base = BASE, i2, difference;
          for (i2 = 0; i2 < b_l; i2++) {
            difference = a[i2] - borrow - b[i2];
            if (difference < 0) {
              difference += base;
              borrow = 1;
            } else
              borrow = 0;
            r[i2] = difference;
          }
          for (i2 = b_l; i2 < a_l; i2++) {
            difference = a[i2] - borrow;
            if (difference < 0)
              difference += base;
            else {
              r[i2++] = difference;
              break;
            }
            r[i2] = difference;
          }
          for (; i2 < a_l; i2++) {
            r[i2] = a[i2];
          }
          trim(r);
          return r;
        }
        function subtractAny(a, b, sign) {
          var value;
          if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
          } else {
            value = subtract(b, a);
            sign = !sign;
          }
          value = arrayToSmall(value);
          if (typeof value === "number") {
            if (sign)
              value = -value;
            return new SmallInteger(value);
          }
          return new BigInteger(value, sign);
        }
        function subtractSmall(a, b, sign) {
          var l = a.length, r = new Array(l), carry = -b, base = BASE, i2, difference;
          for (i2 = 0; i2 < l; i2++) {
            difference = a[i2] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i2] = difference < 0 ? difference + base : difference;
          }
          r = arrayToSmall(r);
          if (typeof r === "number") {
            if (sign)
              r = -r;
            return new SmallInteger(r);
          }
          return new BigInteger(r, sign);
        }
        BigInteger.prototype.subtract = function(v) {
          var n = parseValue(v);
          if (this.sign !== n.sign) {
            return this.add(n.negate());
          }
          var a = this.value, b = n.value;
          if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
          return subtractAny(a, b, this.sign);
        };
        BigInteger.prototype.minus = BigInteger.prototype.subtract;
        SmallInteger.prototype.subtract = function(v) {
          var n = parseValue(v);
          var a = this.value;
          if (a < 0 !== n.sign) {
            return this.add(n.negate());
          }
          var b = n.value;
          if (n.isSmall) {
            return new SmallInteger(a - b);
          }
          return subtractSmall(b, Math.abs(a), a >= 0);
        };
        SmallInteger.prototype.minus = SmallInteger.prototype.subtract;
        NativeBigInt.prototype.subtract = function(v) {
          return new NativeBigInt(this.value - parseValue(v).value);
        };
        NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;
        BigInteger.prototype.negate = function() {
          return new BigInteger(this.value, !this.sign);
        };
        SmallInteger.prototype.negate = function() {
          var sign = this.sign;
          var small = new SmallInteger(-this.value);
          small.sign = !sign;
          return small;
        };
        NativeBigInt.prototype.negate = function() {
          return new NativeBigInt(-this.value);
        };
        BigInteger.prototype.abs = function() {
          return new BigInteger(this.value, false);
        };
        SmallInteger.prototype.abs = function() {
          return new SmallInteger(Math.abs(this.value));
        };
        NativeBigInt.prototype.abs = function() {
          return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
        };
        function multiplyLong(a, b) {
          var a_l = a.length, b_l = b.length, l = a_l + b_l, r = createArray(l), base = BASE, product, carry, i2, a_i, b_j;
          for (i2 = 0; i2 < a_l; ++i2) {
            a_i = a[i2];
            for (var j = 0; j < b_l; ++j) {
              b_j = b[j];
              product = a_i * b_j + r[i2 + j];
              carry = Math.floor(product / base);
              r[i2 + j] = product - carry * base;
              r[i2 + j + 1] += carry;
            }
          }
          trim(r);
          return r;
        }
        function multiplySmall(a, b) {
          var l = a.length, r = new Array(l), base = BASE, carry = 0, product, i2;
          for (i2 = 0; i2 < l; i2++) {
            product = a[i2] * b + carry;
            carry = Math.floor(product / base);
            r[i2] = product - carry * base;
          }
          while (carry > 0) {
            r[i2++] = carry % base;
            carry = Math.floor(carry / base);
          }
          return r;
        }
        function shiftLeft(x, n) {
          var r = [];
          while (n-- > 0)
            r.push(0);
          return r.concat(x);
        }
        function multiplyKaratsuba(x, y) {
          var n = Math.max(x.length, y.length);
          if (n <= 30)
            return multiplyLong(x, y);
          n = Math.ceil(n / 2);
          var b = x.slice(n), a = x.slice(0, n), d = y.slice(n), c = y.slice(0, n);
          var ac = multiplyKaratsuba(a, c), bd = multiplyKaratsuba(b, d), abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));
          var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
          trim(product);
          return product;
        }
        function useKaratsuba(l1, l2) {
          return -0.012 * l1 - 0.012 * l2 + 15e-6 * l1 * l2 > 0;
        }
        BigInteger.prototype.multiply = function(v) {
          var n = parseValue(v), a = this.value, b = n.value, sign = this.sign !== n.sign, abs;
          if (n.isSmall) {
            if (b === 0)
              return Integer[0];
            if (b === 1)
              return this;
            if (b === -1)
              return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
              return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
          }
          if (useKaratsuba(a.length, b.length))
            return new BigInteger(multiplyKaratsuba(a, b), sign);
          return new BigInteger(multiplyLong(a, b), sign);
        };
        BigInteger.prototype.times = BigInteger.prototype.multiply;
        function multiplySmallAndArray(a, b, sign) {
          if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
          }
          return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
        }
        SmallInteger.prototype._multiplyBySmall = function(a) {
          if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
          }
          return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
        };
        BigInteger.prototype._multiplyBySmall = function(a) {
          if (a.value === 0)
            return Integer[0];
          if (a.value === 1)
            return this;
          if (a.value === -1)
            return this.negate();
          return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
        };
        SmallInteger.prototype.multiply = function(v) {
          return parseValue(v)._multiplyBySmall(this);
        };
        SmallInteger.prototype.times = SmallInteger.prototype.multiply;
        NativeBigInt.prototype.multiply = function(v) {
          return new NativeBigInt(this.value * parseValue(v).value);
        };
        NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;
        function square(a) {
          var l = a.length, r = createArray(l + l), base = BASE, product, carry, i2, a_i, a_j;
          for (i2 = 0; i2 < l; i2++) {
            a_i = a[i2];
            carry = 0 - a_i * a_i;
            for (var j = i2; j < l; j++) {
              a_j = a[j];
              product = 2 * (a_i * a_j) + r[i2 + j] + carry;
              carry = Math.floor(product / base);
              r[i2 + j] = product - carry * base;
            }
            r[i2 + l] = carry;
          }
          trim(r);
          return r;
        }
        BigInteger.prototype.square = function() {
          return new BigInteger(square(this.value), false);
        };
        SmallInteger.prototype.square = function() {
          var value = this.value * this.value;
          if (isPrecise(value))
            return new SmallInteger(value);
          return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
        };
        NativeBigInt.prototype.square = function(v) {
          return new NativeBigInt(this.value * this.value);
        };
        function divMod1(a, b) {
          var a_l = a.length, b_l = b.length, base = BASE, result = createArray(b.length), divisorMostSignificantDigit = b[b_l - 1], lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)), remainder = multiplySmall(a, lambda), divisor = multiplySmall(b, lambda), quotientDigit, shift, carry, borrow, i2, l, q;
          if (remainder.length <= a_l)
            remainder.push(0);
          divisor.push(0);
          divisorMostSignificantDigit = divisor[b_l - 1];
          for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
              quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i2 = 0; i2 < l; i2++) {
              carry += quotientDigit * divisor[i2];
              q = Math.floor(carry / base);
              borrow += remainder[shift + i2] - (carry - q * base);
              carry = q;
              if (borrow < 0) {
                remainder[shift + i2] = borrow + base;
                borrow = -1;
              } else {
                remainder[shift + i2] = borrow;
                borrow = 0;
              }
            }
            while (borrow !== 0) {
              quotientDigit -= 1;
              carry = 0;
              for (i2 = 0; i2 < l; i2++) {
                carry += remainder[shift + i2] - base + divisor[i2];
                if (carry < 0) {
                  remainder[shift + i2] = carry + base;
                  carry = 0;
                } else {
                  remainder[shift + i2] = carry;
                  carry = 1;
                }
              }
              borrow += carry;
            }
            result[shift] = quotientDigit;
          }
          remainder = divModSmall(remainder, lambda)[0];
          return [arrayToSmall(result), arrayToSmall(remainder)];
        }
        function divMod2(a, b) {
          var a_l = a.length, b_l = b.length, result = [], part = [], base = BASE, guess, xlen, highx, highy, check;
          while (a_l) {
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
              result.push(0);
              continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
              highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
              check = multiplySmall(b, guess);
              if (compareAbs(check, part) <= 0)
                break;
              guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
          }
          result.reverse();
          return [arrayToSmall(result), arrayToSmall(part)];
        }
        function divModSmall(value, lambda) {
          var length = value.length, quotient = createArray(length), base = BASE, i2, q, remainder, divisor;
          remainder = 0;
          for (i2 = length - 1; i2 >= 0; --i2) {
            divisor = remainder * base + value[i2];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i2] = q | 0;
          }
          return [quotient, remainder | 0];
        }
        function divModAny(self, v) {
          var value, n = parseValue(v);
          if (supportsNativeBigInt) {
            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
          }
          var a = self.value, b = n.value;
          var quotient;
          if (b === 0)
            throw new Error("Cannot divide by zero");
          if (self.isSmall) {
            if (n.isSmall) {
              return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
          }
          if (n.isSmall) {
            if (b === 1)
              return [self, Integer[0]];
            if (b == -1)
              return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
              value = divModSmall(a, abs);
              quotient = arrayToSmall(value[0]);
              var remainder = value[1];
              if (self.sign)
                remainder = -remainder;
              if (typeof quotient === "number") {
                if (self.sign !== n.sign)
                  quotient = -quotient;
                return [new SmallInteger(quotient), new SmallInteger(remainder)];
              }
              return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
          }
          var comparison = compareAbs(a, b);
          if (comparison === -1)
            return [Integer[0], self];
          if (comparison === 0)
            return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];
          if (a.length + b.length <= 200)
            value = divMod1(a, b);
          else
            value = divMod2(a, b);
          quotient = value[0];
          var qSign = self.sign !== n.sign, mod = value[1], mSign = self.sign;
          if (typeof quotient === "number") {
            if (qSign)
              quotient = -quotient;
            quotient = new SmallInteger(quotient);
          } else
            quotient = new BigInteger(quotient, qSign);
          if (typeof mod === "number") {
            if (mSign)
              mod = -mod;
            mod = new SmallInteger(mod);
          } else
            mod = new BigInteger(mod, mSign);
          return [quotient, mod];
        }
        BigInteger.prototype.divmod = function(v) {
          var result = divModAny(this, v);
          return {
            quotient: result[0],
            remainder: result[1]
          };
        };
        NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;
        BigInteger.prototype.divide = function(v) {
          return divModAny(this, v)[0];
        };
        NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function(v) {
          return new NativeBigInt(this.value / parseValue(v).value);
        };
        SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;
        BigInteger.prototype.mod = function(v) {
          return divModAny(this, v)[1];
        };
        NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function(v) {
          return new NativeBigInt(this.value % parseValue(v).value);
        };
        SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;
        BigInteger.prototype.pow = function(v) {
          var n = parseValue(v), a = this.value, b = n.value, value, x, y;
          if (b === 0)
            return Integer[1];
          if (a === 0)
            return Integer[0];
          if (a === 1)
            return Integer[1];
          if (a === -1)
            return n.isEven() ? Integer[1] : Integer[-1];
          if (n.sign) {
            return Integer[0];
          }
          if (!n.isSmall)
            throw new Error("The exponent " + n.toString() + " is too large.");
          if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
              return new SmallInteger(truncate(value));
          }
          x = this;
          y = Integer[1];
          while (true) {
            if (b & true) {
              y = y.times(x);
              --b;
            }
            if (b === 0)
              break;
            b /= 2;
            x = x.square();
          }
          return y;
        };
        SmallInteger.prototype.pow = BigInteger.prototype.pow;
        NativeBigInt.prototype.pow = function(v) {
          var n = parseValue(v);
          var a = this.value, b = n.value;
          var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
          if (b === _0)
            return Integer[1];
          if (a === _0)
            return Integer[0];
          if (a === _1)
            return Integer[1];
          if (a === BigInt(-1))
            return n.isEven() ? Integer[1] : Integer[-1];
          if (n.isNegative())
            return new NativeBigInt(_0);
          var x = this;
          var y = Integer[1];
          while (true) {
            if ((b & _1) === _1) {
              y = y.times(x);
              --b;
            }
            if (b === _0)
              break;
            b /= _2;
            x = x.square();
          }
          return y;
        };
        BigInteger.prototype.modPow = function(exp, mod) {
          exp = parseValue(exp);
          mod = parseValue(mod);
          if (mod.isZero())
            throw new Error("Cannot take modPow with modulus 0");
          var r = Integer[1], base = this.mod(mod);
          if (exp.isNegative()) {
            exp = exp.multiply(Integer[-1]);
            base = base.modInv(mod);
          }
          while (exp.isPositive()) {
            if (base.isZero())
              return Integer[0];
            if (exp.isOdd())
              r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
          }
          return r;
        };
        NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;
        function compareAbs(a, b) {
          if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
          }
          for (var i2 = a.length - 1; i2 >= 0; i2--) {
            if (a[i2] !== b[i2])
              return a[i2] > b[i2] ? 1 : -1;
          }
          return 0;
        }
        BigInteger.prototype.compareAbs = function(v) {
          var n = parseValue(v), a = this.value, b = n.value;
          if (n.isSmall)
            return 1;
          return compareAbs(a, b);
        };
        SmallInteger.prototype.compareAbs = function(v) {
          var n = parseValue(v), a = Math.abs(this.value), b = n.value;
          if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
          }
          return -1;
        };
        NativeBigInt.prototype.compareAbs = function(v) {
          var a = this.value;
          var b = parseValue(v).value;
          a = a >= 0 ? a : -a;
          b = b >= 0 ? b : -b;
          return a === b ? 0 : a > b ? 1 : -1;
        };
        BigInteger.prototype.compare = function(v) {
          if (v === Infinity) {
            return -1;
          }
          if (v === -Infinity) {
            return 1;
          }
          var n = parseValue(v), a = this.value, b = n.value;
          if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
          }
          if (n.isSmall) {
            return this.sign ? -1 : 1;
          }
          return compareAbs(a, b) * (this.sign ? -1 : 1);
        };
        BigInteger.prototype.compareTo = BigInteger.prototype.compare;
        SmallInteger.prototype.compare = function(v) {
          if (v === Infinity) {
            return -1;
          }
          if (v === -Infinity) {
            return 1;
          }
          var n = parseValue(v), a = this.value, b = n.value;
          if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
          }
          if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
          }
          return a < 0 ? 1 : -1;
        };
        SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;
        NativeBigInt.prototype.compare = function(v) {
          if (v === Infinity) {
            return -1;
          }
          if (v === -Infinity) {
            return 1;
          }
          var a = this.value;
          var b = parseValue(v).value;
          return a === b ? 0 : a > b ? 1 : -1;
        };
        NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;
        BigInteger.prototype.equals = function(v) {
          return this.compare(v) === 0;
        };
        NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;
        BigInteger.prototype.notEquals = function(v) {
          return this.compare(v) !== 0;
        };
        NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;
        BigInteger.prototype.greater = function(v) {
          return this.compare(v) > 0;
        };
        NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;
        BigInteger.prototype.lesser = function(v) {
          return this.compare(v) < 0;
        };
        NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;
        BigInteger.prototype.greaterOrEquals = function(v) {
          return this.compare(v) >= 0;
        };
        NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;
        BigInteger.prototype.lesserOrEquals = function(v) {
          return this.compare(v) <= 0;
        };
        NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;
        BigInteger.prototype.isEven = function() {
          return (this.value[0] & 1) === 0;
        };
        SmallInteger.prototype.isEven = function() {
          return (this.value & 1) === 0;
        };
        NativeBigInt.prototype.isEven = function() {
          return (this.value & BigInt(1)) === BigInt(0);
        };
        BigInteger.prototype.isOdd = function() {
          return (this.value[0] & 1) === 1;
        };
        SmallInteger.prototype.isOdd = function() {
          return (this.value & 1) === 1;
        };
        NativeBigInt.prototype.isOdd = function() {
          return (this.value & BigInt(1)) === BigInt(1);
        };
        BigInteger.prototype.isPositive = function() {
          return !this.sign;
        };
        SmallInteger.prototype.isPositive = function() {
          return this.value > 0;
        };
        NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;
        BigInteger.prototype.isNegative = function() {
          return this.sign;
        };
        SmallInteger.prototype.isNegative = function() {
          return this.value < 0;
        };
        NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;
        BigInteger.prototype.isUnit = function() {
          return false;
        };
        SmallInteger.prototype.isUnit = function() {
          return Math.abs(this.value) === 1;
        };
        NativeBigInt.prototype.isUnit = function() {
          return this.abs().value === BigInt(1);
        };
        BigInteger.prototype.isZero = function() {
          return false;
        };
        SmallInteger.prototype.isZero = function() {
          return this.value === 0;
        };
        NativeBigInt.prototype.isZero = function() {
          return this.value === BigInt(0);
        };
        BigInteger.prototype.isDivisibleBy = function(v) {
          var n = parseValue(v);
          if (n.isZero())
            return false;
          if (n.isUnit())
            return true;
          if (n.compareAbs(2) === 0)
            return this.isEven();
          return this.mod(n).isZero();
        };
        NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;
        function isBasicPrime(v) {
          var n = v.abs();
          if (n.isUnit())
            return false;
          if (n.equals(2) || n.equals(3) || n.equals(5))
            return true;
          if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5))
            return false;
          if (n.lesser(49))
            return true;
        }
        function millerRabinTest(n, a) {
          var nPrev = n.prev(), b = nPrev, r = 0, d, t, i2, x;
          while (b.isEven())
            b = b.divide(2), r++;
          next:
            for (i2 = 0; i2 < a.length; i2++) {
              if (n.lesser(a[i2]))
                continue;
              x = bigInt(a[i2]).modPow(b, n);
              if (x.isUnit() || x.equals(nPrev))
                continue;
              for (d = r - 1; d != 0; d--) {
                x = x.square().mod(n);
                if (x.isUnit())
                  return false;
                if (x.equals(nPrev))
                  continue next;
              }
              return false;
            }
          return true;
        }
        BigInteger.prototype.isPrime = function(strict) {
          var isPrime = isBasicPrime(this);
          if (isPrime !== undefined2)
            return isPrime;
          var n = this.abs();
          var bits = n.bitLength();
          if (bits <= 64)
            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
          var logN = Math.log(2) * bits.toJSNumber();
          var t = Math.ceil(strict === true ? 2 * Math.pow(logN, 2) : logN);
          for (var a = [], i2 = 0; i2 < t; i2++) {
            a.push(bigInt(i2 + 2));
          }
          return millerRabinTest(n, a);
        };
        NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;
        BigInteger.prototype.isProbablePrime = function(iterations, rng) {
          var isPrime = isBasicPrime(this);
          if (isPrime !== undefined2)
            return isPrime;
          var n = this.abs();
          var t = iterations === undefined2 ? 5 : iterations;
          for (var a = [], i2 = 0; i2 < t; i2++) {
            a.push(bigInt.randBetween(2, n.minus(2), rng));
          }
          return millerRabinTest(n, a);
        };
        NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;
        BigInteger.prototype.modInv = function(n) {
          var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
          while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
          }
          if (!r.isUnit())
            throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
          if (t.compare(0) === -1) {
            t = t.add(n);
          }
          if (this.isNegative()) {
            return t.negate();
          }
          return t;
        };
        NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;
        BigInteger.prototype.next = function() {
          var value = this.value;
          if (this.sign) {
            return subtractSmall(value, 1, this.sign);
          }
          return new BigInteger(addSmall(value, 1), this.sign);
        };
        SmallInteger.prototype.next = function() {
          var value = this.value;
          if (value + 1 < MAX_INT)
            return new SmallInteger(value + 1);
          return new BigInteger(MAX_INT_ARR, false);
        };
        NativeBigInt.prototype.next = function() {
          return new NativeBigInt(this.value + BigInt(1));
        };
        BigInteger.prototype.prev = function() {
          var value = this.value;
          if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
          }
          return subtractSmall(value, 1, this.sign);
        };
        SmallInteger.prototype.prev = function() {
          var value = this.value;
          if (value - 1 > -MAX_INT)
            return new SmallInteger(value - 1);
          return new BigInteger(MAX_INT_ARR, true);
        };
        NativeBigInt.prototype.prev = function() {
          return new NativeBigInt(this.value - BigInt(1));
        };
        var powersOfTwo = [1];
        while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE)
          powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
        var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];
        function shift_isSmall(n) {
          return Math.abs(n) <= BASE;
        }
        BigInteger.prototype.shiftLeft = function(v) {
          var n = parseValue(v).toJSNumber();
          if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
          }
          if (n < 0)
            return this.shiftRight(-n);
          var result = this;
          if (result.isZero())
            return result;
          while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
          }
          return result.multiply(powersOfTwo[n]);
        };
        NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;
        BigInteger.prototype.shiftRight = function(v) {
          var remQuo;
          var n = parseValue(v).toJSNumber();
          if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
          }
          if (n < 0)
            return this.shiftLeft(-n);
          var result = this;
          while (n >= powers2Length) {
            if (result.isZero() || result.isNegative() && result.isUnit())
              return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
          }
          remQuo = divModAny(result, powersOfTwo[n]);
          return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
        };
        NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;
        function bitwise(x, y, fn) {
          y = parseValue(y);
          var xSign = x.isNegative(), ySign = y.isNegative();
          var xRem = xSign ? x.not() : x, yRem = ySign ? y.not() : y;
          var xDigit = 0, yDigit = 0;
          var xDivMod = null, yDivMod = null;
          var result = [];
          while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
              xDigit = highestPower2 - 1 - xDigit;
            }
            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
              yDigit = highestPower2 - 1 - yDigit;
            }
            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
          }
          var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
          for (var i2 = result.length - 1; i2 >= 0; i2 -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i2]));
          }
          return sum;
        }
        BigInteger.prototype.not = function() {
          return this.negate().prev();
        };
        NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;
        BigInteger.prototype.and = function(n) {
          return bitwise(this, n, function(a, b) {
            return a & b;
          });
        };
        NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;
        BigInteger.prototype.or = function(n) {
          return bitwise(this, n, function(a, b) {
            return a | b;
          });
        };
        NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;
        BigInteger.prototype.xor = function(n) {
          return bitwise(this, n, function(a, b) {
            return a ^ b;
          });
        };
        NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;
        var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
        function roughLOB(n) {
          var v = n.value, x = typeof v === "number" ? v | LOBMASK_I : typeof v === "bigint" ? v | BigInt(LOBMASK_I) : v[0] + v[1] * BASE | LOBMASK_BI;
          return x & -x;
        }
        function integerLogarithm(value, base) {
          if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p, e: e * 2 };
          }
          return { p: bigInt(1), e: 0 };
        }
        BigInteger.prototype.bitLength = function() {
          var n = this;
          if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
          }
          if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
          }
          return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
        };
        NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;
        function max(a, b) {
          a = parseValue(a);
          b = parseValue(b);
          return a.greater(b) ? a : b;
        }
        function min(a, b) {
          a = parseValue(a);
          b = parseValue(b);
          return a.lesser(b) ? a : b;
        }
        function gcd(a, b) {
          a = parseValue(a).abs();
          b = parseValue(b).abs();
          if (a.equals(b))
            return a;
          if (a.isZero())
            return b;
          if (b.isZero())
            return a;
          var c = Integer[1], d, t;
          while (a.isEven() && b.isEven()) {
            d = min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
          }
          while (a.isEven()) {
            a = a.divide(roughLOB(a));
          }
          do {
            while (b.isEven()) {
              b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
              t = b;
              b = a;
              a = t;
            }
            b = b.subtract(a);
          } while (!b.isZero());
          return c.isUnit() ? a : a.multiply(c);
        }
        function lcm(a, b) {
          a = parseValue(a).abs();
          b = parseValue(b).abs();
          return a.divide(gcd(a, b)).multiply(b);
        }
        function randBetween(a, b, rng) {
          a = parseValue(a);
          b = parseValue(b);
          var usedRNG = rng || Math.random;
          var low = min(a, b), high = max(a, b);
          var range = high.subtract(low).add(1);
          if (range.isSmall)
            return low.add(Math.floor(usedRNG() * range));
          var digits = toBase(range, BASE).value;
          var result = [], restricted = true;
          for (var i2 = 0; i2 < digits.length; i2++) {
            var top = restricted ? digits[i2] + (i2 + 1 < digits.length ? digits[i2 + 1] / BASE : 0) : BASE;
            var digit = truncate(usedRNG() * top);
            result.push(digit);
            if (digit < digits[i2])
              restricted = false;
          }
          return low.add(Integer.fromArray(result, BASE, false));
        }
        var parseBase = function(text, base, alphabet, caseSensitive) {
          alphabet = alphabet || DEFAULT_ALPHABET;
          text = String(text);
          if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
          }
          var length = text.length;
          var i2;
          var absBase = Math.abs(base);
          var alphabetValues = {};
          for (i2 = 0; i2 < alphabet.length; i2++) {
            alphabetValues[alphabet[i2]] = i2;
          }
          for (i2 = 0; i2 < length; i2++) {
            var c = text[i2];
            if (c === "-")
              continue;
            if (c in alphabetValues) {
              if (alphabetValues[c] >= absBase) {
                if (c === "1" && absBase === 1)
                  continue;
                throw new Error(c + " is not a valid digit in base " + base + ".");
              }
            }
          }
          base = parseValue(base);
          var digits = [];
          var isNegative = text[0] === "-";
          for (i2 = isNegative ? 1 : 0; i2 < text.length; i2++) {
            var c = text[i2];
            if (c in alphabetValues)
              digits.push(parseValue(alphabetValues[c]));
            else if (c === "<") {
              var start = i2;
              do {
                i2++;
              } while (text[i2] !== ">" && i2 < text.length);
              digits.push(parseValue(text.slice(start + 1, i2)));
            } else
              throw new Error(c + " is not a valid character");
          }
          return parseBaseFromArray(digits, base, isNegative);
        };
        function parseBaseFromArray(digits, base, isNegative) {
          var val = Integer[0], pow = Integer[1], i2;
          for (i2 = digits.length - 1; i2 >= 0; i2--) {
            val = val.add(digits[i2].times(pow));
            pow = pow.times(base);
          }
          return isNegative ? val.negate() : val;
        }
        function stringify(digit, alphabet) {
          alphabet = alphabet || DEFAULT_ALPHABET;
          if (digit < alphabet.length) {
            return alphabet[digit];
          }
          return "<" + digit + ">";
        }
        function toBase(n, base) {
          base = bigInt(base);
          if (base.isZero()) {
            if (n.isZero())
              return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
          }
          if (base.equals(-1)) {
            if (n.isZero())
              return { value: [0], isNegative: false };
            if (n.isNegative())
              return {
                value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber())).map(Array.prototype.valueOf, [1, 0])),
                isNegative: false
              };
            var arr = Array.apply(null, Array(n.toJSNumber() - 1)).map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
              value: [].concat.apply([], arr),
              isNegative: false
            };
          }
          var neg = false;
          if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
          }
          if (base.isUnit()) {
            if (n.isZero())
              return { value: [0], isNegative: false };
            return {
              value: Array.apply(null, Array(n.toJSNumber())).map(Number.prototype.valueOf, 1),
              isNegative: neg
            };
          }
          var out = [];
          var left = n, divmod;
          while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
              digit = base.minus(digit).abs();
              left = left.next();
            }
            out.push(digit.toJSNumber());
          }
          out.push(left.toJSNumber());
          return { value: out.reverse(), isNegative: neg };
        }
        function toBaseString(n, base, alphabet) {
          var arr = toBase(n, base);
          return (arr.isNegative ? "-" : "") + arr.value.map(function(x) {
            return stringify(x, alphabet);
          }).join("");
        }
        BigInteger.prototype.toArray = function(radix) {
          return toBase(this, radix);
        };
        SmallInteger.prototype.toArray = function(radix) {
          return toBase(this, radix);
        };
        NativeBigInt.prototype.toArray = function(radix) {
          return toBase(this, radix);
        };
        BigInteger.prototype.toString = function(radix, alphabet) {
          if (radix === undefined2)
            radix = 10;
          if (radix !== 10)
            return toBaseString(this, radix, alphabet);
          var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
          while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
          }
          var sign = this.sign ? "-" : "";
          return sign + str;
        };
        SmallInteger.prototype.toString = function(radix, alphabet) {
          if (radix === undefined2)
            radix = 10;
          if (radix != 10)
            return toBaseString(this, radix, alphabet);
          return String(this.value);
        };
        NativeBigInt.prototype.toString = SmallInteger.prototype.toString;
        NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function() {
          return this.toString();
        };
        BigInteger.prototype.valueOf = function() {
          return parseInt(this.toString(), 10);
        };
        BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;
        SmallInteger.prototype.valueOf = function() {
          return this.value;
        };
        SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
        NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function() {
          return parseInt(this.toString(), 10);
        };
        function parseStringValue(v) {
          if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
              return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
          }
          var sign = v[0] === "-";
          if (sign)
            v = v.slice(1);
          var split = v.split(/e/i);
          if (split.length > 2)
            throw new Error("Invalid integer: " + split.join("e"));
          if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+")
              exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp))
              throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
              exp -= text.length - decimalPlace - 1;
              text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0)
              throw new Error("Cannot include negative exponent part for integers");
            text += new Array(exp + 1).join("0");
            v = text;
          }
          var isValid = /^([0-9][0-9]*)$/.test(v);
          if (!isValid)
            throw new Error("Invalid integer: " + v);
          if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v));
          }
          var r = [], max2 = v.length, l = LOG_BASE, min2 = max2 - l;
          while (max2 > 0) {
            r.push(+v.slice(min2, max2));
            min2 -= l;
            if (min2 < 0)
              min2 = 0;
            max2 -= l;
          }
          trim(r);
          return new BigInteger(r, sign);
        }
        function parseNumberValue(v) {
          if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v));
          }
          if (isPrecise(v)) {
            if (v !== truncate(v))
              throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
          }
          return parseStringValue(v.toString());
        }
        function parseValue(v) {
          if (typeof v === "number") {
            return parseNumberValue(v);
          }
          if (typeof v === "string") {
            return parseStringValue(v);
          }
          if (typeof v === "bigint") {
            return new NativeBigInt(v);
          }
          return v;
        }
        for (var i = 0; i < 1e3; i++) {
          Integer[i] = parseValue(i);
          if (i > 0)
            Integer[-i] = parseValue(-i);
        }
        Integer.one = Integer[1];
        Integer.zero = Integer[0];
        Integer.minusOne = Integer[-1];
        Integer.max = max;
        Integer.min = min;
        Integer.gcd = gcd;
        Integer.lcm = lcm;
        Integer.isInstance = function(x) {
          return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt;
        };
        Integer.randBetween = randBetween;
        Integer.fromArray = function(digits, base, isNegative) {
          return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
        };
        return Integer;
      }();
      if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
        module.exports = bigInt;
      }
      if (typeof define === "function" && define.amd) {
        define(function() {
          return bigInt;
        });
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/mcmp.js
  var require_mcmp = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/mcmp.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.mcmp = void 0;
      var big_integer_1 = __importDefault(require_BigInteger());
      function mcmp(a, b) {
        return a.compare(b);
      }
      exports.mcmp = mcmp;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/index.js
  var require_sources = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.set_component = exports.index_function = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var tensor_1 = require_tensor();
      function index_function(stack) {
        const s = 0;
        let p1 = stack[s];
        const { ndim } = p1.tensor;
        const m = stack.length - 1;
        if (m > ndim) {
          run_1.stop("too many indices for tensor");
        }
        let k = 0;
        for (let i = 0; i < m; i++) {
          const t = bignum_1.nativeInt(stack[s + i + 1]);
          if (t < 1 || t > p1.tensor.dim[i]) {
            run_1.stop("index out of range");
          }
          k = k * p1.tensor.dim[i] + t - 1;
        }
        if (ndim === m) {
          return p1.tensor.elem[k];
        }
        k = p1.tensor.dim.slice(m).reduce((a, b) => a * b, k);
        const nelem = p1.tensor.dim.slice(m).reduce((a, b) => a * b, 1);
        const p2 = alloc_1.alloc_tensor(nelem);
        p2.tensor.ndim = ndim - m;
        p2.tensor.dim = p1.tensor.dim.slice(m);
        for (let i = 0; i < nelem; i++) {
          p2.tensor.elem[i] = p1.tensor.elem[k + i];
        }
        tensor_1.check_tensor_dimensions(p1);
        tensor_1.check_tensor_dimensions(p2);
        return p2;
      }
      exports.index_function = index_function;
      function set_component(n) {
        if (n < 3) {
          run_1.stop("error in indexed assign");
        }
        const s = defs_1.defs.tos - n;
        const RVALUE = defs_1.defs.stack[s];
        let LVALUE = defs_1.defs.stack[s + 1];
        if (!defs_1.istensor(LVALUE)) {
          run_1.stop("error in indexed assign: assigning to something that is not a tensor");
        }
        const { ndim } = LVALUE.tensor;
        const m = n - 2;
        if (m > ndim) {
          run_1.stop("error in indexed assign");
        }
        let k = 0;
        for (let i = 0; i < m; i++) {
          const t = bignum_1.nativeInt(defs_1.defs.stack[s + i + 2]);
          if (t < 1 || t > LVALUE.tensor.dim[i]) {
            run_1.stop("error in indexed assign\n");
          }
          k = k * LVALUE.tensor.dim[i] + t - 1;
        }
        for (let i = m; i < ndim; i++) {
          k = k * LVALUE.tensor.dim[i] + 0;
        }
        const TMP = alloc_1.alloc_tensor(LVALUE.tensor.nelem);
        TMP.tensor.ndim = LVALUE.tensor.ndim;
        TMP.tensor.dim = Array.from(LVALUE.tensor.dim);
        TMP.tensor.elem = Array.from(LVALUE.tensor.elem);
        tensor_1.check_tensor_dimensions(LVALUE);
        tensor_1.check_tensor_dimensions(TMP);
        LVALUE = TMP;
        if (ndim === m) {
          if (defs_1.istensor(RVALUE)) {
            run_1.stop("error in indexed assign");
          }
          LVALUE.tensor.elem[k] = RVALUE;
          tensor_1.check_tensor_dimensions(LVALUE);
          stack_1.moveTos(defs_1.defs.tos - n);
          stack_1.push(LVALUE);
          return;
        }
        if (!defs_1.istensor(RVALUE)) {
          run_1.stop("error in indexed assign");
        }
        if (ndim - m !== RVALUE.tensor.ndim) {
          run_1.stop("error in indexed assign");
        }
        for (let i = 0; i < RVALUE.tensor.ndim; i++) {
          if (LVALUE.tensor.dim[m + i] !== RVALUE.tensor.dim[i]) {
            run_1.stop("error in indexed assign");
          }
        }
        for (let i = 0; i < RVALUE.tensor.nelem; i++) {
          LVALUE.tensor.elem[k + i] = RVALUE.tensor.elem[i];
        }
        tensor_1.check_tensor_dimensions(LVALUE);
        tensor_1.check_tensor_dimensions(RVALUE);
        stack_1.moveTos(defs_1.defs.tos - n);
        stack_1.push(LVALUE);
      }
      exports.set_component = set_component;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/count.js
  var require_count = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/count.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.countsize = exports.countOccurrencesOfSymbol = exports.count = void 0;
      var misc_1 = require_misc();
      var defs_1 = require_defs();
      var sum = (arr) => arr.reduce((a, b) => a + b, 0);
      function count(p) {
        let n;
        if (defs_1.iscons(p)) {
          const items = [...p];
          n = sum(items.map(count)) + items.length;
        } else {
          n = 1;
        }
        return n;
      }
      exports.count = count;
      function countOccurrencesOfSymbol(needle, p) {
        let n = 0;
        if (defs_1.iscons(p)) {
          n = sum([...p].map((el) => countOccurrencesOfSymbol(needle, el)));
        } else if (misc_1.equal(needle, p)) {
          n = 1;
        }
        return n;
      }
      exports.countOccurrencesOfSymbol = countOccurrencesOfSymbol;
      function countsize(p) {
        let n = 0;
        if (defs_1.istensor(p)) {
          for (let i = 0; i < p.tensor.nelem; i++) {
            n += count(p.tensor.elem[i]);
          }
        } else if (defs_1.iscons(p)) {
          const items = [...p];
          n = sum(items.map(count)) + items.length;
        } else {
          n = 1;
        }
        return n;
      }
      exports.countsize = countsize;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/symbol.js
  var require_symbol = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/symbol.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.collectUserSymbols = exports.clear_symbols = exports.push_symbol = exports.symnum = exports.get_binding = exports.set_binding = exports.get_printname = exports.usr_symbol = exports.std_symbol = exports.Eval_symbolsinfo = void 0;
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var count_1 = require_count();
      var defs_1 = require_defs();
      function Eval_symbolsinfo() {
        const symbolsinfoToBePrinted = symbolsinfo();
        if (symbolsinfoToBePrinted !== "") {
          misc_1.new_string(symbolsinfoToBePrinted);
        } else {
          push_symbol(defs_1.NIL);
        }
      }
      exports.Eval_symbolsinfo = Eval_symbolsinfo;
      function symbolsinfo() {
        let symbolsinfoToBePrinted = "";
        for (let i = defs_1.NIL + 1; i < defs_1.symtab.length; i++) {
          if (defs_1.symtab[i].printname === "") {
            if (defs_1.isSymbolReclaimable[i] === false) {
              break;
            } else {
              continue;
            }
          }
          const symtabi = defs_1.symtab[i] + "";
          const bindingi = (defs_1.binding[i] + "").substring(0, 4);
          symbolsinfoToBePrinted += "symbol: " + symtabi + " size: " + count_1.countsize(defs_1.binding[i]) + " value: " + bindingi + "...\n";
        }
        return symbolsinfoToBePrinted;
      }
      function std_symbol(s, n, latexPrint) {
        const p = defs_1.symtab[n];
        if (p == null) {
          defs_1.breakpoint;
        }
        p.printname = s;
        if (latexPrint != null) {
          p.latexPrint = latexPrint;
        } else {
          p.latexPrint = s;
        }
      }
      exports.std_symbol = std_symbol;
      function usr_symbol(s) {
        let i = 0;
        for (i = 0; i < defs_1.NSYM; i++) {
          if (s === defs_1.symtab[i].printname) {
            return defs_1.symtab[i];
          }
          if (defs_1.symtab[i].printname === "") {
            break;
          }
        }
        if (i === defs_1.NSYM) {
          run_1.stop("symbol table overflow");
        }
        defs_1.symtab[i] = new defs_1.Sym(s);
        defs_1.binding[i] = defs_1.symtab[i];
        defs_1.isSymbolReclaimable[i] = false;
        return defs_1.symtab[i];
      }
      exports.usr_symbol = usr_symbol;
      function get_printname(p) {
        if (p.k !== defs_1.SYM) {
          run_1.stop("symbol error");
        }
        return p.printname;
      }
      exports.get_printname = get_printname;
      function set_binding(p, q) {
        if (p.k !== defs_1.SYM) {
          run_1.stop("symbol error");
        }
        const indexFound = defs_1.symtab.indexOf(p);
        if (defs_1.symtab.indexOf(p, indexFound + 1) !== -1) {
          console.log("ops, more than one element!");
          defs_1.breakpoint;
        }
        if (defs_1.DEBUG) {
          console.log(`lookup >> set_binding lookup ${indexFound}`);
        }
        defs_1.isSymbolReclaimable[indexFound] = false;
        defs_1.binding[indexFound] = q;
      }
      exports.set_binding = set_binding;
      function get_binding(p) {
        if (p.k !== defs_1.SYM) {
          run_1.stop("symbol error");
        }
        const indexFound = defs_1.symtab.indexOf(p);
        if (defs_1.symtab.indexOf(p, indexFound + 1) !== -1) {
          console.log("ops, more than one element!");
          defs_1.breakpoint;
        }
        if (defs_1.DEBUG) {
          console.log(`lookup >> get_binding lookup ${indexFound}`);
        }
        return defs_1.binding[indexFound];
      }
      exports.get_binding = get_binding;
      function is_usr_symbol(p) {
        if (p.k !== defs_1.SYM) {
          return false;
        }
        const theSymnum = symnum(p);
        if (theSymnum > defs_1.PI && theSymnum !== defs_1.SYMBOL_I && theSymnum !== defs_1.SYMBOL_IDENTITY_MATRIX) {
          return true;
        }
        return false;
      }
      var lookupsTotal = 0;
      function symnum(p) {
        lookupsTotal++;
        if (p.k !== defs_1.SYM) {
          run_1.stop("symbol error");
        }
        const indexFound = defs_1.symtab.indexOf(p);
        if (defs_1.symtab.indexOf(p, indexFound + 1) !== -1) {
          console.log("ops, more than one element!");
          defs_1.breakpoint;
        }
        if (defs_1.DEBUG) {
          console.log(`lookup >> symnum lookup ${indexFound} lookup # ${lookupsTotal}`);
        }
        return indexFound;
      }
      exports.symnum = symnum;
      function push_symbol(k) {
        stack_1.push(defs_1.symtab[k]);
      }
      exports.push_symbol = push_symbol;
      function clear_symbols() {
        for (let i = defs_1.NIL + 1; i < defs_1.NSYM; i++) {
          if (defs_1.symtab[i].printname === "") {
            if (defs_1.isSymbolReclaimable[i] === false) {
              break;
            } else {
              continue;
            }
          }
          defs_1.symtab[i] = new defs_1.Sym("");
          defs_1.binding[i] = defs_1.symtab[i];
          defs_1.isSymbolReclaimable[i] = false;
        }
      }
      exports.clear_symbols = clear_symbols;
      function collectUserSymbols(p, accumulator) {
        if (accumulator == null) {
          accumulator = [];
        }
        if (is_usr_symbol(p)) {
          if (accumulator.indexOf(p) === -1) {
            accumulator.push(p);
            return;
          }
        }
        if (defs_1.istensor(p)) {
          for (let i = 0; i < p.tensor.nelem; i++) {
            collectUserSymbols(p.tensor.elem[i], accumulator);
          }
          return;
        }
        while (defs_1.iscons(p)) {
          collectUserSymbols(defs_1.car(p), accumulator);
          p = defs_1.cdr(p);
        }
      }
      exports.collectUserSymbols = collectUserSymbols;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/list.js
  var require_list = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/list.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.makeList = exports.list = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      function list(n) {
        stack_1.push(defs_1.symbol(defs_1.NIL));
        for (let listIterator = 0; listIterator < n; listIterator++) {
          const arg2 = stack_1.pop();
          const arg1 = stack_1.pop();
          stack_1.push(new defs_1.Cons(arg1, arg2));
        }
      }
      exports.list = list;
      function makeList(...items) {
        let node = defs_1.symbol(defs_1.NIL);
        for (let i = items.length - 1; i >= 0; i--) {
          node = new defs_1.Cons(items[i], node);
        }
        return node;
      }
      exports.makeList = makeList;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/sin.js
  var require_sin = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/sin.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sine = exports.Eval_sin = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var cos_1 = require_cos();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      function Eval_sin(p1) {
        const result = sine(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_sin = Eval_sin;
      function sine(p1) {
        if (defs_1.isadd(p1)) {
          return sine_of_angle_sum(p1);
        }
        return sine_of_angle(p1);
      }
      exports.sine = sine;
      function sine_of_angle_sum(p1) {
        let p2 = defs_1.cdr(p1);
        while (defs_1.iscons(p2)) {
          const B = defs_1.car(p2);
          if (is_1.isnpi(B)) {
            const A = add_1.subtract(p1, B);
            return add_1.add(multiply_1.multiply(sine(A), cos_1.cosine(B)), multiply_1.multiply(cos_1.cosine(A), sine(B)));
          }
          p2 = defs_1.cdr(p2);
        }
        return sine_of_angle(p1);
      }
      function sine_of_angle(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCSIN)) {
          return defs_1.cadr(p1);
        }
        if (defs_1.isdouble(p1)) {
          let d = Math.sin(p1.d);
          if (Math.abs(d) < 1e-10) {
            d = 0;
          }
          return bignum_1.double(d);
        }
        if (is_1.isnegative(p1)) {
          return multiply_1.negate(sine(multiply_1.negate(p1)));
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCTAN)) {
          return multiply_1.multiply(defs_1.cadr(p1), power_1.power(add_1.add(defs_1.Constants.one, power_1.power(defs_1.cadr(p1), bignum_1.integer(2))), bignum_1.rational(-1, 2)));
        }
        const n = bignum_1.nativeInt(multiply_1.divide(multiply_1.multiply(p1, bignum_1.integer(180)), defs_1.Constants.Pi()));
        if (n < 0 || isNaN(n)) {
          return list_1.makeList(defs_1.symbol(defs_1.SIN), p1);
        }
        switch (n % 360) {
          case 0:
          case 180:
            return defs_1.Constants.zero;
          case 30:
          case 150:
            return bignum_1.rational(1, 2);
          case 210:
          case 330:
            return bignum_1.rational(-1, 2);
          case 45:
          case 135:
            return multiply_1.multiply(bignum_1.rational(1, 2), power_1.power(bignum_1.integer(2), bignum_1.rational(1, 2)));
          case 225:
          case 315:
            return multiply_1.multiply(bignum_1.rational(-1, 2), power_1.power(bignum_1.integer(2), bignum_1.rational(1, 2)));
          case 60:
          case 120:
            return multiply_1.multiply(bignum_1.rational(1, 2), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
          case 240:
          case 300:
            return multiply_1.multiply(bignum_1.rational(-1, 2), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
          case 90:
            return defs_1.Constants.one;
          case 270:
            return defs_1.Constants.negOne;
          default:
            return list_1.makeList(defs_1.symbol(defs_1.SIN), p1);
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/cos.js
  var require_cos = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/cos.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.cosine = exports.Eval_cos = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var sin_1 = require_sin();
      function Eval_cos(p1) {
        const result = cosine(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_cos = Eval_cos;
      function cosine(p1) {
        if (defs_1.isadd(p1)) {
          return cosine_of_angle_sum(p1);
        }
        return cosine_of_angle(p1);
      }
      exports.cosine = cosine;
      function cosine_of_angle_sum(p1) {
        if (defs_1.iscons(p1)) {
          for (const B of p1.tail()) {
            if (is_1.isnpi(B)) {
              const A = add_1.subtract(p1, B);
              return add_1.subtract(multiply_1.multiply(cosine(A), cosine(B)), multiply_1.multiply(sin_1.sine(A), sin_1.sine(B)));
            }
          }
        }
        return cosine_of_angle(p1);
      }
      function cosine_of_angle(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCCOS)) {
          return defs_1.cadr(p1);
        }
        if (defs_1.isdouble(p1)) {
          let d = Math.cos(p1.d);
          if (Math.abs(d) < 1e-10) {
            d = 0;
          }
          return bignum_1.double(d);
        }
        if (is_1.isnegative(p1)) {
          p1 = multiply_1.negate(p1);
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCTAN)) {
          const base = add_1.add(defs_1.Constants.one, power_1.power(defs_1.cadr(p1), bignum_1.integer(2)));
          return power_1.power(base, bignum_1.rational(-1, 2));
        }
        const n = bignum_1.nativeInt(multiply_1.divide(multiply_1.multiply(p1, bignum_1.integer(180)), defs_1.Constants.Pi()));
        if (n < 0 || isNaN(n)) {
          return list_1.makeList(defs_1.symbol(defs_1.COS), p1);
        }
        switch (n % 360) {
          case 90:
          case 270:
            return defs_1.Constants.zero;
          case 60:
          case 300:
            return bignum_1.rational(1, 2);
          case 120:
          case 240:
            return bignum_1.rational(-1, 2);
          case 45:
          case 315:
            return multiply_1.multiply(bignum_1.rational(1, 2), power_1.power(bignum_1.integer(2), bignum_1.rational(1, 2)));
          case 135:
          case 225:
            return multiply_1.multiply(bignum_1.rational(-1, 2), power_1.power(bignum_1.integer(2), bignum_1.rational(1, 2)));
          case 30:
          case 330:
            return multiply_1.multiply(bignum_1.rational(1, 2), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
          case 150:
          case 210:
            return multiply_1.multiply(bignum_1.rational(-1, 2), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
          case 0:
            return defs_1.Constants.one;
          case 180:
            return defs_1.Constants.negOne;
          default:
            return list_1.makeList(defs_1.symbol(defs_1.COS), p1);
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/dpow.js
  var require_dpow = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/dpow.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.dpow = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var multiply_1 = require_multiply();
      function dpow(base, expo) {
        if (base === 0 && expo < 0) {
          run_1.stop("divide by zero");
        }
        if (base >= 0 || expo % 1 === 0) {
          return bignum_1.double(Math.pow(base, expo));
        }
        const result = Math.pow(Math.abs(base), expo);
        const theta = Math.PI * expo;
        let a = 0;
        let b = 0;
        if (expo % 0.5 === 0) {
          a = 0;
          b = Math.sin(theta);
        } else {
          a = Math.cos(theta);
          b = Math.sin(theta);
        }
        return add_1.add(bignum_1.double(a * result), multiply_1.multiply(bignum_1.double(b * result), defs_1.Constants.imaginaryunit));
      }
      exports.dpow = dpow;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/factorial.js
  var require_factorial = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/factorial.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.factorial = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      function factorial(p1) {
        const n = bignum_1.nativeInt(p1);
        if (n < 0 || isNaN(n)) {
          return list_1.makeList(defs_1.symbol(defs_1.FACTORIAL), p1);
        }
        return bignum_1.bignum_factorial(n);
      }
      exports.factorial = factorial;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/mpow.js
  var require_mpow = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/mpow.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.mpow = void 0;
      function mpow(a, n) {
        return a.pow(n);
      }
      exports.mpow = mpow;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/mroot.js
  var require_mroot = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/mroot.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.mroot = void 0;
      var big_integer_1 = __importDefault(require_BigInteger());
      var mcmp_1 = require_mcmp();
      var run_1 = require_run();
      var bignum_1 = require_bignum();
      var mpow_1 = require_mpow();
      function mroot(n, index) {
        n = n.abs();
        if (index === 0) {
          run_1.stop("root index is zero");
        }
        let k = 0;
        while (n.shiftRight(k).toJSNumber() > 0) {
          k++;
        }
        if (k === 0) {
          return bignum_1.mint(0);
        }
        k = Math.floor((k - 1) / index);
        const j = Math.floor(k / 32 + 1);
        let x = big_integer_1.default(j);
        for (let i = 0; i < j; i++) {
          x = x.and(big_integer_1.default(1).shiftLeft(i).not());
        }
        while (k >= 0) {
          x = x.or(big_integer_1.default(1).shiftLeft(k));
          const y = mpow_1.mpow(x, index);
          switch (mcmp_1.mcmp(y, n)) {
            case 0:
              return x;
            case 1:
              x = x.and(big_integer_1.default(1).shiftLeft(k).not());
              break;
          }
          k--;
        }
        return 0;
      }
      exports.mroot = mroot;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/gcd.js
  var require_gcd = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/gcd.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.areunivarpolysfactoredorexpandedform = exports.gcd = exports.Eval_gcd = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var factorpoly_1 = require_factorpoly();
      var list_1 = require_list();
      function Eval_gcd(p1) {
        p1 = defs_1.cdr(p1);
        let result = eval_1.Eval(defs_1.car(p1));
        if (defs_1.iscons(p1)) {
          result = p1.tail().reduce((acc, p) => gcd(acc, eval_1.Eval(p)), result);
        }
        stack_1.push(result);
      }
      exports.Eval_gcd = Eval_gcd;
      function gcd(p1, p2) {
        return defs_1.doexpand(gcd_main, p1, p2);
      }
      exports.gcd = gcd;
      function gcd_main(p1, p2) {
        let polyVar;
        if (misc_1.equal(p1, p2)) {
          return p1;
        }
        if (defs_1.isrational(p1) && defs_1.isrational(p2)) {
          return bignum_1.gcd_numbers(p1, p2);
        }
        if (polyVar = areunivarpolysfactoredorexpandedform(p1, p2)) {
          return gcd_polys(p1, p2, polyVar);
        }
        if (defs_1.isadd(p1) && defs_1.isadd(p2)) {
          return gcd_sum_sum(p1, p2);
        }
        if (defs_1.isadd(p1)) {
          p1 = gcd_sum(p1);
        }
        if (defs_1.isadd(p2)) {
          p2 = gcd_sum(p2);
        }
        if (defs_1.ismultiply(p1)) {
          return gcd_sum_product(p1, p2);
        }
        if (defs_1.ismultiply(p2)) {
          return gcd_product_sum(p1, p2);
        }
        if (defs_1.ismultiply(p1) && defs_1.ismultiply(p2)) {
          return gcd_product_product(p1, p2);
        }
        return gcd_powers_with_same_base(p1, p2);
      }
      function areunivarpolysfactoredorexpandedform(p1, p2) {
        let polyVar;
        if (polyVar = is_1.isunivarpolyfactoredorexpandedform(p1)) {
          if (is_1.isunivarpolyfactoredorexpandedform(p2, polyVar)) {
            return polyVar;
          }
        }
      }
      exports.areunivarpolysfactoredorexpandedform = areunivarpolysfactoredorexpandedform;
      function gcd_polys(p1, p2, polyVar) {
        p1 = factorpoly_1.factorpoly(p1, polyVar);
        p2 = factorpoly_1.factorpoly(p2, polyVar);
        if (defs_1.ismultiply(p1) || defs_1.ismultiply(p2)) {
          if (!defs_1.ismultiply(p1)) {
            p1 = list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), p1, defs_1.Constants.one);
          }
          if (!defs_1.ismultiply(p2)) {
            p2 = list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), p2, defs_1.Constants.one);
          }
        }
        if (defs_1.ismultiply(p1) && defs_1.ismultiply(p2)) {
          return gcd_product_product(p1, p2);
        }
        return gcd_powers_with_same_base(p1, p2);
      }
      function gcd_product_product(p1, p2) {
        let p3 = defs_1.cdr(p1);
        let p4 = defs_1.cdr(p2);
        if (defs_1.iscons(p3)) {
          return [...p3].reduce((acc, pOuter) => {
            if (defs_1.iscons(p4)) {
              return multiply_1.multiply(acc, [...p4].reduce((innerAcc, pInner) => multiply_1.multiply(innerAcc, gcd(pOuter, pInner)), defs_1.Constants.one));
            }
          }, defs_1.Constants.one);
        }
      }
      function gcd_powers_with_same_base(base1, base2) {
        let exponent1, exponent2, p6;
        if (defs_1.ispower(base1)) {
          exponent1 = defs_1.caddr(base1);
          base1 = defs_1.cadr(base1);
        } else {
          exponent1 = defs_1.Constants.one;
        }
        if (defs_1.ispower(base2)) {
          exponent2 = defs_1.caddr(base2);
          base2 = defs_1.cadr(base2);
        } else {
          exponent2 = defs_1.Constants.one;
        }
        if (!misc_1.equal(base1, base2)) {
          return defs_1.Constants.one;
        }
        if (defs_1.isNumericAtom(exponent1) && defs_1.isNumericAtom(exponent2)) {
          const exponent3 = misc_1.lessp(exponent1, exponent2) ? exponent1 : exponent2;
          return power_1.power(base1, exponent3);
        }
        let p5 = multiply_1.divide(exponent1, exponent2);
        if (defs_1.isNumericAtom(p5)) {
          p5 = defs_1.ismultiply(exponent1) && defs_1.isNumericAtom(defs_1.cadr(exponent1)) ? defs_1.cadr(exponent1) : defs_1.Constants.one;
          p6 = defs_1.ismultiply(exponent2) && defs_1.isNumericAtom(defs_1.cadr(exponent2)) ? defs_1.cadr(exponent2) : defs_1.Constants.one;
          const exponent3 = misc_1.lessp(p5, p6) ? exponent1 : exponent2;
          return power_1.power(base1, exponent3);
        }
        p5 = add_1.subtract(exponent1, exponent2);
        if (!defs_1.isNumericAtom(p5)) {
          return defs_1.Constants.one;
        }
        const exponent = is_1.isnegativenumber(p5) ? exponent1 : exponent2;
        return power_1.power(base1, exponent);
      }
      function gcd_sum_sum(p1, p2) {
        let p3, p4, p5, p6;
        if (misc_1.length(p1) !== misc_1.length(p2)) {
          return defs_1.Constants.one;
        }
        p3 = defs_1.iscons(p1) ? p1.tail().reduce(gcd) : defs_1.car(defs_1.cdr(p1));
        p4 = defs_1.iscons(p2) ? p2.tail().reduce(gcd) : defs_1.car(defs_1.cdr(p2));
        p5 = multiply_1.divide(p1, p3);
        p6 = multiply_1.divide(p2, p4);
        if (misc_1.equal(p5, p6)) {
          return multiply_1.multiply(p5, gcd(p3, p4));
        }
        return defs_1.Constants.one;
      }
      function gcd_sum(p) {
        return defs_1.iscons(p) ? p.tail().reduce(gcd) : defs_1.car(defs_1.cdr(p));
      }
      function gcd_sum_product(p1, p2) {
        return defs_1.iscons(p1) ? p1.tail().reduce((a, b) => multiply_1.multiply(a, gcd(b, p2)), defs_1.Constants.one) : defs_1.Constants.one;
      }
      function gcd_product_sum(p1, p2) {
        return defs_1.iscons(p2) ? p2.tail().reduce((a, b) => multiply_1.multiply(a, gcd(p1, b)), defs_1.Constants.one) : defs_1.Constants.one;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/lcm.js
  var require_lcm = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/lcm.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.lcm = exports.Eval_lcm = void 0;
      var gcd_1 = require_gcd();
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      function Eval_lcm(p1) {
        p1 = defs_1.cdr(p1);
        let result = eval_1.Eval(defs_1.car(p1));
        if (defs_1.iscons(p1)) {
          result = p1.tail().reduce((a, b) => lcm(a, eval_1.Eval(b)), result);
        }
        stack_1.push(result);
      }
      exports.Eval_lcm = Eval_lcm;
      function lcm(p1, p2) {
        return defs_1.doexpand(yylcm, p1, p2);
      }
      exports.lcm = lcm;
      function yylcm(p1, p2) {
        return multiply_1.inverse(multiply_1.divide(multiply_1.divide(gcd_1.gcd(p1, p2), p1), p2));
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/filter.js
  var require_filter = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/filter.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.filter = exports.Eval_filter = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var find_1 = require_find();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var eval_1 = require_eval();
      function Eval_filter(p1) {
        p1 = defs_1.cdr(p1);
        let result = eval_1.Eval(defs_1.car(p1));
        if (defs_1.iscons(p1)) {
          result = p1.tail().reduce((acc, p) => filter(acc, eval_1.Eval(p)), result);
        }
        stack_1.push(result);
      }
      exports.Eval_filter = Eval_filter;
      function filter(F, X) {
        return filter_main(F, X);
      }
      exports.filter = filter;
      function filter_main(F, X) {
        if (defs_1.isadd(F)) {
          return filter_sum(F, X);
        }
        if (defs_1.istensor(F)) {
          return filter_tensor(F, X);
        }
        if (find_1.Find(F, X)) {
          return defs_1.Constants.zero;
        }
        return F;
      }
      function filter_sum(F, X) {
        return defs_1.iscons(F) ? F.tail().reduce((a, b) => add_1.add(a, filter(b, X)), defs_1.Constants.zero) : defs_1.Constants.zero;
      }
      function filter_tensor(F, X) {
        const n = F.tensor.nelem;
        const p3 = alloc_1.alloc_tensor(n);
        p3.tensor.ndim = F.tensor.ndim;
        p3.tensor.dim = Array.from(F.tensor.dim);
        p3.tensor.elem = F.tensor.elem.map((el) => filter(el, X));
        return p3;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/subst.js
  var require_subst = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/subst.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.subst = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var misc_1 = require_misc();
      var tensor_1 = require_tensor();
      function subst(expr, oldExpr, newExpr) {
        if (oldExpr === defs_1.symbol(defs_1.NIL) || newExpr === defs_1.symbol(defs_1.NIL)) {
          return expr;
        }
        if (defs_1.istensor(expr)) {
          const p4 = alloc_1.alloc_tensor(expr.tensor.nelem);
          p4.tensor.ndim = expr.tensor.ndim;
          p4.tensor.dim = Array.from(expr.tensor.dim);
          p4.tensor.elem = expr.tensor.elem.map((el) => {
            const result = subst(el, oldExpr, newExpr);
            tensor_1.check_tensor_dimensions(p4);
            return result;
          });
          return p4;
        }
        if (misc_1.equal(expr, oldExpr)) {
          return newExpr;
        }
        if (defs_1.iscons(expr)) {
          return new defs_1.Cons(subst(defs_1.car(expr), oldExpr, newExpr), subst(defs_1.cdr(expr), oldExpr, newExpr));
        }
        return expr;
      }
      exports.subst = subst;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/coeff.js
  var require_coeff = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/coeff.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.coeff = exports.Eval_coeff = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var filter_1 = require_filter();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var subst_1 = require_subst();
      function Eval_coeff(p1) {
        let N = eval_1.Eval(defs_1.cadddr(p1));
        let X = eval_1.Eval(defs_1.caddr(p1));
        const P = eval_1.Eval(defs_1.cadr(p1));
        if (N === defs_1.symbol(defs_1.NIL)) {
          N = X;
          X = defs_1.symbol(defs_1.SYMBOL_X);
        }
        stack_1.push(filter_1.filter(multiply_1.divide(P, power_1.power(X, N)), X));
      }
      exports.Eval_coeff = Eval_coeff;
      function coeff(p, x) {
        const coefficients = [];
        while (true) {
          const c = eval_1.Eval(subst_1.subst(p, x, defs_1.Constants.zero));
          coefficients.push(c);
          p = add_1.subtract(p, c);
          if (misc_1.equal(p, defs_1.Constants.zero)) {
            return coefficients;
          }
          p = defs_1.doexpand(multiply_1.divide, p, x);
        }
      }
      exports.coeff = coeff;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/condense.js
  var require_condense = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/condense.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.yycondense = exports.Condense = exports.Eval_condense = void 0;
      var gcd_1 = require_gcd();
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      function Eval_condense(p1) {
        const result = Condense(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_condense = Eval_condense;
      function Condense(p1) {
        return defs_1.noexpand(yycondense, p1);
      }
      exports.Condense = Condense;
      function yycondense(p1) {
        if (!defs_1.isadd(p1)) {
          return p1;
        }
        const termsGCD = p1.tail().reduce(gcd_1.gcd);
        const p2 = multiply_1.inverse(termsGCD);
        const temp2 = p1.tail().reduce((a, b) => add_1.add(a, multiply_1.multiply_noexpand(p2, b)), defs_1.Constants.zero);
        const arg1 = misc_1.yyexpand(temp2);
        return multiply_1.divide(arg1, p2);
      }
      exports.yycondense = yycondense;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/divisors.js
  var require_divisors = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/divisors.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ydivisors = exports.divisors = void 0;
      var gcd_1 = require_gcd();
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var factor_1 = require_factor();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      function divisors(p) {
        const values = ydivisors(p);
        const n = values.length;
        values.sort(misc_1.cmp_expr);
        const p1 = alloc_1.alloc_tensor(n);
        p1.tensor.ndim = 1;
        p1.tensor.dim[0] = n;
        p1.tensor.elem = values;
        return p1;
      }
      exports.divisors = divisors;
      var flatten = (arr) => [].concat(...arr);
      function ydivisors(p1) {
        const stack = [];
        if (defs_1.isNumericAtom(p1)) {
          stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(p1)));
        } else if (defs_1.isadd(p1)) {
          stack.push(...__factor_add(p1));
        } else if (defs_1.ismultiply(p1)) {
          p1 = defs_1.cdr(p1);
          if (defs_1.isNumericAtom(defs_1.car(p1))) {
            stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(defs_1.car(p1))));
            p1 = defs_1.cdr(p1);
          }
          if (defs_1.iscons(p1)) {
            const mapped = [...p1].map((p2) => {
              if (defs_1.ispower(p2)) {
                return [defs_1.cadr(p2), defs_1.caddr(p2)];
              }
              return [p2, defs_1.Constants.one];
            });
            stack.push(...flatten(mapped));
          }
        } else if (defs_1.ispower(p1)) {
          stack.push(defs_1.cadr(p1), defs_1.caddr(p1));
        } else {
          stack.push(p1, defs_1.Constants.one);
        }
        const k = stack.length;
        stack.push(defs_1.Constants.one);
        gen(stack, 0, k);
        return stack.slice(k);
      }
      exports.ydivisors = ydivisors;
      function gen(stack, h, k) {
        const ACCUM = stack.pop();
        if (h === k) {
          stack.push(ACCUM);
          return;
        }
        const BASE = stack[h + 0];
        const EXPO = stack[h + 1];
        const expo = bignum_1.nativeInt(EXPO);
        if (!isNaN(expo)) {
          for (let i = 0; i <= Math.abs(expo); i++) {
            stack.push(multiply_1.multiply(ACCUM, power_1.power(BASE, bignum_1.integer(misc_1.sign(expo) * i))));
            gen(stack, h + 2, k);
          }
        }
      }
      function __factor_add(p1) {
        const temp1 = defs_1.iscons(p1) ? p1.tail().reduce(gcd_1.gcd) : defs_1.car(p1);
        const stack = [];
        let p2 = temp1;
        if (is_1.isplusone(p2)) {
          stack.push(p1, defs_1.Constants.one);
          return stack;
        }
        if (defs_1.isNumericAtom(p2)) {
          stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(p2)));
        } else if (defs_1.ismultiply(p2)) {
          let p3 = defs_1.cdr(p2);
          if (defs_1.isNumericAtom(defs_1.car(p3))) {
            stack.push(...factor_1.factor_small_number(bignum_1.nativeInt(defs_1.car(p3))));
          } else {
            stack.push(defs_1.car(p3), defs_1.Constants.one);
          }
          if (defs_1.iscons(p3)) {
            p3.tail().forEach((p) => stack.push(p, defs_1.Constants.one));
          }
        } else {
          stack.push(p2, defs_1.Constants.one);
        }
        p2 = multiply_1.inverse(p2);
        const temp2 = defs_1.iscons(p1) ? p1.tail().reduce((a, b) => add_1.add(a, multiply_1.multiply(p2, b)), defs_1.Constants.zero) : defs_1.cdr(p1);
        stack.push(temp2, defs_1.Constants.one);
        return stack;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/rationalize.js
  var require_rationalize = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/rationalize.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.rationalize = exports.Eval_rationalize = void 0;
      var gcd_1 = require_gcd();
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var condense_1 = require_condense();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      function Eval_rationalize(p1) {
        const result = rationalize(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_rationalize = Eval_rationalize;
      function rationalize(p) {
        const prev_expanding = defs_1.defs.expanding;
        const result = yyrationalize(p);
        defs_1.defs.expanding = prev_expanding;
        return result;
      }
      exports.rationalize = rationalize;
      function yyrationalize(arg) {
        if (defs_1.istensor(arg)) {
          return __rationalize_tensor(arg);
        }
        defs_1.defs.expanding = false;
        if (!defs_1.isadd(arg)) {
          return arg;
        }
        const commonDenominator = multiply_denominators(arg);
        let temp = defs_1.Constants.zero;
        if (defs_1.iscons(arg)) {
          temp = arg.tail().reduce((acc, term) => add_1.add(acc, multiply_1.multiply(commonDenominator, term)), temp);
        }
        return multiply_1.divide(condense_1.Condense(temp), commonDenominator);
      }
      function multiply_denominators(p) {
        if (defs_1.isadd(p)) {
          return p.tail().reduce((acc, el) => multiply_denominators_term(el, acc), defs_1.Constants.one);
        }
        return multiply_denominators_term(p, defs_1.Constants.one);
      }
      function multiply_denominators_term(p, p2) {
        if (defs_1.ismultiply(p)) {
          return p.tail().reduce((acc, el) => multiply_denominators_factor(el, acc), p2);
        }
        return multiply_denominators_factor(p, p2);
      }
      function multiply_denominators_factor(p, p2) {
        if (!defs_1.ispower(p)) {
          return p2;
        }
        const arg2 = p;
        p = defs_1.caddr(p);
        if (is_1.isnegativenumber(p)) {
          return __lcm(p2, multiply_1.inverse(arg2));
        }
        if (defs_1.ismultiply(p) && is_1.isnegativenumber(defs_1.cadr(p))) {
          return __lcm(p2, multiply_1.inverse(arg2));
        }
        return p2;
      }
      function __rationalize_tensor(p1) {
        p1 = eval_1.Eval(p1);
        if (!defs_1.istensor(p1)) {
          return p1;
        }
        p1.tensor.elem = p1.tensor.elem.map(rationalize);
        tensor_1.check_tensor_dimensions(p1);
        return p1;
      }
      function __lcm(p1, p2) {
        return multiply_1.divide(multiply_1.multiply(p1, p2), gcd_1.gcd(p1, p2));
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/numerator.js
  var require_numerator = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/numerator.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.numerator = exports.Eval_numerator = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var rationalize_1 = require_rationalize();
      function Eval_numerator(p1) {
        const result = numerator(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_numerator = Eval_numerator;
      function numerator(p1) {
        if (defs_1.isadd(p1)) {
          p1 = rationalize_1.rationalize(p1);
        }
        if (defs_1.ismultiply(p1) && !is_1.isplusone(defs_1.car(defs_1.cdr(p1)))) {
          return multiply_1.multiply_all(p1.tail().map(numerator));
        }
        if (defs_1.isrational(p1)) {
          return bignum_1.mp_numerator(p1);
        }
        if (defs_1.ispower(p1) && is_1.isnegativeterm(defs_1.caddr(p1))) {
          return defs_1.Constants.one;
        }
        return p1;
      }
      exports.numerator = numerator;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/print2d.js
  var require_print2d = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/print2d.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.print2dascii = void 0;
      var defs_1 = require_defs();
      var otherCFunctions_1 = require_otherCFunctions();
      var symbol_1 = require_symbol();
      var abs_1 = require_abs();
      var bignum_1 = require_bignum();
      var is_1 = require_is();
      var print_1 = require_print();
      var YMAX = 1e4;
      var glyph = class {
        constructor() {
          this.c = 0;
          this.x = 0;
          this.y = 0;
        }
      };
      var chartab = [];
      for (let charTabIndex = 0; charTabIndex < YMAX; charTabIndex++) {
        chartab[charTabIndex] = new glyph();
      }
      var yindex = 0;
      var level = 0;
      var emit_x = 0;
      var expr_level = 0;
      function printchar_nowrap(character) {
        let accumulator = "";
        accumulator += character;
        return accumulator;
      }
      function printchar(character) {
        return printchar_nowrap(character);
      }
      function print2dascii(p) {
        yindex = 0;
        level = 0;
        emit_x = 0;
        emit_top_expr(p);
        const [h, w, y] = Array.from(get_size(0, yindex));
        if (w > 100) {
          print_1.printline(p);
          return;
        }
        const beenPrinted = print_glyphs();
        return beenPrinted;
      }
      exports.print2dascii = print2dascii;
      function emit_top_expr(p) {
        if (defs_1.car(p) === defs_1.symbol(defs_1.SETQ)) {
          emit_expr(defs_1.cadr(p));
          __emit_str(" = ");
          emit_expr(defs_1.caddr(p));
          return;
        }
        if (defs_1.istensor(p)) {
          emit_tensor(p);
        } else {
          emit_expr(p);
        }
      }
      function will_be_displayed_as_fraction(p) {
        if (level > 0) {
          return false;
        }
        if (is_1.isfraction(p)) {
          return true;
        }
        if (!defs_1.ismultiply(p)) {
          return false;
        }
        if (is_1.isfraction(defs_1.cadr(p))) {
          return true;
        }
        while (defs_1.iscons(p)) {
          if (isdenominator(defs_1.car(p))) {
            return true;
          }
          p = defs_1.cdr(p);
        }
        return false;
      }
      function emit_expr(p) {
        expr_level++;
        if (defs_1.isadd(p)) {
          p = defs_1.cdr(p);
          if (__is_negative(defs_1.car(p))) {
            __emit_char("-");
            if (will_be_displayed_as_fraction(defs_1.car(p))) {
              __emit_char(" ");
            }
          }
          emit_term(defs_1.car(p));
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            if (__is_negative(defs_1.car(p))) {
              __emit_char(" ");
              __emit_char("-");
              __emit_char(" ");
            } else {
              __emit_char(" ");
              __emit_char("+");
              __emit_char(" ");
            }
            emit_term(defs_1.car(p));
            p = defs_1.cdr(p);
          }
        } else {
          if (__is_negative(p)) {
            __emit_char("-");
            if (will_be_displayed_as_fraction(p)) {
              __emit_char(" ");
            }
          }
          emit_term(p);
        }
        expr_level--;
      }
      function emit_unsigned_expr(p) {
        if (defs_1.isadd(p)) {
          p = defs_1.cdr(p);
          emit_term(defs_1.car(p));
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            if (__is_negative(defs_1.car(p))) {
              __emit_char(" ");
              __emit_char("-");
              __emit_char(" ");
            } else {
              __emit_char(" ");
              __emit_char("+");
              __emit_char(" ");
            }
            emit_term(defs_1.car(p));
            p = defs_1.cdr(p);
          }
        } else {
          emit_term(p);
        }
      }
      function __is_negative(p) {
        if (is_1.isnegativenumber(p)) {
          return true;
        }
        if (defs_1.ismultiply(p) && is_1.isnegativenumber(defs_1.cadr(p))) {
          return true;
        }
        return false;
      }
      function emit_term(p) {
        if (defs_1.ismultiply(p)) {
          const n = count_denominators(p);
          if (n && level === 0) {
            emit_fraction(p, n);
          } else {
            emit_multiply(p, n);
          }
        } else {
          emit_factor(p);
        }
      }
      function isdenominator(p) {
        return defs_1.ispower(p) && defs_1.cadr(p) !== defs_1.symbol(defs_1.E) && __is_negative(defs_1.caddr(p));
      }
      function count_denominators(p) {
        let count = 0;
        p = defs_1.cdr(p);
        while (defs_1.iscons(p)) {
          const q = defs_1.car(p);
          if (isdenominator(q)) {
            count++;
          }
          p = defs_1.cdr(p);
        }
        return count;
      }
      function emit_multiply(p, n) {
        if (n === 0) {
          p = defs_1.cdr(p);
          if (is_1.isplusone(defs_1.car(p)) || is_1.isminusone(defs_1.car(p))) {
            p = defs_1.cdr(p);
          }
          emit_factor(defs_1.car(p));
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            __emit_char(" ");
            emit_factor(defs_1.car(p));
            p = defs_1.cdr(p);
          }
        } else {
          emit_numerators(p);
          __emit_char("/");
          if (n > 1 || is_1.isfraction(defs_1.cadr(p))) {
            __emit_char("(");
            emit_denominators(p);
            __emit_char(")");
          } else {
            emit_denominators(p);
          }
        }
      }
      function emit_fraction(p, d) {
        let p1, p2;
        let count = 0;
        let k1 = 0;
        let k2 = 0;
        let n = 0;
        let x = 0;
        let A = defs_1.Constants.one;
        let B = defs_1.Constants.one;
        if (defs_1.isrational(defs_1.cadr(p))) {
          A = abs_1.absval(bignum_1.mp_numerator(defs_1.cadr(p)));
          B = bignum_1.mp_denominator(defs_1.cadr(p));
        }
        if (defs_1.isdouble(defs_1.cadr(p))) {
          A = abs_1.absval(defs_1.cadr(p));
        }
        n = is_1.isplusone(A) ? 0 : 1;
        p1 = defs_1.cdr(p);
        if (defs_1.isNumericAtom(defs_1.car(p1))) {
          p1 = defs_1.cdr(p1);
        }
        while (defs_1.iscons(p1)) {
          p2 = defs_1.car(p1);
          if (!isdenominator(p2)) {
            n++;
          }
          p1 = defs_1.cdr(p1);
        }
        x = emit_x;
        k1 = yindex;
        count = 0;
        if (!is_1.isplusone(A)) {
          emit_number(A, 0);
          count++;
        }
        p1 = defs_1.cdr(p);
        if (defs_1.isNumericAtom(defs_1.car(p1))) {
          p1 = defs_1.cdr(p1);
        }
        while (defs_1.iscons(p1)) {
          p2 = defs_1.car(p1);
          if (!isdenominator(p2)) {
            if (count > 0) {
              __emit_char(" ");
            }
            if (n === 1) {
              emit_expr(p2);
            } else {
              emit_factor(p2);
            }
            count++;
          }
          p1 = defs_1.cdr(p1);
        }
        if (count === 0) {
          __emit_char("1");
        }
        k2 = yindex;
        count = 0;
        if (!is_1.isplusone(B)) {
          emit_number(B, 0);
          count++;
          d++;
        }
        p1 = defs_1.cdr(p);
        if (defs_1.isrational(defs_1.car(p1))) {
          p1 = defs_1.cdr(p1);
        }
        while (defs_1.iscons(p1)) {
          p2 = defs_1.car(p1);
          if (isdenominator(p2)) {
            if (count > 0) {
              __emit_char(" ");
            }
            emit_denominator(p2, d);
            count++;
          }
          p1 = defs_1.cdr(p1);
        }
        fixup_fraction(x, k1, k2);
      }
      function emit_numerators(p) {
        let p1 = defs_1.Constants.one;
        p = defs_1.cdr(p);
        if (defs_1.isrational(defs_1.car(p))) {
          p1 = abs_1.absval(bignum_1.mp_numerator(defs_1.car(p)));
          p = defs_1.cdr(p);
        } else if (defs_1.isdouble(defs_1.car(p))) {
          p1 = abs_1.absval(defs_1.car(p));
          p = defs_1.cdr(p);
        }
        let n = 0;
        if (!is_1.isplusone(p1)) {
          emit_number(p1, 0);
          n++;
        }
        while (defs_1.iscons(p)) {
          if (!isdenominator(defs_1.car(p))) {
            if (n > 0) {
              __emit_char(" ");
            }
            emit_factor(defs_1.car(p));
            n++;
          }
          p = defs_1.cdr(p);
        }
        if (n === 0) {
          __emit_char("1");
        }
      }
      function emit_denominators(p) {
        let n = 0;
        p = defs_1.cdr(p);
        if (is_1.isfraction(defs_1.car(p))) {
          const p1 = bignum_1.mp_denominator(defs_1.car(p));
          emit_number(p1, 0);
          n++;
          p = defs_1.cdr(p);
        }
        while (defs_1.iscons(p)) {
          if (isdenominator(defs_1.car(p))) {
            if (n > 0) {
              __emit_char(" ");
            }
            emit_denominator(defs_1.car(p), 0);
            n++;
          }
          p = defs_1.cdr(p);
        }
      }
      function emit_factor(p) {
        if (defs_1.istensor(p)) {
          if (level === 0) {
            emit_flat_tensor(p);
          } else {
            emit_flat_tensor(p);
          }
          return;
        }
        if (defs_1.isdouble(p)) {
          emit_number(p, 0);
          return;
        }
        if (defs_1.isadd(p) || defs_1.ismultiply(p)) {
          emit_subexpr(p);
          return;
        }
        if (defs_1.ispower(p)) {
          emit_power(p);
          return;
        }
        if (defs_1.iscons(p)) {
          emit_function(p);
          return;
        }
        if (defs_1.isNumericAtom(p)) {
          if (level === 0) {
            emit_numerical_fraction(p);
          } else {
            emit_number(p, 0);
          }
          return;
        }
        if (defs_1.issymbol(p)) {
          emit_symbol(p);
          return;
        }
        if (defs_1.isstr(p)) {
          emit_string(p);
        }
      }
      function emit_numerical_fraction(p) {
        const A = abs_1.absval(bignum_1.mp_numerator(p));
        const B = bignum_1.mp_denominator(p);
        if (is_1.isplusone(B)) {
          emit_number(A, 0);
          return;
        }
        let x = emit_x;
        const k1 = yindex;
        emit_number(A, 0);
        const k2 = yindex;
        emit_number(B, 0);
        fixup_fraction(x, k1, k2);
      }
      function isfactor(p) {
        if (defs_1.iscons(p) && !defs_1.isadd(p) && !defs_1.ismultiply(p) && !defs_1.ispower(p)) {
          return true;
        }
        if (defs_1.issymbol(p)) {
          return true;
        }
        if (is_1.isfraction(p)) {
          return false;
        }
        if (is_1.isnegativenumber(p)) {
          return false;
        }
        if (defs_1.isNumericAtom(p)) {
          return true;
        }
        return false;
      }
      function emit_power(p) {
        let k1 = 0;
        let k2 = 0;
        let x = 0;
        if (defs_1.cadr(p) === defs_1.symbol(defs_1.E)) {
          __emit_str("exp(");
          emit_expr(defs_1.caddr(p));
          __emit_char(")");
          return;
        }
        if (level > 0) {
          if (is_1.isminusone(defs_1.caddr(p))) {
            __emit_char("1");
            __emit_char("/");
            if (isfactor(defs_1.cadr(p))) {
              emit_factor(defs_1.cadr(p));
            } else {
              emit_subexpr(defs_1.cadr(p));
            }
          } else {
            if (isfactor(defs_1.cadr(p))) {
              emit_factor(defs_1.cadr(p));
            } else {
              emit_subexpr(defs_1.cadr(p));
            }
            __emit_char("^");
            if (isfactor(defs_1.caddr(p))) {
              emit_factor(defs_1.caddr(p));
            } else {
              emit_subexpr(defs_1.caddr(p));
            }
          }
          return;
        }
        if (__is_negative(defs_1.caddr(p))) {
          x = emit_x;
          k1 = yindex;
          __emit_char("1");
          k2 = yindex;
          emit_denominator(p, 1);
          fixup_fraction(x, k1, k2);
          return;
        }
        k1 = yindex;
        if (isfactor(defs_1.cadr(p))) {
          emit_factor(defs_1.cadr(p));
        } else {
          emit_subexpr(defs_1.cadr(p));
        }
        k2 = yindex;
        level++;
        emit_expr(defs_1.caddr(p));
        level--;
        fixup_power(k1, k2);
      }
      function emit_denominator(p, n) {
        let k1 = 0;
        let k2 = 0;
        if (is_1.isminusone(defs_1.caddr(p))) {
          if (n === 1) {
            emit_expr(defs_1.cadr(p));
          } else {
            emit_factor(defs_1.cadr(p));
          }
          return;
        }
        k1 = yindex;
        if (isfactor(defs_1.cadr(p))) {
          emit_factor(defs_1.cadr(p));
        } else {
          emit_subexpr(defs_1.cadr(p));
        }
        k2 = yindex;
        level++;
        emit_unsigned_expr(defs_1.caddr(p));
        level--;
        fixup_power(k1, k2);
      }
      function emit_function(p) {
        if (defs_1.car(p) === defs_1.symbol(defs_1.INDEX) && defs_1.issymbol(defs_1.cadr(p))) {
          emit_index_function(p);
          return;
        }
        if (defs_1.isfactorial(p)) {
          emit_factorial_function(p);
          return;
        }
        if (defs_1.car(p) === defs_1.symbol(defs_1.DERIVATIVE)) {
          __emit_char("d");
        } else {
          emit_symbol(defs_1.car(p));
        }
        __emit_char("(");
        p = defs_1.cdr(p);
        if (defs_1.iscons(p)) {
          emit_expr(defs_1.car(p));
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            __emit_char(",");
            emit_expr(defs_1.car(p));
            p = defs_1.cdr(p);
          }
        }
        __emit_char(")");
      }
      function emit_index_function(p) {
        p = defs_1.cdr(p);
        if (defs_1.caar(p) === defs_1.symbol(defs_1.ADD) || defs_1.caar(p) === defs_1.symbol(defs_1.MULTIPLY) || defs_1.caar(p) === defs_1.symbol(defs_1.POWER) || defs_1.caar(p) === defs_1.symbol(defs_1.FACTORIAL)) {
          emit_subexpr(defs_1.car(p));
        } else {
          emit_expr(defs_1.car(p));
        }
        __emit_char("[");
        p = defs_1.cdr(p);
        if (defs_1.iscons(p)) {
          emit_expr(defs_1.car(p));
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            __emit_char(",");
            emit_expr(defs_1.car(p));
            p = defs_1.cdr(p);
          }
        }
        __emit_char("]");
      }
      function emit_factorial_function(p) {
        p = defs_1.cadr(p);
        if (is_1.isfraction(p) || defs_1.isadd(p) || defs_1.ismultiply(p) || defs_1.ispower(p) || defs_1.isfactorial(p)) {
          emit_subexpr(p);
        } else {
          emit_expr(p);
        }
        __emit_char("!");
      }
      function emit_subexpr(p) {
        __emit_char("(");
        emit_expr(p);
        __emit_char(")");
      }
      function emit_symbol(p) {
        if (p === defs_1.symbol(defs_1.E)) {
          __emit_str("exp(1)");
          return;
        }
        const pPrintName = symbol_1.get_printname(p);
        for (let i = 0; i < pPrintName.length; i++) {
          __emit_char(pPrintName[i]);
        }
      }
      function emit_string(p) {
        const pString = p.str;
        __emit_char('"');
        for (let i = 0; i < pString.length; i++) {
          __emit_char(pString[i]);
        }
        __emit_char('"');
      }
      function fixup_fraction(x, k1, k2) {
        let dx = 0;
        let dy = 0;
        const [h1, w1, y1] = Array.from(get_size(k1, k2));
        const [h2, w2, y2] = Array.from(get_size(k2, yindex));
        if (w2 > w1) {
          dx = (w2 - w1) / 2;
        } else {
          dx = 0;
        }
        dx++;
        const y = y1 + h1 - 1;
        dy = -y - 1;
        move(k1, k2, dx, dy);
        if (w2 > w1) {
          dx = -w1;
        } else {
          dx = -w1 + (w1 - w2) / 2;
        }
        dx++;
        dy = -y2 + 1;
        move(k2, yindex, dx, dy);
        let w = 0;
        if (w2 > w1) {
          w = w2;
        } else {
          w = w1;
        }
        w += 2;
        emit_x = x;
        for (let i = 0; i < w; i++) {
          __emit_char("-");
        }
      }
      function fixup_power(k1, k2) {
        let dy = 0;
        let h1 = 0;
        let w1 = 0;
        let y1 = 0;
        let h2 = 0;
        let w2 = 0;
        let y2 = 0;
        [h1, w1, y1] = Array.from(get_size(k1, k2));
        [h2, w2, y2] = Array.from(get_size(k2, yindex));
        dy = -y2 - h2 + 1;
        dy += y1 - 1;
        move(k2, yindex, 0, dy);
      }
      function move(j, k, dx, dy) {
        for (let i = j; i < k; i++) {
          chartab[i].x += dx;
          chartab[i].y += dy;
        }
      }
      function get_size(j, k) {
        let min_x = chartab[j].x;
        let max_x = chartab[j].x;
        let min_y = chartab[j].y;
        let max_y = chartab[j].y;
        for (let i = j + 1; i < k; i++) {
          if (chartab[i].x < min_x) {
            min_x = chartab[i].x;
          }
          if (chartab[i].x > max_x) {
            max_x = chartab[i].x;
          }
          if (chartab[i].y < min_y) {
            min_y = chartab[i].y;
          }
          if (chartab[i].y > max_y) {
            max_y = chartab[i].y;
          }
        }
        const h = max_y - min_y + 1;
        const w = max_x - min_x + 1;
        const y = min_y;
        return [h, w, y];
      }
      function __emit_char(c) {
        if (yindex === YMAX) {
          return;
        }
        if (chartab[yindex] == null) {
          defs_1.breakpoint;
        }
        chartab[yindex].c = c;
        chartab[yindex].x = emit_x;
        chartab[yindex].y = 0;
        yindex++;
        return emit_x++;
      }
      function __emit_str(s) {
        for (let i = 0; i < s.length; i++) {
          __emit_char(s[i]);
        }
      }
      function emit_number(p, emit_sign) {
        let tmpString = "";
        switch (p.k) {
          case defs_1.NUM:
            tmpString = p.q.a.toString();
            if (tmpString[0] === "-" && emit_sign === 0) {
              tmpString = tmpString.substring(1);
            }
            for (let i = 0; i < tmpString.length; i++) {
              __emit_char(tmpString[i]);
            }
            tmpString = p.q.b.toString();
            if (tmpString === "1") {
              break;
            }
            __emit_char("/");
            for (let i = 0; i < tmpString.length; i++) {
              __emit_char(tmpString[i]);
            }
            break;
          case defs_1.DOUBLE:
            tmpString = otherCFunctions_1.doubleToReasonableString(p.d);
            if (tmpString[0] === "-" && emit_sign === 0) {
              tmpString = tmpString.substring(1);
            }
            for (let i = 0; i < tmpString.length; i++) {
              __emit_char(tmpString[i]);
            }
            break;
        }
      }
      function cmpGlyphs(a, b) {
        if (a.y < b.y) {
          return -1;
        }
        if (a.y > b.y) {
          return 1;
        }
        if (a.x < b.x) {
          return -1;
        }
        if (a.x > b.x) {
          return 1;
        }
        return 0;
      }
      function print_glyphs() {
        let accumulator = "";
        const subsetOfStack = chartab.slice(0, yindex);
        subsetOfStack.sort(cmpGlyphs);
        chartab = [].concat(subsetOfStack).concat(chartab.slice(yindex));
        let x = 0;
        let { y } = chartab[0];
        for (let i = 0; i < yindex; i++) {
          while (chartab[i].y > y) {
            accumulator += printchar("\n");
            x = 0;
            y++;
          }
          while (chartab[i].x > x) {
            accumulator += printchar_nowrap(" ");
            x++;
          }
          accumulator += printchar_nowrap(chartab[i].c);
          x++;
        }
        return accumulator;
      }
      var N = 100;
      var oneElement = class {
        constructor() {
          this.x = 0;
          this.y = 0;
          this.h = 0;
          this.w = 0;
          this.index = 0;
          this.count = 0;
        }
      };
      var elem = [];
      for (let elelmIndex = 0; elelmIndex < 1e4; elelmIndex++) {
        elem[elelmIndex] = new oneElement();
      }
      var SPACE_BETWEEN_COLUMNS = 3;
      var SPACE_BETWEEN_ROWS = 1;
      function emit_tensor(p) {
        let ncol = 0;
        let dx = 0;
        let dy = 0;
        if (p.tensor.ndim > 2) {
          emit_flat_tensor(p);
          return;
        }
        const nrow = p.tensor.dim[0];
        if (p.tensor.ndim === 2) {
          ncol = p.tensor.dim[1];
        } else {
          ncol = 1;
        }
        const n = nrow * ncol;
        if (n > N) {
          emit_flat_tensor(p);
          return;
        }
        const x = emit_x;
        for (let i = 0; i < n; i++) {
          elem[i].index = yindex;
          elem[i].x = emit_x;
          emit_expr(p.tensor.elem[i]);
          elem[i].count = yindex - elem[i].index;
          [elem[i].h, elem[i].w, elem[i].y] = Array.from(get_size(elem[i].index, yindex));
        }
        let eh = 0;
        let ew = 0;
        for (let i = 0; i < n; i++) {
          if (elem[i].h > eh) {
            eh = elem[i].h;
          }
          if (elem[i].w > ew) {
            ew = elem[i].w;
          }
        }
        const h = nrow * eh + (nrow - 1) * SPACE_BETWEEN_ROWS;
        const w = ncol * ew + (ncol - 1) * SPACE_BETWEEN_COLUMNS;
        const y = -(h / 2);
        for (let row = 0; row < nrow; row++) {
          for (let col = 0; col < ncol; col++) {
            let i = row * ncol + col;
            dx = x - elem[i].x;
            dy = y - elem[i].y;
            move(elem[i].index, elem[i].index + elem[i].count, dx, dy);
            dx = 0;
            if (col > 0) {
              dx = col * (ew + SPACE_BETWEEN_COLUMNS);
            }
            dy = 0;
            if (row > 0) {
              dy = row * (eh + SPACE_BETWEEN_ROWS);
            }
            dx += (ew - elem[i].w) / 2;
            dy += (eh - elem[i].h) / 2;
            move(elem[i].index, elem[i].index + elem[i].count, dx, dy);
          }
        }
        emit_x = x + w;
      }
      function emit_flat_tensor(p) {
        emit_tensor_inner(p, 0, 0);
      }
      function emit_tensor_inner(p, j, k) {
        __emit_char("(");
        for (let i = 0; i < p.tensor.dim[j]; i++) {
          if (j + 1 === p.tensor.ndim) {
            emit_expr(p.tensor.elem[k]);
            k = k + 1;
          } else {
            k = emit_tensor_inner(p, j + 1, k);
          }
          if (i + 1 < p.tensor.dim[j]) {
            __emit_char(",");
          }
        }
        __emit_char(")");
        return k;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/scan.js
  var require_scan = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/scan.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.scan_meta = exports.scan = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var otherCFunctions_1 = require_otherCFunctions();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var misc_1 = require_misc();
      var bignum_1 = require_bignum();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      var T_INTEGER = 1001;
      var T_DOUBLE = 1002;
      var T_SYMBOL = 1003;
      var T_FUNCTION = 1004;
      var T_NEWLINE = 1006;
      var T_STRING = 1007;
      var T_GTEQ = 1008;
      var T_LTEQ = 1009;
      var T_EQ = 1010;
      var T_NEQ = 1011;
      var T_QUOTASSIGN = 1012;
      var token = "";
      var newline_flag = 0;
      var meta_mode = 0;
      var input_str = 0;
      var scan_str = 0;
      var token_str = 0;
      var token_buf = "";
      var lastFoundSymbol = null;
      var symbolsRightOfAssignment = null;
      var symbolsLeftOfAssignment = null;
      var isSymbolLeftOfAssignment = null;
      var scanningParameters = null;
      var functionInvokationsScanningStack = null;
      var skipRootVariableToBeSolved = false;
      var assignmentFound = null;
      var scanned = "";
      function scan(s) {
        if (defs_1.DEBUG) {
          console.log(`#### scanning ${s}`);
        }
        lastFoundSymbol = null;
        symbolsRightOfAssignment = [];
        symbolsLeftOfAssignment = [];
        isSymbolLeftOfAssignment = true;
        scanningParameters = [];
        functionInvokationsScanningStack = [""];
        assignmentFound = false;
        scanned = s;
        meta_mode = 0;
        const prev_expanding = defs_1.defs.expanding;
        defs_1.defs.expanding = true;
        input_str = 0;
        scan_str = 0;
        get_next_token();
        if (token === "") {
          stack_1.push(defs_1.symbol(defs_1.NIL));
          defs_1.defs.expanding = prev_expanding;
          return 0;
        }
        scan_stmt();
        defs_1.defs.expanding = prev_expanding;
        if (!assignmentFound) {
          defs_1.defs.symbolsInExpressionsWithoutAssignments = defs_1.defs.symbolsInExpressionsWithoutAssignments.concat(symbolsLeftOfAssignment);
        }
        return token_str - input_str;
      }
      exports.scan = scan;
      function scan_meta(s) {
        scanned = s;
        meta_mode = 1;
        const prev_expanding = defs_1.defs.expanding;
        defs_1.defs.expanding = true;
        input_str = 0;
        scan_str = 0;
        get_next_token();
        if (token === "") {
          stack_1.push(defs_1.symbol(defs_1.NIL));
          defs_1.defs.expanding = prev_expanding;
          return;
        }
        scan_stmt();
        defs_1.defs.expanding = prev_expanding;
        token_str - input_str;
      }
      exports.scan_meta = scan_meta;
      function scan_stmt() {
        scan_relation();
        let assignmentIsOfQuotedType = false;
        if (token === T_QUOTASSIGN) {
          assignmentIsOfQuotedType = true;
        }
        if (token === T_QUOTASSIGN || token === "=") {
          const symbolLeftOfAssignment = lastFoundSymbol;
          if (defs_1.DEBUG) {
            console.log("assignment!");
          }
          assignmentFound = true;
          isSymbolLeftOfAssignment = false;
          get_next_token();
          symbol_1.push_symbol(defs_1.SETQ);
          stack_1.swap();
          if (assignmentIsOfQuotedType) {
            symbol_1.push_symbol(defs_1.QUOTE);
          }
          scan_relation();
          if (assignmentIsOfQuotedType) {
            list_1.list(2);
          }
          list_1.list(3);
          isSymbolLeftOfAssignment = true;
          if (defs_1.defs.codeGen) {
            const indexOfSymbolLeftOfAssignment = symbolsRightOfAssignment.indexOf(symbolLeftOfAssignment);
            if (indexOfSymbolLeftOfAssignment !== -1) {
              symbolsRightOfAssignment.splice(indexOfSymbolLeftOfAssignment, 1);
              defs_1.defs.symbolsHavingReassignments.push(symbolLeftOfAssignment);
            }
            if (defs_1.DEBUG) {
              console.log(`locally, ${symbolLeftOfAssignment} depends on: `);
              for (const i of Array.from(symbolsRightOfAssignment)) {
                console.log(`  ${i}`);
              }
            }
            if (defs_1.defs.symbolsDependencies[symbolLeftOfAssignment] == null) {
              defs_1.defs.symbolsDependencies[symbolLeftOfAssignment] = [];
            }
            const existingDependencies = defs_1.defs.symbolsDependencies[symbolLeftOfAssignment];
            for (const i of Array.from(symbolsRightOfAssignment)) {
              if (existingDependencies.indexOf(i) === -1) {
                existingDependencies.push(i);
              }
            }
            symbolsRightOfAssignment = [];
          }
        }
      }
      function scan_relation() {
        scan_expression();
        switch (token) {
          case T_EQ:
            symbol_1.push_symbol(defs_1.TESTEQ);
            stack_1.swap();
            get_next_token();
            scan_expression();
            return list_1.list(3);
          case T_NEQ:
            symbol_1.push_symbol(defs_1.NOT);
            stack_1.swap();
            symbol_1.push_symbol(defs_1.TESTEQ);
            stack_1.swap();
            get_next_token();
            scan_expression();
            list_1.list(3);
            return list_1.list(2);
          case T_LTEQ:
            symbol_1.push_symbol(defs_1.TESTLE);
            stack_1.swap();
            get_next_token();
            scan_expression();
            return list_1.list(3);
          case T_GTEQ:
            symbol_1.push_symbol(defs_1.TESTGE);
            stack_1.swap();
            get_next_token();
            scan_expression();
            return list_1.list(3);
          case "<":
            symbol_1.push_symbol(defs_1.TESTLT);
            stack_1.swap();
            get_next_token();
            scan_expression();
            return list_1.list(3);
          case ">":
            symbol_1.push_symbol(defs_1.TESTGT);
            stack_1.swap();
            get_next_token();
            scan_expression();
            return list_1.list(3);
        }
      }
      function scan_expression() {
        const h = defs_1.defs.tos;
        switch (token) {
          case "+":
            get_next_token();
            scan_term();
            break;
          case "-":
            get_next_token();
            scan_term();
            stack_1.push(multiply_1.negate(stack_1.pop()));
            break;
          default:
            scan_term();
        }
        while (newline_flag === 0 && (token === "+" || token === "-")) {
          if (token === "+") {
            get_next_token();
            scan_term();
          } else {
            get_next_token();
            scan_term();
            stack_1.push(multiply_1.negate(stack_1.pop()));
          }
        }
        if (defs_1.defs.tos - h > 1) {
          list_1.list(defs_1.defs.tos - h);
          stack_1.push(new defs_1.Cons(defs_1.symbol(defs_1.ADD), stack_1.pop()));
        }
      }
      function tokenCharCode() {
        if (typeof token == "string") {
          return token.charCodeAt(0);
        }
        return void 0;
      }
      function is_factor() {
        if (tokenCharCode() === defs_1.dotprod_unicode) {
          return true;
        }
        switch (token) {
          case "*":
          case "/":
            return true;
          case "(":
          case T_SYMBOL:
          case T_FUNCTION:
          case T_INTEGER:
          case T_DOUBLE:
          case T_STRING:
            if (newline_flag) {
              scan_str = token_str;
              return false;
            } else {
              return true;
            }
        }
        return false;
      }
      function simplify_1_in_products(tos, h) {
        if (tos > h && defs_1.isrational(defs_1.defs.stack[tos - 1]) && is_1.equaln(defs_1.defs.stack[tos - 1], 1)) {
          stack_1.pop();
        }
      }
      function multiply_consecutive_constants(tos, h) {
        if (tos > h + 1 && defs_1.isNumericAtom(defs_1.defs.stack[tos - 2]) && defs_1.isNumericAtom(defs_1.defs.stack[tos - 1])) {
          const arg2 = stack_1.pop();
          const arg1 = stack_1.pop();
          stack_1.push(multiply_1.multiply(arg1, arg2));
        }
      }
      function scan_term() {
        const h = defs_1.defs.tos;
        scan_factor();
        if (defs_1.parse_time_simplifications) {
          simplify_1_in_products(defs_1.defs.tos, h);
        }
        while (is_factor()) {
          if (token === "*") {
            get_next_token();
            scan_factor();
          } else if (token === "/") {
            simplify_1_in_products(defs_1.defs.tos, h);
            get_next_token();
            scan_factor();
            stack_1.push(multiply_1.inverse(stack_1.pop()));
          } else if (tokenCharCode() === defs_1.dotprod_unicode) {
            get_next_token();
            symbol_1.push_symbol(defs_1.INNER);
            stack_1.swap();
            scan_factor();
            list_1.list(3);
          } else {
            scan_factor();
          }
          if (defs_1.parse_time_simplifications) {
            multiply_consecutive_constants(defs_1.defs.tos, h);
            simplify_1_in_products(defs_1.defs.tos, h);
          }
        }
        if (h === defs_1.defs.tos) {
          stack_1.push(defs_1.Constants.one);
        } else if (defs_1.defs.tos - h > 1) {
          list_1.list(defs_1.defs.tos - h);
          stack_1.push(new defs_1.Cons(defs_1.symbol(defs_1.MULTIPLY), stack_1.pop()));
        }
      }
      function scan_power() {
        if (token === "^") {
          get_next_token();
          symbol_1.push_symbol(defs_1.POWER);
          stack_1.swap();
          scan_factor();
          list_1.list(3);
        }
      }
      function scan_index(h) {
        get_next_token();
        symbol_1.push_symbol(defs_1.INDEX);
        stack_1.swap();
        scan_expression();
        while (token === ",") {
          get_next_token();
          scan_expression();
        }
        if (token !== "]") {
          scan_error("] expected");
        }
        get_next_token();
        list_1.list(defs_1.defs.tos - h);
      }
      function scan_factor() {
        const h = defs_1.defs.tos;
        let firstFactorIsNumber = false;
        if (token === "(") {
          scan_subexpr();
        } else if (token === T_SYMBOL) {
          scan_symbol();
        } else if (token === T_FUNCTION) {
          scan_function_call_with_function_name();
        } else if (token === "[") {
          scan_tensor();
        } else if (token === T_INTEGER) {
          firstFactorIsNumber = true;
          bignum_1.bignum_scan_integer(token_buf);
          get_next_token();
        } else if (token === T_DOUBLE) {
          firstFactorIsNumber = true;
          bignum_1.bignum_scan_float(token_buf);
          get_next_token();
        } else if (token === T_STRING) {
          scan_string();
        } else {
          scan_error("syntax error");
        }
        while (token === "[" || token === "(" && newline_flag === 0 && !firstFactorIsNumber) {
          if (token === "[") {
            scan_index(h);
          } else if (token === "(") {
            scan_function_call_without_function_name();
          }
        }
        while (token === "!") {
          get_next_token();
          symbol_1.push_symbol(defs_1.FACTORIAL);
          stack_1.swap();
          list_1.list(2);
        }
        while (tokenCharCode() === defs_1.transpose_unicode) {
          get_next_token();
          symbol_1.push_symbol(defs_1.TRANSPOSE);
          stack_1.swap();
          list_1.list(2);
        }
        scan_power();
      }
      function addSymbolRightOfAssignment(theSymbol) {
        if (defs_1.predefinedSymbolsInGlobalScope_doNotTrackInDependencies.indexOf(theSymbol) === -1 && symbolsRightOfAssignment.indexOf(theSymbol) === -1 && symbolsRightOfAssignment.indexOf("'" + theSymbol) === -1 && !skipRootVariableToBeSolved) {
          if (defs_1.DEBUG) {
            console.log(`... adding symbol: ${theSymbol} to the set of the symbols right of assignment`);
          }
          let prefixVar = "";
          for (let i = 1; i < functionInvokationsScanningStack.length; i++) {
            if (functionInvokationsScanningStack[i] !== "") {
              prefixVar += functionInvokationsScanningStack[i] + "_" + i + "_";
            }
          }
          theSymbol = prefixVar + theSymbol;
          symbolsRightOfAssignment.push(theSymbol);
        }
      }
      function addSymbolLeftOfAssignment(theSymbol) {
        if (defs_1.predefinedSymbolsInGlobalScope_doNotTrackInDependencies.indexOf(theSymbol) === -1 && symbolsLeftOfAssignment.indexOf(theSymbol) === -1 && symbolsLeftOfAssignment.indexOf("'" + theSymbol) === -1 && !skipRootVariableToBeSolved) {
          if (defs_1.DEBUG) {
            console.log(`... adding symbol: ${theSymbol} to the set of the symbols left of assignment`);
          }
          let prefixVar = "";
          for (let i = 1; i < functionInvokationsScanningStack.length; i++) {
            if (functionInvokationsScanningStack[i] !== "") {
              prefixVar += functionInvokationsScanningStack[i] + "_" + i + "_";
            }
          }
          theSymbol = prefixVar + theSymbol;
          symbolsLeftOfAssignment.push(theSymbol);
        }
      }
      function scan_symbol() {
        if (token !== T_SYMBOL) {
          scan_error("symbol expected");
        }
        if (meta_mode && typeof token_buf == "string" && token_buf.length === 1) {
          switch (token_buf[0]) {
            case "a":
              stack_1.push(defs_1.symbol(defs_1.METAA));
              break;
            case "b":
              stack_1.push(defs_1.symbol(defs_1.METAB));
              break;
            case "x":
              stack_1.push(defs_1.symbol(defs_1.METAX));
              break;
            default:
              stack_1.push(symbol_1.usr_symbol(token_buf));
          }
        } else {
          stack_1.push(symbol_1.usr_symbol(token_buf));
        }
        if (scanningParameters.length === 0) {
          if (defs_1.DEBUG) {
            console.log(`out of scanning parameters, processing ${token_buf}`);
          }
          lastFoundSymbol = token_buf;
          if (isSymbolLeftOfAssignment) {
            addSymbolLeftOfAssignment(token_buf);
          }
        } else {
          if (defs_1.DEBUG) {
            console.log(`still scanning parameters, skipping ${token_buf}`);
          }
          if (isSymbolLeftOfAssignment) {
            addSymbolRightOfAssignment("'" + token_buf);
          }
        }
        if (defs_1.DEBUG) {
          console.log(`found symbol: ${token_buf} left of assignment: ${isSymbolLeftOfAssignment}`);
        }
        if (!isSymbolLeftOfAssignment) {
          addSymbolRightOfAssignment(token_buf);
        }
        get_next_token();
      }
      function scan_string() {
        misc_1.new_string(token_buf);
        get_next_token();
      }
      function scan_function_call_with_function_name() {
        if (defs_1.DEBUG) {
          console.log("-- scan_function_call_with_function_name start");
        }
        let n = 1;
        const p = symbol_1.usr_symbol(token_buf);
        stack_1.push(p);
        const functionName = token_buf;
        if (functionName === "roots" || functionName === "defint" || functionName === "sum" || functionName === "product" || functionName === "for") {
          functionInvokationsScanningStack.push(token_buf);
        }
        lastFoundSymbol = token_buf;
        if (!isSymbolLeftOfAssignment) {
          addSymbolRightOfAssignment(token_buf);
        }
        get_next_token();
        get_next_token();
        scanningParameters.push(true);
        if (token !== ")") {
          scan_stmt();
          n++;
          while (token === ",") {
            get_next_token();
            if (n === 2 && functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("roots") !== -1) {
              symbolsRightOfAssignment = symbolsRightOfAssignment.filter((x) => !new RegExp("roots_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf).test(x));
              skipRootVariableToBeSolved = true;
            }
            if (n === 2 && functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("sum") !== -1) {
              symbolsRightOfAssignment = symbolsRightOfAssignment.filter((x) => !new RegExp("sum_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf).test(x));
              skipRootVariableToBeSolved = true;
            }
            if (n === 2 && functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("product") !== -1) {
              symbolsRightOfAssignment = symbolsRightOfAssignment.filter((x) => !new RegExp("product_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf).test(x));
              skipRootVariableToBeSolved = true;
            }
            if (n === 2 && functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("for") !== -1) {
              symbolsRightOfAssignment = symbolsRightOfAssignment.filter((x) => !new RegExp("for_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf).test(x));
              skipRootVariableToBeSolved = true;
            }
            if (functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("defint") !== -1 && (n === 2 || n > 2 && (n - 2) % 3 === 0)) {
              symbolsRightOfAssignment = symbolsRightOfAssignment.filter((x) => !new RegExp("defint_" + (functionInvokationsScanningStack.length - 1) + "_" + token_buf).test(x));
              skipRootVariableToBeSolved = true;
            }
            scan_stmt();
            skipRootVariableToBeSolved = false;
            n++;
          }
          if (n === 2 && functionInvokationsScanningStack[functionInvokationsScanningStack.length - 1].indexOf("roots") !== -1) {
            symbolsRightOfAssignment = symbolsRightOfAssignment.filter((x) => !new RegExp("roots_" + (functionInvokationsScanningStack.length - 1) + "_x").test(x));
          }
        }
        scanningParameters.pop();
        for (let i = 0; i <= symbolsRightOfAssignment.length; i++) {
          if (symbolsRightOfAssignment[i] != null) {
            if (functionName === "roots") {
              symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("roots_" + (functionInvokationsScanningStack.length - 1) + "_"), "");
            }
            if (functionName === "defint") {
              symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("defint_" + (functionInvokationsScanningStack.length - 1) + "_"), "");
            }
            if (functionName === "sum") {
              symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("sum_" + (functionInvokationsScanningStack.length - 1) + "_"), "");
            }
            if (functionName === "product") {
              symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("product_" + (functionInvokationsScanningStack.length - 1) + "_"), "");
            }
            if (functionName === "for") {
              symbolsRightOfAssignment[i] = symbolsRightOfAssignment[i].replace(new RegExp("for_" + (functionInvokationsScanningStack.length - 1) + "_"), "");
            }
          }
        }
        if (token !== ")") {
          scan_error(") expected");
        }
        get_next_token();
        list_1.list(n);
        if (functionName === "roots" || functionName === "defint" || functionName === "sum" || functionName === "product" || functionName === "for") {
          functionInvokationsScanningStack.pop();
        }
        if (functionName === defs_1.symbol(defs_1.PATTERN).printname) {
          defs_1.defs.patternHasBeenFound = true;
        }
        if (defs_1.DEBUG) {
          console.log("-- scan_function_call_with_function_name end");
        }
      }
      function scan_function_call_without_function_name() {
        if (defs_1.DEBUG) {
          console.log("-- scan_function_call_without_function_name start");
        }
        symbol_1.push_symbol(defs_1.EVAL);
        stack_1.swap();
        list_1.list(2);
        let n = 1;
        get_next_token();
        scanningParameters.push(true);
        if (token !== ")") {
          scan_stmt();
          n++;
          while (token === ",") {
            get_next_token();
            scan_stmt();
            n++;
          }
        }
        scanningParameters.pop();
        if (token !== ")") {
          scan_error(") expected");
        }
        get_next_token();
        list_1.list(n);
        if (defs_1.DEBUG) {
          console.log(`-- scan_function_call_without_function_name end: ${stack_1.top()}`);
        }
      }
      function scan_subexpr() {
        const n = 0;
        if (token !== "(") {
          scan_error("( expected");
        }
        get_next_token();
        scan_stmt();
        if (token !== ")") {
          scan_error(") expected");
        }
        get_next_token();
      }
      function scan_tensor() {
        if (token !== "[") {
          scan_error("[ expected");
        }
        get_next_token();
        scan_stmt();
        let n = 1;
        while (token === ",") {
          get_next_token();
          scan_stmt();
          n++;
        }
        build_tensor(n);
        if (token !== "]") {
          scan_error("] expected");
        }
        get_next_token();
      }
      function scan_error(errmsg) {
        defs_1.defs.errorMessage = "";
        while (input_str !== scan_str) {
          if ((scanned[input_str] === "\n" || scanned[input_str] === "\r") && input_str + 1 === scan_str) {
            break;
          }
          defs_1.defs.errorMessage += scanned[input_str++];
        }
        defs_1.defs.errorMessage += " ? ";
        while (scanned[input_str] && scanned[input_str] !== "\n" && scanned[input_str] !== "\r") {
          defs_1.defs.errorMessage += scanned[input_str++];
        }
        defs_1.defs.errorMessage += "\n";
        run_1.stop(errmsg);
      }
      function build_tensor(n) {
        const p2 = alloc_1.alloc_tensor(n);
        p2.tensor.ndim = 1;
        p2.tensor.dim[0] = n;
        for (let i = 0; i < n; i++) {
          p2.tensor.elem[i] = defs_1.defs.stack[defs_1.defs.tos - n + i];
        }
        tensor_1.check_tensor_dimensions(p2);
        stack_1.moveTos(defs_1.defs.tos - n);
        stack_1.push(p2);
      }
      function get_next_token() {
        newline_flag = 0;
        while (true) {
          get_token();
          if (token !== T_NEWLINE) {
            break;
          }
          newline_flag = 1;
        }
        if (defs_1.DEBUG) {
          console.log(`get_next_token token: ${token}`);
        }
      }
      function get_token() {
        while (otherCFunctions_1.isspace(scanned[scan_str])) {
          if (scanned[scan_str] === "\n" || scanned[scan_str] === "\r") {
            token = T_NEWLINE;
            scan_str++;
            return;
          }
          scan_str++;
        }
        token_str = scan_str;
        if (scan_str === scanned.length) {
          token = "";
          return;
        }
        if (otherCFunctions_1.isdigit(scanned[scan_str]) || scanned[scan_str] === ".") {
          while (otherCFunctions_1.isdigit(scanned[scan_str])) {
            scan_str++;
          }
          if (scanned[scan_str] === ".") {
            scan_str++;
            while (otherCFunctions_1.isdigit(scanned[scan_str])) {
              scan_str++;
            }
            if (scanned[scan_str] === "e" && (scanned[scan_str + 1] === "+" || scanned[scan_str + 1] === "-" || otherCFunctions_1.isdigit(scanned[scan_str + 1]))) {
              scan_str += 2;
              while (otherCFunctions_1.isdigit(scanned[scan_str])) {
                scan_str++;
              }
            }
            token = T_DOUBLE;
          } else {
            token = T_INTEGER;
          }
          update_token_buf(token_str, scan_str);
          return;
        }
        if (otherCFunctions_1.isalpha(scanned[scan_str])) {
          while (otherCFunctions_1.isalnumorunderscore(scanned[scan_str])) {
            scan_str++;
          }
          if (scanned[scan_str] === "(") {
            token = T_FUNCTION;
          } else {
            token = T_SYMBOL;
          }
          update_token_buf(token_str, scan_str);
          return;
        }
        if (scanned[scan_str] === '"') {
          scan_str++;
          while (scanned[scan_str] !== '"') {
            if (scan_str === scanned.length - 1) {
              scan_str++;
              scan_error("runaway string");
              scan_str--;
            }
            scan_str++;
          }
          scan_str++;
          token = T_STRING;
          update_token_buf(token_str + 1, scan_str - 1);
          return;
        }
        if (scanned[scan_str] === "#" || scanned[scan_str] === "-" && scanned[scan_str + 1] === "-") {
          while (scanned[scan_str] && scanned[scan_str] !== "\n" && scanned[scan_str] !== "\r") {
            scan_str++;
          }
          if (scanned[scan_str]) {
            scan_str++;
          }
          token = T_NEWLINE;
          return;
        }
        if (scanned[scan_str] === ":" && scanned[scan_str + 1] === "=") {
          scan_str += 2;
          token = T_QUOTASSIGN;
          return;
        }
        if (scanned[scan_str] === "=" && scanned[scan_str + 1] === "=") {
          scan_str += 2;
          token = T_EQ;
          return;
        }
        if (scanned[scan_str] === "!" && scanned[scan_str + 1] === "=") {
          scan_str += 2;
          token = T_NEQ;
          return;
        }
        if (scanned[scan_str] === "<" && scanned[scan_str + 1] === "=") {
          scan_str += 2;
          token = T_LTEQ;
          return;
        }
        if (scanned[scan_str] === ">" && scanned[scan_str + 1] === "=") {
          scan_str += 2;
          token = T_GTEQ;
          return;
        }
        token = scanned[scan_str++];
      }
      function update_token_buf(a, b) {
        token_buf = scanned.substring(a, b);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/print.js
  var require_print = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/print.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.print_list = exports.print_expr = exports.printline = exports.collectLatexStringFromReturnValue = exports.print_str = exports.Eval_printlist = exports.Eval_printhuman = exports.Eval_printlatex = exports.Eval_printcomputer = exports.Eval_print2dascii = exports.Eval_print = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var misc_1 = require_misc();
      var abs_1 = require_abs();
      var bignum_1 = require_bignum();
      var denominator_1 = require_denominator();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var numerator_1 = require_numerator();
      var print2d_1 = require_print2d();
      var scan_1 = require_scan();
      var power_str = "^";
      function Eval_print(p1) {
        defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.defs.printMode);
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_print = Eval_print;
      function Eval_print2dascii(p1) {
        defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_2DASCII);
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_print2dascii = Eval_print2dascii;
      function Eval_printcomputer(p1) {
        defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_COMPUTER);
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_printcomputer = Eval_printcomputer;
      function Eval_printlatex(p1) {
        defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_LATEX);
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_printlatex = Eval_printlatex;
      function Eval_printhuman(p1) {
        const original_test_flag = defs_1.defs.test_flag;
        defs_1.defs.test_flag = false;
        defs_1.defs.stringsEmittedByUserPrintouts += _print(defs_1.cdr(p1), defs_1.PRINTMODE_HUMAN);
        defs_1.defs.test_flag = original_test_flag;
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_printhuman = Eval_printhuman;
      function Eval_printlist(p1) {
        const beenPrinted = _print(defs_1.cdr(p1), defs_1.PRINTMODE_LIST);
        defs_1.defs.stringsEmittedByUserPrintouts += beenPrinted;
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_printlist = Eval_printlist;
      function _print(p, passedPrintMode) {
        let accumulator = "";
        while (defs_1.iscons(p)) {
          const p2 = eval_1.Eval(defs_1.car(p));
          const origPrintMode = defs_1.defs.printMode;
          if (passedPrintMode === defs_1.PRINTMODE_COMPUTER) {
            defs_1.defs.printMode = defs_1.PRINTMODE_COMPUTER;
            accumulator = printline(p2);
            rememberPrint(accumulator, defs_1.LAST_FULL_PRINT);
          } else if (passedPrintMode === defs_1.PRINTMODE_HUMAN) {
            defs_1.defs.printMode = defs_1.PRINTMODE_HUMAN;
            accumulator = printline(p2);
            rememberPrint(accumulator, defs_1.LAST_PLAIN_PRINT);
          } else if (passedPrintMode === defs_1.PRINTMODE_2DASCII) {
            defs_1.defs.printMode = defs_1.PRINTMODE_2DASCII;
            accumulator = print2d_1.print2dascii(p2);
            rememberPrint(accumulator, defs_1.LAST_2DASCII_PRINT);
          } else if (passedPrintMode === defs_1.PRINTMODE_LATEX) {
            defs_1.defs.printMode = defs_1.PRINTMODE_LATEX;
            accumulator = printline(p2);
            rememberPrint(accumulator, defs_1.LAST_LATEX_PRINT);
          } else if (passedPrintMode === defs_1.PRINTMODE_LIST) {
            defs_1.defs.printMode = defs_1.PRINTMODE_LIST;
            accumulator = print_list(p2);
            rememberPrint(accumulator, defs_1.LAST_LIST_PRINT);
          }
          defs_1.defs.printMode = origPrintMode;
          p = defs_1.cdr(p);
        }
        if (defs_1.DEBUG) {
          console.log(`emttedString from display: ${defs_1.defs.stringsEmittedByUserPrintouts}`);
        }
        return accumulator;
      }
      function rememberPrint(theString, theTypeOfPrint) {
        scan_1.scan('"' + theString + '"');
        const parsedString = stack_1.pop();
        symbol_1.set_binding(defs_1.symbol(theTypeOfPrint), parsedString);
      }
      function print_str(s) {
        if (defs_1.DEBUG) {
          console.log(`emttedString from print_str: ${defs_1.defs.stringsEmittedByUserPrintouts}`);
        }
        return s;
      }
      exports.print_str = print_str;
      function print_char(c) {
        return c;
      }
      function collectLatexStringFromReturnValue(p) {
        const origPrintMode = defs_1.defs.printMode;
        defs_1.defs.printMode = defs_1.PRINTMODE_LATEX;
        const originalCodeGen = defs_1.defs.codeGen;
        defs_1.defs.codeGen = false;
        let returnedString = print_expr(p);
        returnedString = returnedString.replace(/_/g, "\\_");
        defs_1.defs.printMode = origPrintMode;
        defs_1.defs.codeGen = originalCodeGen;
        if (defs_1.DEBUG) {
          console.log(`emttedString from collectLatexStringFromReturnValue: ${defs_1.defs.stringsEmittedByUserPrintouts}`);
        }
        return returnedString;
      }
      exports.collectLatexStringFromReturnValue = collectLatexStringFromReturnValue;
      function printline(p) {
        let accumulator = "";
        accumulator += print_expr(p);
        return accumulator;
      }
      exports.printline = printline;
      function print_base_of_denom(BASE) {
        let accumulator = "";
        if (is_1.isfraction(BASE) || defs_1.isadd(BASE) || defs_1.ismultiply(BASE) || defs_1.ispower(BASE) || misc_1.lessp(BASE, defs_1.Constants.zero)) {
          accumulator += print_char("(");
          accumulator += print_expr(BASE);
          accumulator += print_char(")");
        } else {
          accumulator += print_expr(BASE);
        }
        return accumulator;
      }
      function print_expo_of_denom(EXPO) {
        let accumulator = "";
        if (is_1.isfraction(EXPO) || defs_1.isadd(EXPO) || defs_1.ismultiply(EXPO) || defs_1.ispower(EXPO)) {
          accumulator += print_char("(");
          accumulator += print_expr(EXPO);
          accumulator += print_char(")");
        } else {
          accumulator += print_expr(EXPO);
        }
        return accumulator;
      }
      function print_denom(p, d) {
        let accumulator = "";
        const BASE = defs_1.cadr(p);
        let EXPO = defs_1.caddr(p);
        if (is_1.isminusone(EXPO)) {
          accumulator += print_base_of_denom(BASE);
          return accumulator;
        }
        if (d === 1) {
          accumulator += print_char("(");
        }
        EXPO = multiply_1.negate(EXPO);
        accumulator += print_power(BASE, EXPO);
        if (d === 1) {
          accumulator += print_char(")");
        }
        return accumulator;
      }
      function print_a_over_b(p) {
        let A, B;
        let accumulator = "";
        let flag = 0;
        let n = 0;
        let d = 0;
        let p1 = defs_1.cdr(p);
        let p2 = defs_1.car(p1);
        if (defs_1.isrational(p2)) {
          A = abs_1.absval(bignum_1.mp_numerator(p2));
          B = bignum_1.mp_denominator(p2);
          if (!is_1.isplusone(A)) {
            n++;
          }
          if (!is_1.isplusone(B)) {
            d++;
          }
          p1 = defs_1.cdr(p1);
        } else {
          A = defs_1.Constants.one;
          B = defs_1.Constants.one;
        }
        while (defs_1.iscons(p1)) {
          p2 = defs_1.car(p1);
          if (is_denominator(p2)) {
            d++;
          } else {
            n++;
          }
          p1 = defs_1.cdr(p1);
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          accumulator += print_str("\\frac{");
        }
        if (n === 0) {
          accumulator += print_char("1");
        } else {
          flag = 0;
          p1 = defs_1.cdr(p);
          if (defs_1.isrational(defs_1.car(p1))) {
            p1 = defs_1.cdr(p1);
          }
          if (!is_1.isplusone(A)) {
            accumulator += print_factor(A);
            flag = 1;
          }
          while (defs_1.iscons(p1)) {
            p2 = defs_1.car(p1);
            if (!is_denominator(p2)) {
              if (flag) {
                accumulator += print_multiply_sign();
              }
              accumulator += print_factor(p2);
              flag = 1;
            }
            p1 = defs_1.cdr(p1);
          }
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          accumulator += print_str("}{");
        } else if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
          accumulator += print_str(" / ");
        } else {
          accumulator += print_str("/");
        }
        if (d > 1 && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
          accumulator += print_char("(");
        }
        flag = 0;
        p1 = defs_1.cdr(p);
        if (defs_1.isrational(defs_1.car(p1))) {
          p1 = defs_1.cdr(p1);
        }
        if (!is_1.isplusone(B)) {
          accumulator += print_factor(B);
          flag = 1;
        }
        while (defs_1.iscons(p1)) {
          p2 = defs_1.car(p1);
          if (is_denominator(p2)) {
            if (flag) {
              accumulator += print_multiply_sign();
            }
            accumulator += print_denom(p2, d);
            flag = 1;
          }
          p1 = defs_1.cdr(p1);
        }
        if (d > 1 && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
          accumulator += print_char(")");
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          accumulator += print_str("}");
        }
        return accumulator;
      }
      function print_expr(p) {
        let accumulator = "";
        if (defs_1.isadd(p)) {
          p = defs_1.cdr(p);
          if (sign_of_term(defs_1.car(p)) === "-") {
            accumulator += print_str("-");
          }
          accumulator += print_term(defs_1.car(p));
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            if (sign_of_term(defs_1.car(p)) === "+") {
              if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                accumulator += print_str(" + ");
              } else {
                accumulator += print_str("+");
              }
            } else {
              if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                accumulator += print_str(" - ");
              } else {
                accumulator += print_str("-");
              }
            }
            accumulator += print_term(defs_1.car(p));
            p = defs_1.cdr(p);
          }
        } else {
          if (sign_of_term(p) === "-") {
            accumulator += print_str("-");
          }
          accumulator += print_term(p);
        }
        return accumulator;
      }
      exports.print_expr = print_expr;
      function sign_of_term(p) {
        let accumulator = "";
        if (defs_1.ismultiply(p) && defs_1.isNumericAtom(defs_1.cadr(p)) && misc_1.lessp(defs_1.cadr(p), defs_1.Constants.zero)) {
          accumulator += "-";
        } else if (defs_1.isNumericAtom(p) && misc_1.lessp(p, defs_1.Constants.zero)) {
          accumulator += "-";
        } else {
          accumulator += "+";
        }
        return accumulator;
      }
      function print_term(p) {
        let accumulator = "";
        if (defs_1.ismultiply(p) && any_denominators(p)) {
          accumulator += print_a_over_b(p);
          return accumulator;
        }
        if (defs_1.ismultiply(p)) {
          let denom;
          let origAccumulator;
          p = defs_1.cdr(p);
          if (is_1.isminusone(defs_1.car(p))) {
            p = defs_1.cdr(p);
          }
          let previousFactorWasANumber = false;
          if (defs_1.isNumericAtom(defs_1.car(p))) {
            previousFactorWasANumber = true;
          }
          let numberOneOverSomething = false;
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX && defs_1.iscons(defs_1.cdr(p)) && is_1.isNumberOneOverSomething(defs_1.car(p))) {
            numberOneOverSomething = true;
            denom = defs_1.car(p).q.b.toString();
          }
          if (numberOneOverSomething) {
            origAccumulator = accumulator;
            accumulator = "";
          } else {
            accumulator += print_factor(defs_1.car(p));
          }
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
              if (previousFactorWasANumber) {
                if (defs_1.caar(p) === defs_1.symbol(defs_1.POWER)) {
                  if (defs_1.isNumericAtom(defs_1.car(defs_1.cdr(defs_1.car(p))))) {
                    if (!is_1.isfraction(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(p)))))) {
                      accumulator += " \\cdot ";
                    }
                  }
                }
              }
            }
            accumulator += print_multiply_sign();
            accumulator += print_factor(defs_1.car(p), false, true);
            previousFactorWasANumber = false;
            if (defs_1.isNumericAtom(defs_1.car(p))) {
              previousFactorWasANumber = true;
            }
            p = defs_1.cdr(p);
          }
          if (numberOneOverSomething) {
            accumulator = origAccumulator + "\\frac{" + accumulator + "}{" + denom + "}";
          }
        } else {
          accumulator += print_factor(p);
        }
        return accumulator;
      }
      function print_subexpr(p) {
        let accumulator = "";
        accumulator += print_char("(");
        accumulator += print_expr(p);
        accumulator += print_char(")");
        return accumulator;
      }
      function print_factorial_function(p) {
        let accumulator = "";
        p = defs_1.cadr(p);
        if (is_1.isfraction(p) || defs_1.isadd(p) || defs_1.ismultiply(p) || defs_1.ispower(p) || defs_1.isfactorial(p)) {
          accumulator += print_subexpr(p);
        } else {
          accumulator += print_expr(p);
        }
        accumulator += print_char("!");
        return accumulator;
      }
      function print_ABS_latex(p) {
        let accumulator = "";
        accumulator += print_str("\\left |");
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += print_str(" \\right |");
        return accumulator;
      }
      function print_BINOMIAL_latex(p) {
        let accumulator = "";
        accumulator += print_str("\\binom{");
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += print_str("}{");
        accumulator += print_expr(defs_1.caddr(p));
        accumulator += print_str("} ");
        return accumulator;
      }
      function print_DOT_latex(p) {
        let accumulator = "";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += print_str(" \\cdot ");
        accumulator += print_expr(defs_1.caddr(p));
        return accumulator;
      }
      function print_DOT_codegen(p) {
        let accumulator = "dot(";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += ", ";
        accumulator += print_expr(defs_1.caddr(p));
        accumulator += ")";
        return accumulator;
      }
      function print_SIN_codegen(p) {
        let accumulator = "Math.sin(";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += ")";
        return accumulator;
      }
      function print_COS_codegen(p) {
        let accumulator = "Math.cos(";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += ")";
        return accumulator;
      }
      function print_TAN_codegen(p) {
        let accumulator = "Math.tan(";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += ")";
        return accumulator;
      }
      function print_ARCSIN_codegen(p) {
        let accumulator = "Math.asin(";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += ")";
        return accumulator;
      }
      function print_ARCCOS_codegen(p) {
        let accumulator = "Math.acos(";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += ")";
        return accumulator;
      }
      function print_ARCTAN_codegen(p) {
        let accumulator = "Math.atan(";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += ")";
        return accumulator;
      }
      function print_SQRT_latex(p) {
        let accumulator = "";
        accumulator += print_str("\\sqrt{");
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += print_str("} ");
        return accumulator;
      }
      function print_TRANSPOSE_latex(p) {
        let accumulator = "";
        accumulator += print_str("{");
        if (defs_1.iscons(defs_1.cadr(p))) {
          accumulator += print_str("(");
        }
        accumulator += print_expr(defs_1.cadr(p));
        if (defs_1.iscons(defs_1.cadr(p))) {
          accumulator += print_str(")");
        }
        accumulator += print_str("}");
        accumulator += print_str("^T");
        return accumulator;
      }
      function print_TRANSPOSE_codegen(p) {
        let accumulator = "";
        accumulator += print_str("transpose(");
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += print_str(")");
        return accumulator;
      }
      function print_UNIT_codegen(p) {
        let accumulator = "";
        accumulator += print_str("identity(");
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += print_str(")");
        return accumulator;
      }
      function print_INV_latex(p) {
        let accumulator = "";
        accumulator += print_str("{");
        if (defs_1.iscons(defs_1.cadr(p))) {
          accumulator += print_str("(");
        }
        accumulator += print_expr(defs_1.cadr(p));
        if (defs_1.iscons(defs_1.cadr(p))) {
          accumulator += print_str(")");
        }
        accumulator += print_str("}");
        accumulator += print_str("^{-1}");
        return accumulator;
      }
      function print_INV_codegen(p) {
        let accumulator = "";
        accumulator += print_str("inv(");
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += print_str(")");
        return accumulator;
      }
      function print_DEFINT_latex(p) {
        let accumulator = "";
        const functionBody = defs_1.car(defs_1.cdr(p));
        p = defs_1.cdr(p);
        const originalIntegral = p;
        let numberOfIntegrals = 0;
        while (defs_1.iscons(defs_1.cdr(defs_1.cdr(p)))) {
          numberOfIntegrals++;
          const theIntegral = defs_1.cdr(defs_1.cdr(p));
          accumulator += print_str("\\int^{");
          accumulator += print_expr(defs_1.car(defs_1.cdr(theIntegral)));
          accumulator += print_str("}_{");
          accumulator += print_expr(defs_1.car(theIntegral));
          accumulator += print_str("} \\! ");
          p = defs_1.cdr(theIntegral);
        }
        accumulator += print_expr(functionBody);
        accumulator += print_str(" \\,");
        p = originalIntegral;
        for (let i = 1; i <= numberOfIntegrals; i++) {
          const theVariable = defs_1.cdr(p);
          accumulator += print_str(" \\mathrm{d} ");
          accumulator += print_expr(defs_1.car(theVariable));
          if (i < numberOfIntegrals) {
            accumulator += print_str(" \\, ");
          }
          p = defs_1.cdr(defs_1.cdr(theVariable));
        }
        return accumulator;
      }
      function print_tensor(p) {
        let accumulator = "";
        accumulator += print_tensor_inner(p, 0, 0)[1];
        return accumulator;
      }
      function print_tensor_inner(p, j, k) {
        let accumulator = "";
        accumulator += print_str("[");
        if (j < p.tensor.ndim - 1) {
          for (let i = 0; i < p.tensor.dim[j]; i++) {
            let retString;
            [k, retString] = Array.from(print_tensor_inner(p, j + 1, k));
            accumulator += retString;
            if (i !== p.tensor.dim[j] - 1) {
              accumulator += print_str(",");
            }
          }
        } else {
          for (let i = 0; i < p.tensor.dim[j]; i++) {
            accumulator += print_expr(p.tensor.elem[k]);
            if (i !== p.tensor.dim[j] - 1) {
              accumulator += print_str(",");
            }
            k++;
          }
        }
        accumulator += print_str("]");
        return [k, accumulator];
      }
      function print_tensor_latex(p) {
        let accumulator = "";
        if (p.tensor.ndim <= 2) {
          accumulator += print_tensor_inner_latex(true, p, 0, 0)[1];
        }
        return accumulator;
      }
      function print_tensor_inner_latex(firstLevel, p, j, k) {
        let accumulator = "";
        if (firstLevel) {
          accumulator += "\\begin{bmatrix} ";
        }
        if (j < p.tensor.ndim - 1) {
          for (let i = 0; i < p.tensor.dim[j]; i++) {
            let retString;
            [k, retString] = Array.from(print_tensor_inner_latex(false, p, j + 1, k));
            accumulator += retString;
            if (i !== p.tensor.dim[j] - 1) {
              accumulator += print_str(" \\\\ ");
            }
          }
        } else {
          for (let i = 0; i < p.tensor.dim[j]; i++) {
            accumulator += print_expr(p.tensor.elem[k]);
            if (i !== p.tensor.dim[j] - 1) {
              accumulator += print_str(" & ");
            }
            k++;
          }
        }
        if (firstLevel) {
          accumulator += " \\end{bmatrix}";
        }
        return [k, accumulator];
      }
      function print_SUM_latex(p) {
        let accumulator = "\\sum_{";
        accumulator += print_expr(defs_1.caddr(p));
        accumulator += "=";
        accumulator += print_expr(defs_1.cadddr(p));
        accumulator += "}^{";
        accumulator += print_expr(defs_1.caddddr(p));
        accumulator += "}{";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += "}";
        return accumulator;
      }
      function print_SUM_codegen(p) {
        const body = defs_1.cadr(p);
        const variable = defs_1.caddr(p);
        const lowerlimit = defs_1.cadddr(p);
        const upperlimit = defs_1.caddddr(p);
        const accumulator = "(function(){ var " + variable + ";  var holderSum = 0;  var lowerlimit = " + print_expr(lowerlimit) + ";  var upperlimit = " + print_expr(upperlimit) + ";  for (" + variable + " = lowerlimit; " + variable + " < upperlimit; " + variable + "++) {    holderSum += " + print_expr(body) + "; }  return holderSum;})()";
        return accumulator;
      }
      function print_TEST_latex(p) {
        let accumulator = "\\left\\{ \\begin{array}{ll}";
        p = defs_1.cdr(p);
        while (defs_1.iscons(p)) {
          if (defs_1.cdr(p) === defs_1.symbol(defs_1.NIL)) {
            accumulator += "{";
            accumulator += print_expr(defs_1.car(p));
            accumulator += "} & otherwise ";
            accumulator += " \\\\\\\\";
            break;
          }
          accumulator += "{";
          accumulator += print_expr(defs_1.cadr(p));
          accumulator += "} & if & ";
          accumulator += print_expr(defs_1.car(p));
          accumulator += " \\\\\\\\";
          p = defs_1.cddr(p);
        }
        accumulator = accumulator.substring(0, accumulator.length - 4);
        return accumulator += "\\end{array} \\right.";
      }
      function print_TEST_codegen(p) {
        let accumulator = "(function(){";
        p = defs_1.cdr(p);
        let howManyIfs = 0;
        while (defs_1.iscons(p)) {
          if (defs_1.cdr(p) === defs_1.symbol(defs_1.NIL)) {
            accumulator += "else {";
            accumulator += "return (" + print_expr(defs_1.car(p)) + ");";
            accumulator += "}";
            break;
          }
          if (howManyIfs) {
            accumulator += " else ";
          }
          accumulator += "if (" + print_expr(defs_1.car(p)) + "){";
          accumulator += "return (" + print_expr(defs_1.cadr(p)) + ");";
          accumulator += "}";
          howManyIfs++;
          p = defs_1.cddr(p);
        }
        accumulator += "})()";
        return accumulator;
      }
      function print_TESTLT_latex(p) {
        let accumulator = "{";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += "}";
        accumulator += " < ";
        accumulator += "{";
        accumulator += print_expr(defs_1.caddr(p));
        return accumulator += "}";
      }
      function print_TESTLE_latex(p) {
        let accumulator = "{";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += "}";
        accumulator += " \\leq ";
        accumulator += "{";
        accumulator += print_expr(defs_1.caddr(p));
        return accumulator += "}";
      }
      function print_TESTGT_latex(p) {
        let accumulator = "{";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += "}";
        accumulator += " > ";
        accumulator += "{";
        accumulator += print_expr(defs_1.caddr(p));
        return accumulator += "}";
      }
      function print_TESTGE_latex(p) {
        let accumulator = "{";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += "}";
        accumulator += " \\geq ";
        accumulator += "{";
        accumulator += print_expr(defs_1.caddr(p));
        return accumulator += "}";
      }
      function print_TESTEQ_latex(p) {
        let accumulator = "{";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += "}";
        accumulator += " = ";
        accumulator += "{";
        accumulator += print_expr(defs_1.caddr(p));
        return accumulator += "}";
      }
      function print_FOR_codegen(p) {
        const body = defs_1.cadr(p);
        const variable = defs_1.caddr(p);
        const lowerlimit = defs_1.cadddr(p);
        const upperlimit = defs_1.caddddr(p);
        const accumulator = "(function(){ var " + variable + ";  var lowerlimit = " + print_expr(lowerlimit) + ";  var upperlimit = " + print_expr(upperlimit) + ";  for (" + variable + " = lowerlimit; " + variable + " < upperlimit; " + variable + "++) {    " + print_expr(body) + " } })()";
        return accumulator;
      }
      function print_DO_codegen(p) {
        let accumulator = "";
        p = defs_1.cdr(p);
        while (defs_1.iscons(p)) {
          accumulator += print_expr(defs_1.car(p));
          p = defs_1.cdr(p);
        }
        return accumulator;
      }
      function print_SETQ_codegen(p) {
        let accumulator = "";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += " = ";
        accumulator += print_expr(defs_1.caddr(p));
        accumulator += "; ";
        return accumulator;
      }
      function print_PRODUCT_latex(p) {
        let accumulator = "\\prod_{";
        accumulator += print_expr(defs_1.caddr(p));
        accumulator += "=";
        accumulator += print_expr(defs_1.cadddr(p));
        accumulator += "}^{";
        accumulator += print_expr(defs_1.caddddr(p));
        accumulator += "}{";
        accumulator += print_expr(defs_1.cadr(p));
        accumulator += "}";
        return accumulator;
      }
      function print_PRODUCT_codegen(p) {
        const body = defs_1.cadr(p);
        const variable = defs_1.caddr(p);
        const lowerlimit = defs_1.cadddr(p);
        const upperlimit = defs_1.caddddr(p);
        const accumulator = "(function(){ var " + variable + ";  var holderProduct = 1;  var lowerlimit = " + print_expr(lowerlimit) + ";  var upperlimit = " + print_expr(upperlimit) + ";  for (" + variable + " = lowerlimit; " + variable + " < upperlimit; " + variable + "++) {    holderProduct *= " + print_expr(body) + "; }  return holderProduct;})()";
        return accumulator;
      }
      function print_power(base, exponent) {
        let accumulator = "";
        if (defs_1.DEBUG) {
          console.log("power base: " + base + "  exponent: " + exponent);
        }
        if (is_1.isoneovertwo(exponent)) {
          if (is_1.equaln(base, 2)) {
            if (defs_1.defs.codeGen) {
              accumulator += print_str("Math.SQRT2");
              return accumulator;
            }
          } else {
            if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
              accumulator += print_str("\\sqrt{");
              accumulator += print_expr(base);
              accumulator += print_str("}");
              return accumulator;
            } else if (defs_1.defs.codeGen) {
              accumulator += print_str("Math.sqrt(");
              accumulator += print_expr(base);
              accumulator += print_str(")");
              return accumulator;
            }
          }
        }
        if (is_1.equaln(symbol_1.get_binding(defs_1.symbol(defs_1.PRINT_LEAVE_E_ALONE)), 1) && base === defs_1.symbol(defs_1.E)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_str("Math.exp(");
            accumulator += print_expo_of_denom(exponent);
            accumulator += print_str(")");
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str("e^{");
            accumulator += print_expr(exponent);
            accumulator += print_str("}");
          } else {
            accumulator += print_str("exp(");
            accumulator += print_expr(exponent);
            accumulator += print_str(")");
          }
          return accumulator;
        }
        if (defs_1.defs.codeGen) {
          accumulator += print_str("Math.pow(");
          accumulator += print_base_of_denom(base);
          accumulator += print_str(", ");
          accumulator += print_expo_of_denom(exponent);
          accumulator += print_str(")");
          return accumulator;
        }
        if (is_1.equaln(symbol_1.get_binding(defs_1.symbol(defs_1.PRINT_LEAVE_X_ALONE)), 0) || base.printname !== "x") {
          if (base !== defs_1.symbol(defs_1.E)) {
            if (is_1.isminusone(exponent)) {
              if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                accumulator += print_str("\\frac{1}{");
              } else if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                accumulator += print_str("1 / ");
              } else {
                accumulator += print_str("1/");
              }
              if (defs_1.iscons(base) && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                accumulator += print_str("(");
                accumulator += print_expr(base);
                accumulator += print_str(")");
              } else {
                accumulator += print_expr(base);
              }
              if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                accumulator += print_str("}");
              }
              return accumulator;
            }
            if (is_1.isnegativeterm(exponent)) {
              if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                accumulator += print_str("\\frac{1}{");
              } else if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
                accumulator += print_str("1 / ");
              } else {
                accumulator += print_str("1/");
              }
              const newExponent = multiply_1.multiply(exponent, defs_1.Constants.negOne);
              if (defs_1.iscons(base) && defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                accumulator += print_str("(");
                accumulator += print_power(base, newExponent);
                accumulator += print_str(")");
              } else {
                accumulator += print_power(base, newExponent);
              }
              if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                accumulator += print_str("}");
              }
              return accumulator;
            }
          }
          if (is_1.isfraction(exponent) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str("\\sqrt");
            const denomExponent = denominator_1.denominator(exponent);
            if (!is_1.isplustwo(denomExponent)) {
              accumulator += print_str("[");
              accumulator += print_expr(denomExponent);
              accumulator += print_str("]");
            }
            accumulator += print_str("{");
            exponent = numerator_1.numerator(exponent);
            accumulator += print_power(base, exponent);
            accumulator += print_str("}");
            return accumulator;
          }
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX && is_1.isplusone(exponent)) {
          accumulator += print_expr(base);
        } else {
          if (defs_1.isadd(base) || is_1.isnegativenumber(base)) {
            accumulator += print_str("(");
            accumulator += print_expr(base);
            accumulator += print_str(")");
          } else if (defs_1.ismultiply(base) || defs_1.ispower(base)) {
            if (defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
              accumulator += print_str("(");
            }
            accumulator += print_factor(base, true);
            if (defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
              accumulator += print_str(")");
            }
          } else if (defs_1.isNumericAtom(base) && (misc_1.lessp(base, defs_1.Constants.zero) || is_1.isfraction(base))) {
            accumulator += print_str("(");
            accumulator += print_factor(base);
            accumulator += print_str(")");
          } else {
            accumulator += print_factor(base);
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
            accumulator += print_str(power_str);
          } else {
            accumulator += print_str("^");
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            if (print_expr(exponent).length > 1) {
              accumulator += print_str("{");
              accumulator += print_expr(exponent);
              accumulator += print_str("}");
            } else {
              accumulator += print_expr(exponent);
            }
          } else if (defs_1.iscons(exponent) || is_1.isfraction(exponent) || defs_1.isNumericAtom(exponent) && misc_1.lessp(exponent, defs_1.Constants.zero)) {
            accumulator += print_str("(");
            accumulator += print_expr(exponent);
            accumulator += print_str(")");
          } else {
            accumulator += print_factor(exponent);
          }
        }
        return accumulator;
      }
      function print_index_function(p) {
        let accumulator = "";
        p = defs_1.cdr(p);
        if (defs_1.caar(p) === defs_1.symbol(defs_1.ADD) || defs_1.caar(p) === defs_1.symbol(defs_1.MULTIPLY) || defs_1.caar(p) === defs_1.symbol(defs_1.POWER) || defs_1.caar(p) === defs_1.symbol(defs_1.FACTORIAL)) {
          accumulator += print_subexpr(defs_1.car(p));
        } else {
          accumulator += print_expr(defs_1.car(p));
        }
        accumulator += print_str("[");
        p = defs_1.cdr(p);
        if (defs_1.iscons(p)) {
          accumulator += print_expr(defs_1.car(p));
          p = defs_1.cdr(p);
          while (defs_1.iscons(p)) {
            accumulator += print_str(",");
            accumulator += print_expr(defs_1.car(p));
            p = defs_1.cdr(p);
          }
        }
        accumulator += print_str("]");
        return accumulator;
      }
      function print_factor(p, omitParens = false, pastFirstFactor = false) {
        let accumulator = "";
        if (defs_1.isNumericAtom(p)) {
          if (pastFirstFactor && misc_1.lessp(p, defs_1.Constants.zero)) {
            accumulator += "(";
          }
          accumulator += bignum_1.print_number(p, pastFirstFactor);
          if (pastFirstFactor && misc_1.lessp(p, defs_1.Constants.zero)) {
            accumulator += ")";
          }
          return accumulator;
        }
        if (defs_1.isstr(p)) {
          accumulator += print_str('"');
          accumulator += print_str(p.str);
          accumulator += print_str('"');
          return accumulator;
        }
        if (defs_1.istensor(p)) {
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_tensor_latex(p);
          } else {
            accumulator += print_tensor(p);
          }
          return accumulator;
        }
        if (defs_1.ismultiply(p)) {
          if (!omitParens) {
            if (sign_of_term(p) === "-" || defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
              if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                accumulator += print_str(" \\left (");
              } else {
                accumulator += print_str("(");
              }
            }
          }
          accumulator += print_expr(p);
          if (!omitParens) {
            if (sign_of_term(p) === "-" || defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
              if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                accumulator += print_str(" \\right ) ");
              } else {
                accumulator += print_str(")");
              }
            }
          }
          return accumulator;
        } else if (defs_1.isadd(p)) {
          if (!omitParens) {
            accumulator += print_str("(");
          }
          accumulator += print_expr(p);
          if (!omitParens) {
            accumulator += print_str(")");
          }
          return accumulator;
        }
        if (defs_1.ispower(p)) {
          const base = defs_1.cadr(p);
          const exponent = defs_1.caddr(p);
          accumulator += print_power(base, exponent);
          return accumulator;
        }
        if (defs_1.car(p) === defs_1.symbol(defs_1.FUNCTION)) {
          const fbody = defs_1.cadr(p);
          if (!defs_1.defs.codeGen) {
            const parameters = defs_1.caddr(p);
            accumulator += print_str("function ");
            if (defs_1.DEBUG) {
              console.log(`emittedString from print_factor ${defs_1.defs.stringsEmittedByUserPrintouts}`);
            }
            const returned = print_list(parameters);
            accumulator += returned;
            accumulator += print_str(" -> ");
          }
          accumulator += print_expr(fbody);
          return accumulator;
        }
        if (defs_1.car(p) === defs_1.symbol(defs_1.PATTERN)) {
          accumulator += print_expr(defs_1.caadr(p));
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str(" \\rightarrow ");
          } else {
            if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag) {
              accumulator += print_str(" -> ");
            } else {
              accumulator += print_str("->");
            }
          }
          accumulator += print_expr(defs_1.car(defs_1.cdr(defs_1.cadr(p))));
          return accumulator;
        }
        if (defs_1.car(p) === defs_1.symbol(defs_1.INDEX) && defs_1.issymbol(defs_1.cadr(p))) {
          accumulator += print_index_function(p);
          return accumulator;
        }
        if (defs_1.isfactorial(p)) {
          accumulator += print_factorial_function(p);
          return accumulator;
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.ABS) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          accumulator += print_ABS_latex(p);
          return accumulator;
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.SQRT) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          accumulator += print_SQRT_latex(p);
          return accumulator;
        } else if (defs_1.isfactorial(p)) {
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TRANSPOSE_latex(p);
            return accumulator;
          } else if (defs_1.defs.codeGen) {
            accumulator += print_TRANSPOSE_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.UNIT)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_UNIT_codegen(p);
            return accumulator;
          }
        } else if (defs_1.isinv(p)) {
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_INV_latex(p);
            return accumulator;
          } else if (defs_1.defs.codeGen) {
            accumulator += print_INV_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.BINOMIAL) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          accumulator += print_BINOMIAL_latex(p);
          return accumulator;
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.DEFINT) && defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          accumulator += print_DEFINT_latex(p);
          return accumulator;
        } else if (defs_1.isinnerordot(p)) {
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_DOT_latex(p);
            return accumulator;
          } else if (defs_1.defs.codeGen) {
            accumulator += print_DOT_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.SIN)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_SIN_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.COS)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_COS_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.TAN)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_TAN_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.ARCSIN)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_ARCSIN_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.ARCCOS)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_ARCCOS_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.ARCTAN)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_ARCTAN_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.SUM)) {
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_SUM_latex(p);
            return accumulator;
          } else if (defs_1.defs.codeGen) {
            accumulator += print_SUM_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.PRODUCT)) {
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_PRODUCT_latex(p);
            return accumulator;
          } else if (defs_1.defs.codeGen) {
            accumulator += print_PRODUCT_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.FOR)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_FOR_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.DO)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_DO_codegen(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.TEST)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_TEST_codegen(p);
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TEST_latex(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTLT)) {
          if (defs_1.defs.codeGen) {
            accumulator += "((" + print_expr(defs_1.cadr(p)) + ") < (" + print_expr(defs_1.caddr(p)) + "))";
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTLT_latex(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTLE)) {
          if (defs_1.defs.codeGen) {
            accumulator += "((" + print_expr(defs_1.cadr(p)) + ") <= (" + print_expr(defs_1.caddr(p)) + "))";
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTLE_latex(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTGT)) {
          if (defs_1.defs.codeGen) {
            accumulator += "((" + print_expr(defs_1.cadr(p)) + ") > (" + print_expr(defs_1.caddr(p)) + "))";
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTGT_latex(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTGE)) {
          if (defs_1.defs.codeGen) {
            accumulator += "((" + print_expr(defs_1.cadr(p)) + ") >= (" + print_expr(defs_1.caddr(p)) + "))";
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTGE_latex(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.TESTEQ)) {
          if (defs_1.defs.codeGen) {
            accumulator += "((" + print_expr(defs_1.cadr(p)) + ") === (" + print_expr(defs_1.caddr(p)) + "))";
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_TESTEQ_latex(p);
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.FLOOR)) {
          if (defs_1.defs.codeGen) {
            accumulator += "Math.floor(" + print_expr(defs_1.cadr(p)) + ")";
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += " \\lfloor {" + print_expr(defs_1.cadr(p)) + "} \\rfloor ";
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.CEILING)) {
          if (defs_1.defs.codeGen) {
            accumulator += "Math.ceiling(" + print_expr(defs_1.cadr(p)) + ")";
            return accumulator;
          }
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += " \\lceil {" + print_expr(defs_1.cadr(p)) + "} \\rceil ";
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.ROUND)) {
          if (defs_1.defs.codeGen) {
            accumulator += "Math.round(" + print_expr(defs_1.cadr(p)) + ")";
            return accumulator;
          }
        } else if (defs_1.car(p) === defs_1.symbol(defs_1.SETQ)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_SETQ_codegen(p);
            return accumulator;
          } else {
            accumulator += print_expr(defs_1.cadr(p));
            accumulator += print_str("=");
            accumulator += print_expr(defs_1.caddr(p));
            return accumulator;
          }
        }
        if (defs_1.iscons(p)) {
          accumulator += print_factor(defs_1.car(p));
          p = defs_1.cdr(p);
          if (!omitParens) {
            accumulator += print_str("(");
          }
          if (defs_1.iscons(p)) {
            accumulator += print_expr(defs_1.car(p));
            p = defs_1.cdr(p);
            while (defs_1.iscons(p)) {
              accumulator += print_str(",");
              accumulator += print_expr(defs_1.car(p));
              p = defs_1.cdr(p);
            }
          }
          if (!omitParens) {
            accumulator += print_str(")");
          }
          return accumulator;
        }
        if (p === defs_1.symbol(defs_1.DERIVATIVE)) {
          accumulator += print_char("d");
        } else if (p === defs_1.symbol(defs_1.E)) {
          if (defs_1.defs.codeGen) {
            accumulator += print_str("Math.E");
          } else {
            accumulator += print_str("e");
          }
        } else if (p === defs_1.symbol(defs_1.PI)) {
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            accumulator += print_str("\\pi");
          } else {
            accumulator += print_str("pi");
          }
        } else {
          accumulator += print_str(symbol_1.get_printname(p));
        }
        return accumulator;
      }
      function print_list(p) {
        let accumulator = "";
        switch (p.k) {
          case defs_1.CONS:
            accumulator += "(";
            accumulator += print_list(defs_1.car(p));
            if (p === defs_1.cdr(p)) {
              console.log("oh no recursive!");
              defs_1.breakpoint;
            }
            p = defs_1.cdr(p);
            while (defs_1.iscons(p)) {
              accumulator += " ";
              accumulator += print_list(defs_1.car(p));
              p = defs_1.cdr(p);
              if (p === defs_1.cdr(p) && p !== defs_1.symbol(defs_1.NIL)) {
                console.log("oh no recursive!");
                defs_1.breakpoint;
              }
            }
            if (p !== defs_1.symbol(defs_1.NIL)) {
              accumulator += " . ";
              accumulator += print_list(p);
            }
            accumulator += ")";
            break;
          case defs_1.STR:
            accumulator += p.str;
            break;
          case defs_1.NUM:
          case defs_1.DOUBLE:
            accumulator += bignum_1.print_number(p, true);
            break;
          case defs_1.SYM:
            accumulator += symbol_1.get_printname(p);
            break;
          default:
            accumulator += "<tensor>";
        }
        return accumulator;
      }
      exports.print_list = print_list;
      function print_multiply_sign() {
        let accumulator = "";
        if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
          return accumulator;
        }
        if (defs_1.defs.printMode === defs_1.PRINTMODE_HUMAN && !defs_1.defs.test_flag && !defs_1.defs.codeGen) {
          accumulator += print_str(" ");
        } else {
          accumulator += print_str("*");
        }
        return accumulator;
      }
      function is_denominator(p) {
        return defs_1.ispower(p) && defs_1.cadr(p) !== defs_1.symbol(defs_1.E) && is_1.isnegativeterm(defs_1.caddr(p));
      }
      function any_denominators(p) {
        p = defs_1.cdr(p);
        while (defs_1.iscons(p)) {
          const q = defs_1.car(p);
          if (is_denominator(q)) {
            return true;
          }
          p = defs_1.cdr(p);
        }
        return false;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/quotient.js
  var require_quotient = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/quotient.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.divpoly = exports.Eval_quotient = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var coeff_1 = require_coeff();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      function Eval_quotient(p1) {
        const DIVIDEND = eval_1.Eval(defs_1.cadr(p1));
        const DIVISOR = eval_1.Eval(defs_1.caddr(p1));
        let X = eval_1.Eval(defs_1.cadddr(p1));
        if (X === defs_1.symbol(defs_1.NIL)) {
          X = defs_1.symbol(defs_1.SYMBOL_X);
        }
        stack_1.push(divpoly(DIVIDEND, DIVISOR, X));
      }
      exports.Eval_quotient = Eval_quotient;
      function divpoly(DIVIDEND, DIVISOR, X) {
        const dividendCs = coeff_1.coeff(DIVIDEND, X);
        let m = dividendCs.length - 1;
        const divisorCs = coeff_1.coeff(DIVISOR, X);
        const n = divisorCs.length - 1;
        let x = m - n;
        let QUOTIENT = defs_1.Constants.zero;
        while (x >= 0) {
          const Q = multiply_1.divide(dividendCs[m], divisorCs[n]);
          for (let i = 0; i <= n; i++) {
            dividendCs[x + i] = add_1.subtract(dividendCs[x + i], multiply_1.multiply(divisorCs[i], Q));
          }
          QUOTIENT = add_1.add(QUOTIENT, multiply_1.multiply(Q, power_1.power(X, bignum_1.integer(x))));
          m--;
          x--;
        }
        return QUOTIENT;
      }
      exports.divpoly = divpoly;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/rect.js
  var require_rect = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/rect.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.rect = exports.Eval_rect = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var abs_1 = require_abs();
      var add_1 = require_add();
      var arg_1 = require_arg();
      var cos_1 = require_cos();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var sin_1 = require_sin();
      var DEBUG_RECT = false;
      function Eval_rect(p1) {
        const result = rect(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_rect = Eval_rect;
      function rect(p1) {
        const input = p1;
        if (DEBUG_RECT) {
          console.log(`RECT of ${input}`);
          console.log(`any clock forms in : ${input} ? ${find_1.findPossibleClockForm(input, p1)}`);
        }
        if (defs_1.issymbol(p1)) {
          if (DEBUG_RECT) {
            console.log(` rect: simple symbol: ${input}`);
          }
          if (!is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
            return p1;
          }
          return list_1.makeList(defs_1.symbol(defs_1.YYRECT), p1);
        }
        if (!is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES))) && !find_1.findPossibleExponentialForm(p1) && !find_1.findPossibleClockForm(p1, p1) && !(find_1.Find(p1, defs_1.symbol(defs_1.SIN)) && find_1.Find(p1, defs_1.symbol(defs_1.COS)) && find_1.Find(p1, defs_1.Constants.imaginaryunit))) {
          if (DEBUG_RECT) {
            console.log(` rect: simple symbol: ${input}`);
          }
          return p1;
        }
        if (defs_1.ismultiply(p1) && is_1.isimaginaryunit(defs_1.cadr(p1)) && !is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
          return p1;
        }
        if (defs_1.isadd(p1)) {
          if (DEBUG_RECT) {
            console.log(` rect - ${input} is a sum `);
          }
          return p1.tail().reduce((a, b) => add_1.add(a, rect(b)), defs_1.Constants.zero);
        }
        const result = multiply_1.multiply(abs_1.abs(p1), add_1.add(cos_1.cosine(arg_1.arg(p1)), multiply_1.multiply(defs_1.Constants.imaginaryunit, sin_1.sine(arg_1.arg(p1)))));
        if (DEBUG_RECT) {
          console.log(` rect - ${input} is NOT a sum `);
          console.log(` rect - ${input} abs: ${abs_1.abs(p1)}`);
          console.log(` rect - ${input} arg of ${p1} : ${p1}`);
          console.log(` rect - ${input} cosine: ${cos_1.cosine(arg_1.arg(p1))}`);
          console.log(` rect - ${input} sine: ${sin_1.sine(arg_1.arg(p1))}`);
          console.log(` rect - ${input} i * sine: ${multiply_1.multiply(defs_1.Constants.imaginaryunit, sin_1.sine(arg_1.arg(p1)))}`);
          console.log(` rect - ${input} cos + i * sine: ${add_1.add(cos_1.cosine(arg_1.arg(p1)), multiply_1.multiply(defs_1.Constants.imaginaryunit, sin_1.sine(arg_1.arg(p1))))}`);
          console.log(`rect of ${input} : ${result}`);
        }
        return result;
      }
      exports.rect = rect;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/factorpoly.js
  var require_factorpoly = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/factorpoly.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.factorpoly = void 0;
      var lcm_1 = require_lcm();
      var defs_1 = require_defs();
      var find_1 = require_find();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var coeff_1 = require_coeff();
      var condense_1 = require_condense();
      var conj_1 = require_conj();
      var denominator_1 = require_denominator();
      var divisors_1 = require_divisors();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var print_1 = require_print();
      var quotient_1 = require_quotient();
      var rect_1 = require_rect();
      function factorpoly(POLY, X) {
        if (!find_1.Find(POLY, X)) {
          return POLY;
        }
        if (!is_1.ispolyexpandedform(POLY, X)) {
          return POLY;
        }
        if (!defs_1.issymbol(X)) {
          return POLY;
        }
        return yyfactorpoly(POLY, X);
      }
      exports.factorpoly = factorpoly;
      function yyfactorpoly(p1, p2) {
        let p4, p5, p8;
        let prev_expanding;
        if (is_1.isfloating(p1)) {
          run_1.stop("floating point numbers in polynomial");
        }
        const polycoeff = coeff_1.coeff(p1, p2);
        let factpoly_expo = polycoeff.length - 1;
        let p7 = rationalize_coefficients(polycoeff);
        let whichRootsAreWeFinding = "real";
        let remainingPoly = null;
        while (factpoly_expo > 0) {
          var foundComplexRoot, foundRealRoot;
          if (is_1.isZeroAtomOrTensor(polycoeff[0])) {
            p4 = defs_1.Constants.one;
            p5 = defs_1.Constants.zero;
          } else {
            if (whichRootsAreWeFinding === "real") {
              [foundRealRoot, p4, p5] = get_factor_from_real_root(polycoeff, factpoly_expo, p2, p4, p5);
            } else if (whichRootsAreWeFinding === "complex") {
              [foundComplexRoot, p4] = get_factor_from_complex_root(remainingPoly, polycoeff, factpoly_expo);
            }
          }
          if (whichRootsAreWeFinding === "real") {
            if (foundRealRoot === false) {
              whichRootsAreWeFinding = "complex";
              continue;
            } else {
              p8 = add_1.add(multiply_1.multiply(p4, p2), p5);
              if (defs_1.DEBUG) {
                console.log(`success
FACTOR=${p8}`);
              }
              p7 = multiply_1.multiply_noexpand(p7, p8);
              yydivpoly(p4, p5, polycoeff, factpoly_expo);
              while (factpoly_expo && is_1.isZeroAtomOrTensor(polycoeff[factpoly_expo])) {
                factpoly_expo--;
              }
              let temp2 = defs_1.Constants.zero;
              for (let i = 0; i <= factpoly_expo; i++) {
                temp2 = add_1.add(temp2, multiply_1.multiply(polycoeff[i], power_1.power(p2, bignum_1.integer(i))));
              }
              remainingPoly = temp2;
            }
          } else if (whichRootsAreWeFinding === "complex") {
            if (foundComplexRoot === false) {
              break;
            } else {
              const firstFactor = add_1.subtract(p4, p2);
              const secondFactor = add_1.subtract(conj_1.conjugate(p4), p2);
              p8 = multiply_1.multiply(firstFactor, secondFactor);
              if (defs_1.DEBUG) {
                console.log(`success
FACTOR=${p8}`);
              }
              const previousFactorisation = p7;
              p7 = multiply_1.multiply_noexpand(p7, p8);
              if (remainingPoly == null) {
                let temp2 = defs_1.Constants.zero;
                for (let i = 0; i <= factpoly_expo; i++) {
                  temp2 = add_1.add(temp2, multiply_1.multiply(polycoeff[i], power_1.power(p2, bignum_1.integer(i))));
                }
                remainingPoly = temp2;
              }
              const X = p2;
              const divisor = p8;
              const dividend = remainingPoly;
              remainingPoly = quotient_1.divpoly(dividend, divisor, X);
              const checkingTheDivision = multiply_1.multiply(remainingPoly, p8);
              if (!misc_1.equal(checkingTheDivision, dividend)) {
                if (defs_1.DEBUG) {
                  console.log("we found a polynomial based on complex root and its conj but it doesn't divide the poly, quitting");
                  console.log(`so just returning previousFactorisation times dividend: ${previousFactorisation} * ${dividend}`);
                }
                stack_1.push(previousFactorisation);
                const arg2 = defs_1.noexpand(condense_1.yycondense, dividend);
                const arg1 = stack_1.pop();
                return multiply_1.multiply_noexpand(arg1, arg2);
              }
              for (let i = 0; i <= factpoly_expo; i++) {
                polycoeff.pop();
              }
              polycoeff.push(...coeff_1.coeff(remainingPoly, p2));
              factpoly_expo -= 2;
            }
          }
        }
        let temp = defs_1.Constants.zero;
        for (let i = 0; i <= factpoly_expo; i++) {
          temp = add_1.add(temp, multiply_1.multiply(polycoeff[i], power_1.power(p2, bignum_1.integer(i))));
        }
        p1 = temp;
        if (defs_1.DEBUG) {
          console.log(`POLY=${p1}`);
        }
        p1 = defs_1.noexpand(condense_1.yycondense, p1);
        if (factpoly_expo > 0 && is_1.isnegativeterm(polycoeff[factpoly_expo])) {
          p1 = multiply_1.negate(p1);
          p7 = multiply_1.negate_noexpand(p7);
        }
        p7 = multiply_1.multiply_noexpand(p7, p1);
        if (defs_1.DEBUG) {
          console.log(`RESULT=${p7}`);
        }
        return p7;
      }
      function rationalize_coefficients(coefficients) {
        let p7 = defs_1.Constants.one;
        for (const coeff of coefficients) {
          p7 = lcm_1.lcm(denominator_1.denominator(coeff), p7);
        }
        for (let i = 0; i < coefficients.length; i++) {
          coefficients[i] = multiply_1.multiply(p7, coefficients[i]);
        }
        p7 = multiply_1.reciprocate(p7);
        if (defs_1.DEBUG) {
          console.log("rationalize_coefficients result");
        }
        return p7;
      }
      function get_factor_from_real_root(polycoeff, factpoly_expo, p2, p4, p5) {
        let p1, p3, p6;
        if (defs_1.DEBUG) {
          let temp = defs_1.Constants.zero;
          for (let i = 0; i <= factpoly_expo; i++) {
            temp = add_1.add(temp, multiply_1.multiply(polycoeff[i], power_1.power(p2, bignum_1.integer(i))));
          }
          p1 = temp;
          console.log(`POLY=${p1}`);
        }
        const h = defs_1.defs.tos;
        const an = defs_1.defs.tos;
        stack_1.push_all(divisors_1.ydivisors(polycoeff[factpoly_expo]));
        const nan = defs_1.defs.tos - an;
        const a0 = defs_1.defs.tos;
        stack_1.push_all(divisors_1.ydivisors(polycoeff[0]));
        const na0 = defs_1.defs.tos - a0;
        if (defs_1.DEBUG) {
          console.log("divisors of base term");
          for (let i = 0; i < na0; i++) {
            console.log(`, ${defs_1.defs.stack[a0 + i]}`);
          }
          console.log("divisors of leading term");
          for (let i = 0; i < nan; i++) {
            console.log(`, ${defs_1.defs.stack[an + i]}`);
          }
        }
        for (let rootsTries_i = 0; rootsTries_i < nan; rootsTries_i++) {
          for (let rootsTries_j = 0; rootsTries_j < na0; rootsTries_j++) {
            p4 = defs_1.defs.stack[an + rootsTries_i];
            p5 = defs_1.defs.stack[a0 + rootsTries_j];
            p3 = multiply_1.negate(multiply_1.divide(p5, p4));
            [p6] = Evalpoly(p3, polycoeff, factpoly_expo);
            if (defs_1.DEBUG) {
              console.log(`try A=${p4}
, B=${p5}
, root ${p2}
=-B/A=${p3}
, POLY(${p3}
)=${p6}`);
            }
            if (is_1.isZeroAtomOrTensor(p6)) {
              stack_1.moveTos(h);
              if (defs_1.DEBUG) {
                console.log("get_factor_from_real_root returning true");
              }
              return [true, p4, p5];
            }
            p5 = multiply_1.negate(p5);
            p3 = multiply_1.negate(p3);
            [p6] = Evalpoly(p3, polycoeff, factpoly_expo);
            if (defs_1.DEBUG) {
              console.log(`try A=${p4}
, B=${p5}
, root ${p2}
=-B/A=${p3}
, POLY(${p3}
)=${p6}`);
            }
            if (is_1.isZeroAtomOrTensor(p6)) {
              stack_1.moveTos(h);
              if (defs_1.DEBUG) {
                console.log("get_factor_from_real_root returning true");
              }
              return [true, p4, p5];
            }
          }
        }
        stack_1.moveTos(h);
        if (defs_1.DEBUG) {
          console.log("get_factor_from_real_root returning false");
        }
        return [false, p4, p5];
      }
      function get_factor_from_complex_root(remainingPoly, polycoeff, factpoly_expo) {
        let p1, p4, p3, p6;
        if (factpoly_expo <= 2) {
          if (defs_1.DEBUG) {
            console.log("no more factoring via complex roots to be found in polynomial of degree <= 2");
          }
          return [false, p4];
        }
        p1 = remainingPoly;
        if (defs_1.DEBUG) {
          console.log(`complex root finding for POLY=${p1}`);
        }
        const h = defs_1.defs.tos;
        p4 = rect_1.rect(power_1.power(defs_1.Constants.negOne, bignum_1.rational(2, 3)));
        if (defs_1.DEBUG) {
          console.log(`complex root finding: trying with ${p4}`);
        }
        p3 = p4;
        stack_1.push(p3);
        [p6] = Evalpoly(p3, polycoeff, factpoly_expo);
        if (defs_1.DEBUG) {
          console.log(`complex root finding result: ${p6}`);
        }
        if (is_1.isZeroAtomOrTensor(p6)) {
          stack_1.moveTos(h);
          if (defs_1.DEBUG) {
            console.log("get_factor_from_complex_root returning true");
          }
          return [true, p4];
        }
        p4 = rect_1.rect(power_1.power(defs_1.Constants.one, bignum_1.rational(2, 3)));
        if (defs_1.DEBUG) {
          console.log(`complex root finding: trying with ${p4}`);
        }
        p3 = p4;
        stack_1.push(p3);
        [p6] = Evalpoly(p3, polycoeff, factpoly_expo);
        if (defs_1.DEBUG) {
          console.log(`complex root finding result: ${p6}`);
        }
        if (is_1.isZeroAtomOrTensor(p6)) {
          stack_1.moveTos(h);
          if (defs_1.DEBUG) {
            console.log("get_factor_from_complex_root returning true");
          }
          return [true, p4];
        }
        for (let rootsTries_i = -10; rootsTries_i <= 10; rootsTries_i++) {
          for (let rootsTries_j = 1; rootsTries_j <= 5; rootsTries_j++) {
            p4 = rect_1.rect(add_1.add(bignum_1.integer(rootsTries_i), multiply_1.multiply(bignum_1.integer(rootsTries_j), defs_1.Constants.imaginaryunit)));
            const p32 = p4;
            stack_1.push(p32);
            const [p62] = Evalpoly(p32, polycoeff, factpoly_expo);
            if (is_1.isZeroAtomOrTensor(p62)) {
              stack_1.moveTos(h);
              if (defs_1.DEBUG) {
                console.log(`found complex root: ${p62}`);
              }
              return [true, p4];
            }
          }
        }
        stack_1.moveTos(h);
        if (defs_1.DEBUG) {
          console.log("get_factor_from_complex_root returning false");
        }
        return [false, p4];
      }
      function yydivpoly(p4, p5, polycoeff, factpoly_expo) {
        let p6 = defs_1.Constants.zero;
        for (let i = factpoly_expo; i > 0; i--) {
          const divided = multiply_1.divide(polycoeff[i], p4);
          polycoeff[i] = p6;
          p6 = divided;
          polycoeff[i - 1] = add_1.subtract(polycoeff[i - 1], multiply_1.multiply(p6, p5));
        }
        polycoeff[0] = p6;
        if (defs_1.DEBUG) {
          console.log("yydivpoly Q:");
        }
      }
      function Evalpoly(p3, polycoeff, factpoly_expo) {
        let temp = defs_1.Constants.zero;
        for (let i = factpoly_expo; i >= 0; i--) {
          if (defs_1.DEBUG) {
            console.log("Evalpoly top of stack:");
            console.log(print_1.print_list(temp));
          }
          temp = add_1.add(multiply_1.multiply(temp, p3), polycoeff[i]);
        }
        const p6 = temp;
        return [p6];
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/guess.js
  var require_guess = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/guess.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.guess = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      function guess(p) {
        if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_X))) {
          return defs_1.symbol(defs_1.SYMBOL_X);
        } else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Y))) {
          return defs_1.symbol(defs_1.SYMBOL_Y);
        } else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Z))) {
          return defs_1.symbol(defs_1.SYMBOL_Z);
        } else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_T))) {
          return defs_1.symbol(defs_1.SYMBOL_T);
        } else if (find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_S))) {
          return defs_1.symbol(defs_1.SYMBOL_S);
        } else {
          return defs_1.symbol(defs_1.SYMBOL_X);
        }
      }
      exports.guess = guess;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/madd.js
  var require_madd = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/madd.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.msub = exports.madd = void 0;
      function madd(a, b) {
        return a.add(b);
      }
      exports.madd = madd;
      function msub(a, b) {
        return a.subtract(b);
      }
      exports.msub = msub;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/mgcd.js
  var require_mgcd = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/mgcd.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.mgcd = void 0;
      var big_integer_1 = __importDefault(require_BigInteger());
      function mgcd(u, v) {
        return big_integer_1.default.gcd(u, v);
      }
      exports.mgcd = mgcd;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/mmul.js
  var require_mmul = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/mmul.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.mdivrem = exports.mmod = exports.mdiv = exports.mmul = void 0;
      function mmul(a, b) {
        return a.multiply(b);
      }
      exports.mmul = mmul;
      function mdiv(a, b) {
        return a.divide(b);
      }
      exports.mdiv = mdiv;
      function mmod(a, b) {
        return a.mod(b);
      }
      exports.mmod = mmod;
      function mdivrem(a, b) {
        const toReturn = a.divmod(b);
        return [toReturn.quotient, toReturn.remainder];
      }
      exports.mdivrem = mdivrem;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/mprime.js
  var require_mprime = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/mprime.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.mprime = void 0;
      function mprime(n) {
        return n.isProbablePrime();
      }
      exports.mprime = mprime;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/pollard.js
  var require_pollard = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/pollard.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.factor_number = void 0;
      var big_integer_1 = __importDefault(require_BigInteger());
      var defs_1 = require_defs();
      var mcmp_1 = require_mcmp();
      var run_1 = require_run();
      var bignum_1 = require_bignum();
      var is_1 = require_is();
      var list_1 = require_list();
      var madd_1 = require_madd();
      var mgcd_1 = require_mgcd();
      var mmul_1 = require_mmul();
      var mprime_1 = require_mprime();
      var n_factor_number = big_integer_1.default(0);
      function factor_number(p1) {
        if (is_1.equaln(p1, 0) || is_1.equaln(p1, 1) || is_1.equaln(p1, -1)) {
          return p1;
        }
        n_factor_number = p1.q.a;
        const factors = factor_a();
        if (factors.length === 0) {
        }
        if (factors.length === 1) {
          return factors[0];
        }
        if (factors.length > 1) {
          return new defs_1.Cons(defs_1.symbol(defs_1.MULTIPLY), list_1.makeList(...factors));
        }
      }
      exports.factor_number = factor_number;
      function factor_a() {
        const result = [];
        if (n_factor_number.isNegative()) {
          n_factor_number = bignum_1.setSignTo(n_factor_number, 1);
          result.push(defs_1.Constants.negOne);
        }
        for (let k = 0; k < 1e4; k++) {
          result.push(...try_kth_prime(k));
          if (n_factor_number.compare(1) === 0) {
            return result;
          }
        }
        result.push(...factor_b());
        return result;
      }
      function try_kth_prime(k) {
        const result = [];
        let q;
        const d = bignum_1.mint(defs_1.primetab[k]);
        let count = 0;
        while (true) {
          if (n_factor_number.compare(1) === 0) {
            if (count) {
              result.push(_factor(d, count));
            }
            return result;
          }
          let r;
          [q, r] = Array.from(mmul_1.mdivrem(n_factor_number, d));
          if (r.isZero()) {
            count++;
            n_factor_number = q;
          } else {
            break;
          }
        }
        if (count) {
          result.push(_factor(d, count));
        }
        if (mcmp_1.mcmp(q, d) === -1) {
          result.push(_factor(n_factor_number, 1));
          n_factor_number = bignum_1.mint(1);
        }
        return result;
      }
      function factor_b() {
        const result = [];
        const bigint_one = bignum_1.mint(1);
        let x = bignum_1.mint(5);
        let xprime = bignum_1.mint(2);
        let k = 1;
        let l = 1;
        while (true) {
          if (mprime_1.mprime(n_factor_number)) {
            result.push(_factor(n_factor_number, 1));
            return result;
          }
          while (true) {
            if (defs_1.defs.esc_flag) {
              run_1.stop("esc");
            }
            let t = madd_1.msub(xprime, x);
            t = bignum_1.setSignTo(t, 1);
            const g = mgcd_1.mgcd(t, n_factor_number);
            if (defs_1.MEQUAL(g, 1)) {
              if (--k === 0) {
                xprime = x;
                l *= 2;
                k = l;
              }
              t = mmul_1.mmul(x, x);
              x = madd_1.madd(t, bigint_one);
              t = mmul_1.mmod(x, n_factor_number);
              x = t;
              continue;
            }
            result.push(_factor(g, 1));
            if (mcmp_1.mcmp(g, n_factor_number) === 0) {
              return result;
            }
            t = mmul_1.mdiv(n_factor_number, g);
            n_factor_number = t;
            t = mmul_1.mmod(x, n_factor_number);
            x = t;
            t = mmul_1.mmod(xprime, n_factor_number);
            xprime = t;
            break;
          }
        }
      }
      function _factor(d, count) {
        let factor = new defs_1.Num(d);
        if (count > 1) {
          factor = list_1.makeList(defs_1.symbol(defs_1.POWER), factor, new defs_1.Num(bignum_1.mint(count)));
        }
        return factor;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/factor.js
  var require_factor = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/factor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.factor_small_number = exports.factor = exports.Eval_factor = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var factorpoly_1 = require_factorpoly();
      var guess_1 = require_guess();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var pollard_1 = require_pollard();
      function Eval_factor(p1) {
        const top = eval_1.Eval(defs_1.cadr(p1));
        const p2 = eval_1.Eval(defs_1.caddr(p1));
        const variable = p2 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(top) : p2;
        let temp = factor(top, variable);
        p1 = defs_1.cdddr(p1);
        if (defs_1.iscons(p1)) {
          temp = [...p1].reduce((acc, p) => factor_again(acc, eval_1.Eval(p)), temp);
        }
        stack_1.push(temp);
      }
      exports.Eval_factor = Eval_factor;
      function factor_again(p1, p2) {
        if (defs_1.ismultiply(p1)) {
          const arr2 = [];
          p1.tail().forEach((el) => factor_term(arr2, el, p2));
          return multiply_1.multiply_all_noexpand(arr2);
        }
        const arr = [];
        factor_term(arr, p1, p2);
        return arr[0];
      }
      function factor_term(arr, arg1, arg2) {
        const p1 = factorpoly_1.factorpoly(arg1, arg2);
        if (defs_1.ismultiply(p1)) {
          arr.push(...p1.tail());
          return;
        }
        arr.push(p1);
      }
      function factor(p1, p2) {
        if (is_1.isinteger(p1)) {
          return pollard_1.factor_number(p1);
        }
        return factorpoly_1.factorpoly(p1, p2);
      }
      exports.factor = factor;
      function factor_small_number(n) {
        if (isNaN(n)) {
          run_1.stop("number too big to factor");
        }
        const arr = [];
        if (n < 0) {
          n = -n;
        }
        for (let i = 0; i < defs_1.MAXPRIMETAB; i++) {
          const d = defs_1.primetab[i];
          if (d > n / d) {
            break;
          }
          let expo = 0;
          while (n % d === 0) {
            n /= d;
            expo++;
          }
          if (expo) {
            arr.push(bignum_1.integer(d));
            arr.push(bignum_1.integer(expo));
          }
        }
        if (n > 1) {
          arr.push(bignum_1.integer(n));
          arr.push(defs_1.Constants.one);
        }
        return arr;
      }
      exports.factor_small_number = factor_small_number;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/quickfactor.js
  var require_quickfactor = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/quickfactor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.quickpower = exports.quickfactor = void 0;
      var defs_1 = require_defs();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var factor_1 = require_factor();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function quickfactor(BASE, EXPO) {
        const arr = factor_1.factor_small_number(bignum_1.nativeInt(BASE));
        const n = arr.length;
        for (let i = 0; i < n; i += 2) {
          arr.push(...quickpower(arr[i], multiply_1.multiply(arr[i + 1], EXPO)));
        }
        return multiply_1.multiply_all(arr.slice(n));
      }
      exports.quickfactor = quickfactor;
      function quickpower(BASE, EXPO) {
        const p3 = bignum_1.bignum_truncate(EXPO);
        const p4 = add_1.subtract(EXPO, p3);
        let fractionalPart;
        if (!is_1.isZeroAtomOrTensor(p4)) {
          fractionalPart = list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, p4);
        }
        const expo = bignum_1.nativeInt(p3);
        if (isNaN(expo)) {
          const result2 = list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, p3);
          return fractionalPart ? [fractionalPart, result2] : [result2];
        }
        if (expo === 0) {
          return [fractionalPart];
        }
        const result = bignum_1.bignum_power_number(BASE, expo);
        return fractionalPart ? [fractionalPart, result] : [result];
      }
      exports.quickpower = quickpower;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/qpow.js
  var require_qpow = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/qpow.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.qpow = void 0;
      var big_integer_1 = __importDefault(require_BigInteger());
      var defs_1 = require_defs();
      var run_1 = require_run();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var is_1 = require_is();
      var list_1 = require_list();
      var mpow_1 = require_mpow();
      var mroot_1 = require_mroot();
      var multiply_1 = require_multiply();
      var quickfactor_1 = require_quickfactor();
      function qpow(base, expo) {
        return qpowf(base, expo);
      }
      exports.qpow = qpow;
      function qpowf(BASE, EXPO) {
        if (is_1.isplusone(BASE) || is_1.isZeroAtomOrTensor(EXPO)) {
          return defs_1.Constants.one;
        }
        if (is_1.isminusone(BASE) && is_1.isoneovertwo(EXPO)) {
          return defs_1.Constants.imaginaryunit;
        }
        if (is_1.isZeroAtomOrTensor(BASE)) {
          if (is_1.isnegativenumber(EXPO)) {
            run_1.stop("divide by zero");
          }
          return defs_1.Constants.zero;
        }
        if (is_1.isplusone(EXPO)) {
          return BASE;
        }
        let expo = 0;
        let x;
        let y;
        if (is_1.isinteger(EXPO)) {
          expo = bignum_1.nativeInt(EXPO);
          if (isNaN(expo)) {
            return list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, EXPO);
          }
          x = mpow_1.mpow(BASE.q.a, Math.abs(expo));
          y = mpow_1.mpow(BASE.q.b, Math.abs(expo));
          if (expo < 0) {
            const t = x;
            x = y;
            y = t;
            x = bignum_1.makeSignSameAs(x, y);
            y = bignum_1.makePositive(y);
          }
          return new defs_1.Num(x, y);
        }
        if (is_1.isminusone(BASE)) {
          return normalize_angle(EXPO);
        }
        if (is_1.isnegativenumber(BASE)) {
          return multiply_1.multiply(qpow(multiply_1.negate(BASE), EXPO), qpow(defs_1.Constants.negOne, EXPO));
        }
        if (!is_1.isinteger(BASE)) {
          return multiply_1.multiply(qpow(bignum_1.mp_numerator(BASE), EXPO), qpow(bignum_1.mp_denominator(BASE), multiply_1.negate(EXPO)));
        }
        if (is_small_integer(BASE)) {
          return quickfactor_1.quickfactor(BASE, EXPO);
        }
        if (!bignum_1.isSmall(EXPO.q.a) || !bignum_1.isSmall(EXPO.q.b)) {
          return list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, EXPO);
        }
        const { a, b } = EXPO.q;
        x = mroot_1.mroot(BASE.q.a, b.toJSNumber());
        if (x === 0) {
          return list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, EXPO);
        }
        y = mpow_1.mpow(x, a);
        return EXPO.q.a.isNegative() ? new defs_1.Num(big_integer_1.default.one, y) : new defs_1.Num(y);
      }
      function normalize_angle(A) {
        if (is_1.isinteger(A)) {
          if (A.q.a.isOdd()) {
            return defs_1.Constants.negOne;
          } else {
            return defs_1.Constants.one;
          }
        }
        let Q = bignum_1.bignum_truncate(A);
        if (is_1.isnegativenumber(A)) {
          Q = add_1.add(Q, defs_1.Constants.negOne);
        }
        let R = add_1.subtract(A, Q);
        let result = list_1.makeList(defs_1.symbol(defs_1.POWER), defs_1.Constants.negOne, R);
        if (Q.q.a.isOdd()) {
          result = multiply_1.negate(result);
        }
        return result;
      }
      function is_small_integer(p) {
        return bignum_1.isSmall(p.q.a);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/power.js
  var require_power = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/power.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.power = exports.Eval_power = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var misc_1 = require_misc();
      var abs_1 = require_abs();
      var add_1 = require_add();
      var arg_1 = require_arg();
      var bignum_1 = require_bignum();
      var conj_1 = require_conj();
      var cos_1 = require_cos();
      var dpow_1 = require_dpow();
      var eval_1 = require_eval();
      var factorial_1 = require_factorial();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var qpow_1 = require_qpow();
      var rect_1 = require_rect();
      var sin_1 = require_sin();
      var tensor_1 = require_tensor();
      var DEBUG_POWER = false;
      function Eval_power(p1) {
        if (DEBUG_POWER) {
          defs_1.breakpoint;
        }
        const exponent = eval_1.Eval(defs_1.caddr(p1));
        const base = eval_1.Eval(defs_1.cadr(p1));
        stack_1.push(power(base, exponent));
      }
      exports.Eval_power = Eval_power;
      function power(p1, p2) {
        return yypower(p1, p2);
      }
      exports.power = power;
      function yypower(base, exponent) {
        if (DEBUG_POWER) {
          defs_1.breakpoint;
        }
        const inputExp = exponent;
        const inputBase = base;
        if (DEBUG_POWER) {
          console.log(`POWER: ${base} ^ ${exponent}`);
        }
        if (misc_1.equal(base, defs_1.Constants.one) || is_1.isZeroAtomOrTensor(exponent)) {
          const one = defs_1.Constants.One();
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${one}`);
          }
          return one;
        }
        if (misc_1.equal(exponent, defs_1.Constants.one)) {
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${base}`);
          }
          return base;
        }
        if (is_1.isminusone(base) && is_1.isminusone(exponent)) {
          const negOne = multiply_1.negate(defs_1.Constants.One());
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${negOne}`);
          }
          return negOne;
        }
        if (is_1.isminusone(base) && is_1.isoneovertwo(exponent)) {
          const result2 = defs_1.Constants.imaginaryunit;
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (is_1.isminusone(base) && is_1.isminusoneovertwo(exponent)) {
          const result2 = multiply_1.negate(defs_1.Constants.imaginaryunit);
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        let tmp;
        if (is_1.isminusone(base) && !defs_1.isdouble(base) && defs_1.isrational(exponent) && !is_1.isinteger(exponent) && is_1.ispositivenumber(exponent) && !defs_1.defs.evaluatingAsFloats) {
          if (DEBUG_POWER) {
            console.log("   power: -1 ^ rational");
            console.log(` trick: exponent.q.a , exponent.q.b ${exponent.q.a} , ${exponent.q.b}`);
          }
          if (exponent.q.a < exponent.q.b) {
            tmp = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
          } else {
            tmp = list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), base, list_1.makeList(defs_1.symbol(defs_1.POWER), base, bignum_1.rational(exponent.q.a.mod(exponent.q.b), exponent.q.b)));
            if (DEBUG_POWER) {
              console.log(` trick applied : ${tmp}`);
            }
          }
          const result2 = rect_1.rect(tmp);
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (defs_1.isrational(base) && defs_1.isrational(exponent)) {
          if (DEBUG_POWER) {
            console.log("   power: isrational(base) && isrational(exponent)");
          }
          const result2 = qpow_1.qpow(base, exponent);
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (defs_1.isNumericAtom(base) && defs_1.isNumericAtom(exponent)) {
          const result2 = dpow_1.dpow(bignum_1.nativeDouble(base), bignum_1.nativeDouble(exponent));
          if (DEBUG_POWER) {
            console.log("   power: both base and exponent are either rational or double ");
            console.log("POWER - isNumericAtom(base) && isNumericAtom(exponent)");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (defs_1.istensor(base)) {
          const result2 = tensor_1.power_tensor(base, exponent);
          if (DEBUG_POWER) {
            console.log("   power: istensor(base) ");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (defs_1.car(base) === defs_1.symbol(defs_1.ABS) && is_1.iseveninteger(exponent) && !is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
          const result2 = power(defs_1.cadr(base), exponent);
          if (DEBUG_POWER) {
            console.log("   power: even power of absolute of real value ");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (base === defs_1.symbol(defs_1.E) && defs_1.car(exponent) === defs_1.symbol(defs_1.LOG)) {
          const result2 = defs_1.cadr(exponent);
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (base === defs_1.symbol(defs_1.E) && defs_1.isdouble(exponent)) {
          const result2 = bignum_1.double(Math.exp(exponent.d));
          if (DEBUG_POWER) {
            console.log("   power: base == symbol(E) && isdouble(exponent) ");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (base === defs_1.symbol(defs_1.E) && find_1.Find(exponent, defs_1.Constants.imaginaryunit) && find_1.Find(exponent, defs_1.symbol(defs_1.PI)) && !defs_1.defs.evaluatingPolar) {
          let tmp2 = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
          if (DEBUG_POWER) {
            console.log(`   power: turning complex exponential to rect: ${stack_1.top()}`);
          }
          const hopefullySimplified = rect_1.rect(tmp2);
          if (!find_1.Find(hopefullySimplified, defs_1.symbol(defs_1.PI))) {
            if (DEBUG_POWER) {
              console.log(`   power: turned complex exponential to rect: ${hopefullySimplified}`);
            }
            return hopefullySimplified;
          }
        }
        if (defs_1.ismultiply(base) && is_1.isinteger(exponent)) {
          base = defs_1.cdr(base);
          let result2 = power(defs_1.car(base), exponent);
          if (defs_1.iscons(base)) {
            result2 = base.tail().reduce((a, b) => multiply_1.multiply(a, power(b, exponent)), result2);
          }
          if (DEBUG_POWER) {
            console.log("   power: (a * b) ^ c  ->  (a ^ c) * (b ^ c) ");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        let is_a_moreThanZero = false;
        if (defs_1.isNumericAtom(defs_1.cadr(base))) {
          is_a_moreThanZero = misc_1.sign(bignum_1.compare_numbers(defs_1.cadr(base), defs_1.Constants.zero)) > 0;
        }
        if (defs_1.ispower(base) && (is_1.isinteger(exponent) || is_a_moreThanZero)) {
          const result2 = power(defs_1.cadr(base), multiply_1.multiply(defs_1.caddr(base), exponent));
          if (DEBUG_POWER) {
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        let b_isEven_and_c_isItsInverse = false;
        if (is_1.iseveninteger(defs_1.caddr(base))) {
          const isThisOne = multiply_1.multiply(defs_1.caddr(base), exponent);
          if (is_1.isone(isThisOne)) {
            b_isEven_and_c_isItsInverse = true;
          }
        }
        if (defs_1.ispower(base) && b_isEven_and_c_isItsInverse) {
          const result2 = abs_1.abs(defs_1.cadr(base));
          if (DEBUG_POWER) {
            console.log("   power: car(base) == symbol(POWER) && b_isEven_and_c_isItsInverse ");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (defs_1.defs.expanding && defs_1.isadd(base) && defs_1.isNumericAtom(exponent)) {
          const n = bignum_1.nativeInt(exponent);
          if (n > 1 && !isNaN(n)) {
            if (DEBUG_POWER) {
              console.log("   power: expanding && isadd(base) && isNumericAtom(exponent) ");
            }
            let result2 = power_sum(n, base);
            if (DEBUG_POWER) {
              console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
            }
            return result2;
          }
        }
        if (defs_1.defs.trigmode === 1 && defs_1.car(base) === defs_1.symbol(defs_1.SIN) && is_1.iseveninteger(exponent)) {
          const result2 = power(add_1.subtract(defs_1.Constants.one, power(cos_1.cosine(defs_1.cadr(base)), bignum_1.integer(2))), multiply_1.multiply(exponent, bignum_1.rational(1, 2)));
          if (DEBUG_POWER) {
            console.log("   power: trigmode == 1 && car(base) == symbol(SIN) && iseveninteger(exponent) ");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (defs_1.defs.trigmode === 2 && defs_1.car(base) === defs_1.symbol(defs_1.COS) && is_1.iseveninteger(exponent)) {
          const result2 = power(add_1.subtract(defs_1.Constants.one, power(sin_1.sine(defs_1.cadr(base)), bignum_1.integer(2))), multiply_1.multiply(exponent, bignum_1.rational(1, 2)));
          if (DEBUG_POWER) {
            console.log("   power: trigmode == 2 && car(base) == symbol(COS) && iseveninteger(exponent) ");
            console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
          }
          return result2;
        }
        if (is_1.iscomplexnumber(base)) {
          if (DEBUG_POWER) {
            console.log(" power - handling the case (a + ib) ^ n");
          }
          if (is_1.isinteger(exponent)) {
            const p3 = conj_1.conjugate(base);
            let result2 = multiply_1.divide(p3, multiply_1.multiply(p3, base));
            if (!is_1.isone(exponent)) {
              result2 = power(result2, multiply_1.negate(exponent));
            }
            if (DEBUG_POWER) {
              console.log(`   power of ${inputBase} ^ ${inputExp}: ${result2}`);
            }
            return result2;
          }
          if (defs_1.isNumericAtom(exponent)) {
            const pi = defs_1.defs.evaluatingAsFloats || is_1.iscomplexnumberdouble(base) && defs_1.isdouble(exponent) ? bignum_1.double(Math.PI) : defs_1.symbol(defs_1.PI);
            let tmp2 = multiply_1.multiply(power(abs_1.abs(base), exponent), power(defs_1.Constants.negOne, multiply_1.divide(multiply_1.multiply(arg_1.arg(base), exponent), pi)));
            if (defs_1.avoidCalculatingPowersIntoArctans && find_1.Find(tmp2, defs_1.symbol(defs_1.ARCTAN))) {
              tmp2 = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
            }
            if (DEBUG_POWER) {
              console.log(`   power of ${inputBase} ^ ${inputExp}: ${tmp2}`);
            }
            return tmp2;
          }
        }
        const polarResult = simplify_polar(exponent);
        if (polarResult !== void 0) {
          if (DEBUG_POWER) {
            console.log("   power: using simplify_polar");
          }
          return polarResult;
        }
        const result = list_1.makeList(defs_1.symbol(defs_1.POWER), base, exponent);
        if (DEBUG_POWER) {
          console.log("   power: nothing can be done ");
          console.log(`   power of ${inputBase} ^ ${inputExp}: ${result}`);
        }
        return result;
      }
      function power_sum(n, p1) {
        const a = [];
        const k = misc_1.length(p1) - 1;
        const powers = [];
        p1 = defs_1.cdr(p1);
        for (let i = 0; i < k; i++) {
          for (let j = 0; j <= n; j++) {
            powers[i * (n + 1) + j] = power(defs_1.car(p1), bignum_1.integer(j));
          }
          p1 = defs_1.cdr(p1);
        }
        p1 = factorial_1.factorial(bignum_1.integer(n));
        for (let i = 0; i < k; i++) {
          a[i] = 0;
        }
        return multinomial_sum(k, n, a, 0, n, powers, p1, defs_1.Constants.zero);
      }
      function multinomial_sum(k, n, a, i, m, A, p1, p2) {
        if (i < k - 1) {
          for (let j = 0; j <= m; j++) {
            a[i] = j;
            p2 = multinomial_sum(k, n, a, i + 1, m - j, A, p1, p2);
          }
          return p2;
        }
        a[i] = m;
        let temp = p1;
        for (let j = 0; j < k; j++) {
          temp = multiply_1.divide(temp, factorial_1.factorial(bignum_1.integer(a[j])));
        }
        for (let j = 0; j < k; j++) {
          temp = multiply_1.multiply(temp, A[j * (n + 1) + a[j]]);
        }
        return add_1.add(p2, temp);
      }
      function simplify_polar(exponent) {
        let n = is_1.isquarterturn(exponent);
        switch (n) {
          case 0:
            break;
          case 1:
            return defs_1.Constants.one;
          case 2:
            return defs_1.Constants.negOne;
          case 3:
            return defs_1.Constants.imaginaryunit;
          case 4:
            return multiply_1.negate(defs_1.Constants.imaginaryunit);
        }
        if (defs_1.isadd(exponent)) {
          let p3 = defs_1.cdr(exponent);
          while (defs_1.iscons(p3)) {
            n = is_1.isquarterturn(defs_1.car(p3));
            if (n) {
              break;
            }
            p3 = defs_1.cdr(p3);
          }
          let arg1;
          switch (n) {
            case 0:
              return void 0;
            case 1:
              arg1 = defs_1.Constants.one;
              break;
            case 2:
              arg1 = defs_1.Constants.negOne;
              break;
            case 3:
              arg1 = defs_1.Constants.imaginaryunit;
              break;
            case 4:
              arg1 = multiply_1.negate(defs_1.Constants.imaginaryunit);
              break;
          }
          return multiply_1.multiply(arg1, misc_1.exponential(add_1.subtract(exponent, defs_1.car(p3))));
        }
        return void 0;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/multiply.js
  var require_multiply = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/multiply.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.negate_noexpand = exports.negate = exports.reciprocate = exports.inverse = exports.divide = exports.multiply_all_noexpand = exports.multiply_all = exports.multiply_noexpand = exports.multiply = exports.Eval_multiply = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var power_1 = require_power();
      var tensor_1 = require_tensor();
      var otherCFunctions_1 = require_otherCFunctions();
      function Eval_multiply(p1) {
        let temp = eval_1.Eval(defs_1.cadr(p1));
        p1 = defs_1.cddr(p1);
        if (defs_1.iscons(p1)) {
          temp = [...p1].reduce((acc, p) => multiply(acc, eval_1.Eval(p)), temp);
        }
        stack_1.push(temp);
      }
      exports.Eval_multiply = Eval_multiply;
      function multiply(arg1, arg2) {
        if (defs_1.defs.esc_flag) {
          run_1.stop("escape key stop");
        }
        if (defs_1.isNumericAtom(arg1) && defs_1.isNumericAtom(arg2)) {
          return bignum_1.multiply_numbers(arg1, arg2);
        }
        return yymultiply(arg1, arg2);
      }
      exports.multiply = multiply;
      function yymultiply(p1, p2) {
        const h = defs_1.defs.tos;
        if (is_1.isZeroAtom(p1) || is_1.isZeroAtom(p2)) {
          return defs_1.Constants.Zero();
        }
        if (defs_1.defs.expanding && defs_1.isadd(p1)) {
          return p1.tail().reduce((a, b) => add_1.add(a, multiply(b, p2)), defs_1.Constants.Zero());
        }
        if (defs_1.defs.expanding && defs_1.isadd(p2)) {
          return p2.tail().reduce((a, b) => add_1.add(a, multiply(p1, b)), defs_1.Constants.Zero());
        }
        if (!defs_1.istensor(p1) && defs_1.istensor(p2)) {
          return tensor_1.scalar_times_tensor(p1, p2);
        }
        if (defs_1.istensor(p1) && !defs_1.istensor(p2)) {
          return tensor_1.tensor_times_scalar(p1, p2);
        }
        p1 = defs_1.ismultiply(p1) ? defs_1.cdr(p1) : list_1.makeList(p1);
        p2 = defs_1.ismultiply(p2) ? defs_1.cdr(p2) : list_1.makeList(p2);
        if (defs_1.isNumericAtom(defs_1.car(p1)) && defs_1.isNumericAtom(defs_1.car(p2))) {
          const arg1 = defs_1.car(p1);
          const arg2 = defs_1.car(p2);
          stack_1.push(bignum_1.multiply_numbers(arg1, arg2));
          p1 = defs_1.cdr(p1);
          p2 = defs_1.cdr(p2);
        } else if (defs_1.isNumericAtom(defs_1.car(p1))) {
          stack_1.push(defs_1.car(p1));
          p1 = defs_1.cdr(p1);
        } else if (defs_1.isNumericAtom(defs_1.car(p2))) {
          stack_1.push(defs_1.car(p2));
          p2 = defs_1.cdr(p2);
        } else {
          stack_1.push(defs_1.Constants.One());
        }
        let [p3, p5] = parse_p1(p1);
        let [p4, p6] = parse_p2(p2);
        while (defs_1.iscons(p1) && defs_1.iscons(p2)) {
          if (defs_1.caar(p1) === defs_1.symbol(defs_1.OPERATOR) && defs_1.caar(p2) === defs_1.symbol(defs_1.OPERATOR)) {
            stack_1.push(new defs_1.Cons(defs_1.symbol(defs_1.OPERATOR), otherCFunctions_1.append(defs_1.cdar(p1), defs_1.cdar(p2))));
            p1 = defs_1.cdr(p1);
            p2 = defs_1.cdr(p2);
            [p3, p5] = parse_p1(p1);
            [p4, p6] = parse_p2(p2);
            continue;
          }
          switch (misc_1.cmp_expr(p3, p4)) {
            case -1:
              stack_1.push(defs_1.car(p1));
              p1 = defs_1.cdr(p1);
              [p3, p5] = parse_p1(p1);
              break;
            case 1:
              stack_1.push(defs_1.car(p2));
              p2 = defs_1.cdr(p2);
              [p4, p6] = parse_p2(p2);
              break;
            case 0:
              combine_factors(h, p4, p5, p6);
              p1 = defs_1.cdr(p1);
              p2 = defs_1.cdr(p2);
              [p3, p5] = parse_p1(p1);
              [p4, p6] = parse_p2(p2);
              break;
            default:
              run_1.stop("internal error 2");
          }
        }
        const remaining = [];
        if (defs_1.iscons(p1)) {
          remaining.push(...p1);
        }
        if (defs_1.iscons(p2)) {
          remaining.push(...p2);
        }
        stack_1.push_all(remaining);
        __normalize_radical_factors(h);
        if (defs_1.defs.expanding) {
          for (let i = h; i < defs_1.defs.tos; i++) {
            if (defs_1.isadd(defs_1.defs.stack[i])) {
              const arr = stack_1.pop_n_items(defs_1.defs.tos - h);
              return multiply_all(arr);
            }
          }
        }
        const n = defs_1.defs.tos - h;
        if (n === 1) {
          return stack_1.pop();
        }
        if (defs_1.isrational(defs_1.defs.stack[h]) && is_1.equaln(defs_1.defs.stack[h], 1)) {
          if (n === 2) {
            const p72 = stack_1.pop();
            stack_1.pop();
            return p72;
          } else {
            defs_1.defs.stack[h] = defs_1.symbol(defs_1.MULTIPLY);
            list_1.list(n);
            return stack_1.pop();
          }
        }
        list_1.list(n);
        const p7 = stack_1.pop();
        return new defs_1.Cons(defs_1.symbol(defs_1.MULTIPLY), p7);
      }
      function parse_p1(p1) {
        let p3 = defs_1.car(p1);
        let p5 = defs_1.Constants.One();
        if (defs_1.ispower(p3)) {
          p5 = defs_1.caddr(p3);
          p3 = defs_1.cadr(p3);
        }
        return [p3, p5];
      }
      function parse_p2(p2) {
        let p4 = defs_1.car(p2);
        let p6 = defs_1.Constants.One();
        if (defs_1.ispower(p4)) {
          p6 = defs_1.caddr(p4);
          p4 = defs_1.cadr(p4);
        }
        return [p4, p6];
      }
      function combine_factors(h, p4, p5, p6) {
        let p7 = power_1.power(p4, add_1.add(p5, p6));
        if (defs_1.isNumericAtom(p7)) {
          defs_1.defs.stack[h] = bignum_1.multiply_numbers(defs_1.defs.stack[h], p7);
        } else if (defs_1.ismultiply(p7)) {
          if (defs_1.isNumericAtom(defs_1.cadr(p7)) && defs_1.cdddr(p7) === defs_1.symbol(defs_1.NIL)) {
            const arg1 = defs_1.defs.stack[h];
            const arg2 = defs_1.cadr(p7);
            defs_1.defs.stack[h] = bignum_1.multiply_numbers(arg1, arg2);
            stack_1.push(defs_1.caddr(p7));
          } else {
            stack_1.push(p7);
          }
        } else {
          stack_1.push(p7);
        }
      }
      function multiply_noexpand(arg1, arg2) {
        return defs_1.noexpand(multiply, arg1, arg2);
      }
      exports.multiply_noexpand = multiply_noexpand;
      function multiply_all(n) {
        if (n.length === 1) {
          return n[0];
        }
        if (n.length === 0) {
          return defs_1.Constants.One();
        }
        let temp = n[0];
        for (let i = 1; i < n.length; i++) {
          temp = multiply(temp, n[i]);
        }
        return temp;
      }
      exports.multiply_all = multiply_all;
      function multiply_all_noexpand(arr) {
        return defs_1.noexpand(multiply_all, arr);
      }
      exports.multiply_all_noexpand = multiply_all_noexpand;
      function divide(p1, p2) {
        if (defs_1.isNumericAtom(p1) && defs_1.isNumericAtom(p2)) {
          return bignum_1.divide_numbers(p1, p2);
        } else {
          return multiply(p1, inverse(p2));
        }
      }
      exports.divide = divide;
      function inverse(p1) {
        if (defs_1.isNumericAtom(p1)) {
          return bignum_1.invert_number(p1);
        } else {
          return power_1.power(p1, defs_1.Constants.negOne);
        }
      }
      exports.inverse = inverse;
      function reciprocate(p1) {
        return inverse(p1);
      }
      exports.reciprocate = reciprocate;
      function negate(p1) {
        if (defs_1.isNumericAtom(p1)) {
          return bignum_1.negate_number(p1);
        } else {
          return multiply(p1, defs_1.Constants.NegOne());
        }
      }
      exports.negate = negate;
      function negate_noexpand(p1) {
        return defs_1.noexpand(negate, p1);
      }
      exports.negate_noexpand = negate_noexpand;
      function __normalize_radical_factors(h) {
        let i = 0;
        if (is_1.isplusone(defs_1.defs.stack[h]) || is_1.isminusone(defs_1.defs.stack[h]) || defs_1.isdouble(defs_1.defs.stack[h])) {
          return;
        }
        for (i = h + 1; i < defs_1.defs.tos; i++) {
          if (__is_radical_number(defs_1.defs.stack[i])) {
            break;
          }
        }
        if (i === defs_1.defs.tos) {
          return;
        }
        let A = bignum_1.mp_numerator(defs_1.defs.stack[h]);
        for (let i2 = h + 1; i2 < defs_1.defs.tos; i2++) {
          if (is_1.isplusone(A) || is_1.isminusone(A)) {
            break;
          }
          if (!__is_radical_number(defs_1.defs.stack[i2])) {
            continue;
          }
          const BASE = defs_1.cadr(defs_1.defs.stack[i2]);
          const EXPO = defs_1.caddr(defs_1.defs.stack[i2]);
          if (!is_1.isnegativenumber(EXPO)) {
            continue;
          }
          const TMP = divide(A, BASE);
          if (!is_1.isinteger(TMP)) {
            continue;
          }
          A = TMP;
          defs_1.defs.stack[i2] = list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, add_1.add(defs_1.Constants.One(), EXPO));
        }
        let B = bignum_1.mp_denominator(defs_1.defs.stack[h]);
        for (let i2 = h + 1; i2 < defs_1.defs.tos; i2++) {
          if (is_1.isplusone(B)) {
            break;
          }
          if (!__is_radical_number(defs_1.defs.stack[i2])) {
            continue;
          }
          const BASE = defs_1.cadr(defs_1.defs.stack[i2]);
          const EXPO = defs_1.caddr(defs_1.defs.stack[i2]);
          if (is_1.isnegativenumber(EXPO)) {
            continue;
          }
          const TMP = divide(B, BASE);
          if (!is_1.isinteger(TMP)) {
            continue;
          }
          B = TMP;
          const subtracted = add_1.subtract(EXPO, defs_1.Constants.one);
          if (defs_1.dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication) {
            if (is_1.isinteger(BASE) && !is_1.isinteger(subtracted) && is_1.isnegativenumber(subtracted)) {
              A = divide(A, BASE);
              break;
            }
          }
          defs_1.defs.stack[i2] = list_1.makeList(defs_1.symbol(defs_1.POWER), BASE, subtracted);
        }
        defs_1.defs.stack[h] = divide(A, B);
      }
      function __is_radical_number(p) {
        return defs_1.ispower(p) && defs_1.isNumericAtom(defs_1.cadr(p)) && is_1.isfraction(defs_1.caddr(p)) && !is_1.isminusone(defs_1.cadr(p));
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/denominator.js
  var require_denominator = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/denominator.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.denominator = exports.Eval_denominator = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var rationalize_1 = require_rationalize();
      function Eval_denominator(p1) {
        const result = denominator(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_denominator = Eval_denominator;
      function denominator(p1) {
        if (defs_1.isadd(p1)) {
          p1 = rationalize_1.rationalize(p1);
        }
        if (defs_1.ismultiply(p1) && !is_1.isplusone(defs_1.car(defs_1.cdr(p1)))) {
          return multiply_1.multiply_all(p1.tail().map(denominator));
        }
        if (defs_1.isrational(p1)) {
          return bignum_1.mp_denominator(p1);
        }
        if (defs_1.ispower(p1) && is_1.isnegativeterm(defs_1.caddr(p1))) {
          return multiply_1.reciprocate(p1);
        }
        return defs_1.Constants.one;
      }
      exports.denominator = denominator;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/arctan.js
  var require_arctan = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/arctan.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.arctan = exports.Eval_arctan = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var bignum_1 = require_bignum();
      var denominator_1 = require_denominator();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var numerator_1 = require_numerator();
      function Eval_arctan(x) {
        stack_1.push(arctan(eval_1.Eval(defs_1.cadr(x))));
      }
      exports.Eval_arctan = Eval_arctan;
      function arctan(x) {
        if (defs_1.car(x) === defs_1.symbol(defs_1.TAN)) {
          return defs_1.cadr(x);
        }
        if (defs_1.isdouble(x)) {
          return bignum_1.double(Math.atan(x.d));
        }
        if (is_1.isZeroAtomOrTensor(x)) {
          return defs_1.Constants.zero;
        }
        if (is_1.isnegative(x)) {
          return multiply_1.negate(arctan(multiply_1.negate(x)));
        }
        if (find_1.Find(x, defs_1.symbol(defs_1.SIN)) && find_1.Find(x, defs_1.symbol(defs_1.COS))) {
          const p2 = numerator_1.numerator(x);
          const p3 = denominator_1.denominator(x);
          if (defs_1.car(p2) === defs_1.symbol(defs_1.SIN) && defs_1.car(p3) === defs_1.symbol(defs_1.COS) && misc_1.equal(defs_1.cadr(p2), defs_1.cadr(p3))) {
            return defs_1.cadr(p2);
          }
        }
        if (defs_1.ispower(x) && is_1.equaln(defs_1.cadr(x), 3) && is_1.equalq(defs_1.caddr(x), -1, 2) || defs_1.ismultiply(x) && is_1.equalq(defs_1.car(defs_1.cdr(x)), 1, 3) && defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(x)))) === defs_1.symbol(defs_1.POWER) && is_1.equaln(defs_1.car(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x))))), 3) && is_1.equalq(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x)))))), 1, 2)) {
          return multiply_1.multiply(bignum_1.rational(1, 6), defs_1.Constants.Pi());
        }
        if (is_1.equaln(x, 1)) {
          return multiply_1.multiply(bignum_1.rational(1, 4), defs_1.Constants.Pi());
        }
        if (defs_1.ispower(x) && is_1.equaln(defs_1.cadr(x), 3) && is_1.equalq(defs_1.caddr(x), 1, 2)) {
          return multiply_1.multiply(bignum_1.rational(1, 3), defs_1.Constants.Pi());
        }
        return list_1.makeList(defs_1.symbol(defs_1.ARCTAN), x);
      }
      exports.arctan = arctan;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/imag.js
  var require_imag = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/imag.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.imag = exports.Eval_imag = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var conj_1 = require_conj();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      var rect_1 = require_rect();
      var DEBUG_IMAG = false;
      function Eval_imag(p1) {
        const result = imag(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_imag = Eval_imag;
      function imag(p) {
        const p1 = rect_1.rect(p);
        const conj = conj_1.conjugate(p1);
        const arg1 = multiply_1.divide(add_1.subtract(p1, conj), bignum_1.integer(2));
        const result = multiply_1.divide(arg1, defs_1.Constants.imaginaryunit);
        if (DEBUG_IMAG) {
          console.log(`IMAGE of ${p1}`);
          console.log(` image: conjugate result: ${conj}`);
          console.log(` image: 1st divide result: ${arg1}`);
          console.log(` image: 2nd divide result: ${result}`);
        }
        return result;
      }
      exports.imag = imag;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/real.js
  var require_real = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/real.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.real = exports.Eval_real = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var conj_1 = require_conj();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      var rect_1 = require_rect();
      function Eval_real(p1) {
        const result = real(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_real = Eval_real;
      function real(p) {
        const p1 = rect_1.rect(p);
        return multiply_1.divide(add_1.add(p1, conj_1.conjugate(p1)), bignum_1.integer(2));
      }
      exports.real = real;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/arg.js
  var require_arg = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/arg.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.arg = exports.Eval_arg = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var add_1 = require_add();
      var arctan_1 = require_arctan();
      var denominator_1 = require_denominator();
      var eval_1 = require_eval();
      var imag_1 = require_imag();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var numerator_1 = require_numerator();
      var real_1 = require_real();
      var rect_1 = require_rect();
      var DEBUG_ARG = false;
      function Eval_arg(z) {
        stack_1.push(arg(eval_1.Eval(defs_1.cadr(z))));
      }
      exports.Eval_arg = Eval_arg;
      function arg(z) {
        return add_1.subtract(yyarg(numerator_1.numerator(z)), yyarg(denominator_1.denominator(z)));
      }
      exports.arg = arg;
      function yyarg(p1) {
        if (is_1.ispositivenumber(p1) || p1 === defs_1.symbol(defs_1.PI)) {
          return defs_1.isdouble(p1) || defs_1.defs.evaluatingAsFloats ? defs_1.Constants.zeroAsDouble : defs_1.Constants.zero;
        }
        if (is_1.isnegativenumber(p1)) {
          const pi = defs_1.isdouble(p1) || defs_1.defs.evaluatingAsFloats ? defs_1.Constants.piAsDouble : defs_1.symbol(defs_1.PI);
          return multiply_1.negate(pi);
        }
        if (defs_1.issymbol(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.ARG), p1);
        }
        if (defs_1.ispower(p1) && is_1.equaln(defs_1.cadr(p1), -1)) {
          return multiply_1.multiply(defs_1.Constants.Pi(), defs_1.caddr(p1));
        }
        if (defs_1.ispower(p1) && defs_1.cadr(p1) === defs_1.symbol(defs_1.E)) {
          return imag_1.imag(defs_1.caddr(p1));
        }
        if (defs_1.ispower(p1) && is_1.isoneovertwo(defs_1.caddr(p1))) {
          const arg1 = arg(defs_1.cadr(p1));
          if (DEBUG_ARG) {
            console.log(`arg of a sqrt: ${p1}`);
            defs_1.breakpoint;
            console.log(` = 1/2 * ${arg1}`);
          }
          return multiply_1.multiply(arg1, defs_1.caddr(p1));
        }
        if (defs_1.ismultiply(p1)) {
          return p1.tail().map(arg).reduce(add_1.add, defs_1.Constants.zero);
        }
        if (defs_1.isadd(p1)) {
          p1 = rect_1.rect(p1);
          const RE = real_1.real(p1);
          const IM = imag_1.imag(p1);
          if (is_1.isZeroAtomOrTensor(RE)) {
            if (is_1.isnegative(IM)) {
              return multiply_1.negate(defs_1.Constants.Pi());
            } else {
              return defs_1.Constants.Pi();
            }
          } else {
            const arg1 = arctan_1.arctan(multiply_1.divide(IM, RE));
            if (is_1.isnegative(RE)) {
              if (is_1.isnegative(IM)) {
                return add_1.subtract(arg1, defs_1.Constants.Pi());
              } else {
                return add_1.add(arg1, defs_1.Constants.Pi());
              }
            }
            return arg1;
          }
        }
        if (!is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.ASSUME_REAL_VARIABLES)))) {
          return defs_1.Constants.zero;
        }
        return list_1.makeList(defs_1.symbol(defs_1.ARG), p1);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/clock.js
  var require_clock = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/clock.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.clockform = exports.Eval_clock = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var abs_1 = require_abs();
      var arg_1 = require_arg();
      var eval_1 = require_eval();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var DEBUG_CLOCKFORM = false;
      function Eval_clock(p1) {
        const result = clockform(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_clock = Eval_clock;
      function clockform(p1) {
        const l = list_1.makeList(defs_1.symbol(defs_1.POWER), defs_1.Constants.negOne, multiply_1.divide(arg_1.arg(p1), defs_1.Constants.Pi()));
        const multiplied = multiply_1.multiply(abs_1.abs(p1), l);
        if (DEBUG_CLOCKFORM) {
          console.log(`clockform: abs of ${p1} : ${abs_1.abs(p1)}`);
          console.log(`clockform: arg of ${p1} : ${arg_1.arg(p1)}`);
          console.log(`clockform: divide : ${multiply_1.divide(arg_1.arg(p1), defs_1.Constants.Pi())}`);
          console.log(`clockform: power : ${l}`);
          console.log(`clockform: multiply : ${multiplied}`);
        }
        return multiplied;
      }
      exports.clockform = clockform;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/polar.js
  var require_polar = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/polar.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.polar = exports.Eval_polar = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var abs_1 = require_abs();
      var arg_1 = require_arg();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      function Eval_polar(p1) {
        const result = polar(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_polar = Eval_polar;
      function polar(p1) {
        return defs_1.evalPolar(() => {
          return multiply_1.multiply(abs_1.abs(p1), misc_1.exponential(multiply_1.multiply(defs_1.Constants.imaginaryunit, arg_1.arg(p1))));
        });
      }
      exports.polar = polar;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/conj.js
  var require_conj = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/conj.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.conjugate = exports.Eval_conj = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var stack_1 = require_stack();
      var clock_1 = require_clock();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      var polar_1 = require_polar();
      var subst_1 = require_subst();
      function Eval_conj(p1) {
        p1 = eval_1.Eval(defs_1.cadr(p1));
        if (!find_1.Find(p1, defs_1.Constants.imaginaryunit)) {
          stack_1.push(clock_1.clockform(conjugate(polar_1.polar(p1))));
        } else {
          stack_1.push(conjugate(p1));
        }
      }
      exports.Eval_conj = Eval_conj;
      function conjugate(p1) {
        return eval_1.Eval(subst_1.subst(p1, defs_1.Constants.imaginaryunit, multiply_1.negate(defs_1.Constants.imaginaryunit)));
      }
      exports.conjugate = conjugate;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/float.js
  var require_float = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/float.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.yyfloat = exports.zzfloat = exports.Eval_float = void 0;
      var count_1 = require_count();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var list_1 = require_list();
      var tensor_1 = require_tensor();
      function Eval_float(p1) {
        defs_1.evalFloats(() => {
          const result = eval_1.Eval(yyfloat(eval_1.Eval(defs_1.cadr(p1))));
          stack_1.push(result);
        });
      }
      exports.Eval_float = Eval_float;
      function zzfloat(p1) {
        return defs_1.evalFloats(() => eval_1.Eval(yyfloat(eval_1.Eval(p1))));
      }
      exports.zzfloat = zzfloat;
      function yyfloat(p1) {
        return defs_1.evalFloats(yyfloat_, p1);
      }
      exports.yyfloat = yyfloat;
      function yyfloat_(p1) {
        if (defs_1.iscons(p1)) {
          return list_1.makeList(...p1.map(yyfloat_));
        }
        if (defs_1.istensor(p1)) {
          p1 = tensor_1.copy_tensor(p1);
          p1.tensor.elem = p1.tensor.elem.map(yyfloat_);
          return p1;
        }
        if (defs_1.isrational(p1)) {
          return bignum_1.bignum_float(p1);
        }
        if (p1 === defs_1.symbol(defs_1.PI)) {
          return defs_1.Constants.piAsDouble;
        }
        if (p1 === defs_1.symbol(defs_1.E)) {
          return bignum_1.double(Math.E);
        }
        return p1;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/det.js
  var require_det = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/det.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.determinant = exports.det = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      function det(p1) {
        if (!tensor_1.is_square_matrix(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.DET), p1);
        }
        const a = p1.tensor.elem;
        const isNumeric = a.every((element) => defs_1.isNumericAtom(element));
        if (isNumeric) {
          return yydetg(p1);
        } else {
          return determinant(a, p1.tensor.dim[0]);
        }
      }
      exports.det = det;
      function determinant(elements, n) {
        let q = 0;
        const a = [];
        for (let i = 0; i < n; i++) {
          a[i] = i;
          a[i + n] = 0;
          a[i + n + n] = 1;
        }
        let sign_ = 1;
        let outerTemp = defs_1.Constants.zero;
        while (true) {
          let temp = bignum_1.integer(sign_);
          for (let i = 0; i < n; i++) {
            const k = n * a[i] + i;
            temp = multiply_1.multiply(temp, elements[k]);
          }
          outerTemp = add_1.add(outerTemp, temp);
          let j = n - 1;
          let s = 0;
          let breakFromOutherWhile = false;
          while (true) {
            q = a[n + j] + a[n + n + j];
            if (q < 0) {
              a[n + n + j] = -a[n + n + j];
              j--;
              continue;
            }
            if (q === j + 1) {
              if (j === 0) {
                breakFromOutherWhile = true;
                break;
              }
              s++;
              a[n + n + j] = -a[n + n + j];
              j--;
              continue;
            }
            break;
          }
          if (breakFromOutherWhile) {
            break;
          }
          const t = a[j - a[n + j] + s];
          a[j - a[n + j] + s] = a[j - q + s];
          a[j - q + s] = t;
          a[n + j] = q;
          sign_ = sign_ === 1 ? -1 : 1;
        }
        return outerTemp;
      }
      exports.determinant = determinant;
      function yydetg(p1) {
        const n = p1.tensor.dim[0];
        const elements = [...p1.tensor.elem];
        const decomp = lu_decomp(elements, n);
        return decomp;
      }
      function getM(arr, n, i, j) {
        return arr[n * i + j];
      }
      function setM(arr, n, i, j, value) {
        arr[n * i + j] = value;
      }
      function lu_decomp(elements, n) {
        let p1 = defs_1.Constants.one;
        for (let d = 0; d < n - 1; d++) {
          if (misc_1.equal(getM(elements, n, d, d), defs_1.Constants.zero)) {
            let i = 0;
            for (i = d + 1; i < n; i++) {
              if (!misc_1.equal(getM(elements, n, i, d), defs_1.Constants.zero)) {
                break;
              }
            }
            if (i === n) {
              p1 = defs_1.Constants.zero;
              break;
            }
            for (let j = d; j < n; j++) {
              let p2 = getM(elements, n, d, j);
              setM(elements, n, d, j, getM(elements, n, i, j));
              setM(elements, n, i, j, p2);
            }
            p1 = multiply_1.negate(p1);
          }
          p1 = multiply_1.multiply(p1, getM(elements, n, d, d));
          for (let i = d + 1; i < n; i++) {
            const p2 = multiply_1.negate(multiply_1.divide(getM(elements, n, i, d), getM(elements, n, d, d)));
            setM(elements, n, i, d, defs_1.Constants.zero);
            for (let j = d + 1; j < n; j++) {
              const added = add_1.add(multiply_1.multiply(getM(elements, n, d, j), p2), getM(elements, n, i, j));
              setM(elements, n, i, j, added);
            }
          }
        }
        return multiply_1.multiply(p1, getM(elements, n, n - 1, n - 1));
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/cofactor.js
  var require_cofactor = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/cofactor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.cofactor = exports.Eval_cofactor = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var det_1 = require_det();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      function Eval_cofactor(p1) {
        const p2 = eval_1.Eval(defs_1.cadr(p1));
        if (!tensor_1.is_square_matrix(p2)) {
          run_1.stop("cofactor: 1st arg: square matrix expected");
        }
        const n = p2.tensor.dim[0];
        const i = eval_1.evaluate_integer(defs_1.caddr(p1));
        if (i < 1 || i > n) {
          run_1.stop("cofactor: 2nd arg: row index expected");
        }
        const j = eval_1.evaluate_integer(defs_1.cadddr(p1));
        if (j < 1 || j > n) {
          run_1.stop("cofactor: 3rd arg: column index expected");
        }
        stack_1.push(cofactor(p2, n, i - 1, j - 1));
      }
      exports.Eval_cofactor = Eval_cofactor;
      function cofactor(p, n, row, col) {
        const elements = [];
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (i !== row && j !== col) {
              elements.push(p.tensor.elem[n * i + j]);
            }
          }
        }
        let result = det_1.determinant(elements, n - 1);
        if ((row + col) % 2) {
          result = multiply_1.negate(result);
        }
        return result;
      }
      exports.cofactor = cofactor;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/adj.js
  var require_adj = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/adj.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.adj = exports.Eval_adj = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var cofactor_1 = require_cofactor();
      var eval_1 = require_eval();
      var tensor_1 = require_tensor();
      function Eval_adj(p1) {
        const result = adj(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_adj = Eval_adj;
      function adj(p1) {
        if (!tensor_1.is_square_matrix(p1)) {
          run_1.stop("adj: square matrix expected");
        }
        const n = p1.tensor.dim[0];
        const p2 = alloc_1.alloc_tensor(n * n);
        p2.tensor.ndim = 2;
        p2.tensor.dim[0] = n;
        p2.tensor.dim[1] = n;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            p2.tensor.elem[n * j + i] = cofactor_1.cofactor(p1, n, i, j);
          }
        }
        return p2;
      }
      exports.adj = adj;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/inv.js
  var require_inv = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/inv.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.invg = exports.inv = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var adj_1 = require_adj();
      var det_1 = require_det();
      var inner_1 = require_inner();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      function inv(p1) {
        if (defs_1.isinv(p1)) {
          return defs_1.car(defs_1.cdr(p1));
        }
        if (defs_1.isidentitymatrix(p1)) {
          return p1;
        }
        if (defs_1.defs.expanding && defs_1.isinnerordot(p1)) {
          const accumulator = defs_1.iscons(p1) ? p1.tail() : [];
          const inverses = accumulator.map(inv);
          for (let i = inverses.length - 1; i > 0; i--) {
            inverses[i - 1] = inner_1.inner(inverses[i], inverses[i - 1]);
          }
          return inverses[0];
        }
        if (!tensor_1.is_square_matrix(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.INV), p1);
        }
        if (defs_1.isNumericAtomOrTensor(p1)) {
          return yyinvg(p1);
        }
        const p2 = det_1.det(p1);
        if (is_1.isZeroAtomOrTensor(p2)) {
          run_1.stop("inverse of singular matrix");
        }
        return multiply_1.divide(adj_1.adj(p1), p2);
      }
      exports.inv = inv;
      function invg(p1) {
        if (!tensor_1.is_square_matrix(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.INVG), p1);
        }
        return yyinvg(p1);
      }
      exports.invg = invg;
      function yyinvg(p1) {
        const n = p1.tensor.dim[0];
        const units = new Array(n * n);
        units.fill(defs_1.Constants.zero);
        for (let i = 0; i < n; i++) {
          units[i * n + i] = defs_1.Constants.one;
        }
        const inverse = INV_decomp(units, p1.tensor.elem, n);
        const result = alloc_1.alloc_tensor(n * n);
        result.tensor.ndim = 2;
        result.tensor.dim[0] = n;
        result.tensor.dim[1] = n;
        result.tensor.elem = inverse;
        return result;
      }
      function INV_decomp(units, elements, n) {
        for (let d = 0; d < n; d++) {
          if (misc_1.equal(elements[n * d + d], defs_1.Constants.zero)) {
            let i = 0;
            for (i = d + 1; i < n; i++) {
              if (!misc_1.equal(elements[n * i + d], defs_1.Constants.zero)) {
                break;
              }
            }
            if (i === n) {
              run_1.stop("inverse of singular matrix");
            }
            for (let j = 0; j < n; j++) {
              let p22 = elements[n * d + j];
              elements[n * d + j] = elements[n * i + j];
              elements[n * i + j] = p22;
              p22 = units[n * d + j];
              units[n * d + j] = units[n * i + j];
              units[n * i + j] = p22;
            }
          }
          const p2 = elements[n * d + d];
          for (let j = 0; j < n; j++) {
            if (j > d) {
              elements[n * d + j] = multiply_1.divide(elements[n * d + j], p2);
            }
            units[n * d + j] = multiply_1.divide(units[n * d + j], p2);
          }
          for (let i = 0; i < n; i++) {
            if (i === d) {
              continue;
            }
            const p22 = elements[n * i + d];
            for (let j = 0; j < n; j++) {
              if (j > d) {
                elements[n * i + j] = add_1.subtract(elements[n * i + j], multiply_1.multiply(elements[n * d + j], p22));
              }
              units[n * i + j] = add_1.subtract(units[n * i + j], multiply_1.multiply(units[n * d + j], p22));
            }
          }
        }
        return units;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/inner.js
  var require_inner = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/inner.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.inner = exports.Eval_inner = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var inv_1 = require_inv();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      function Eval_inner(p1) {
        const args = [];
        args.push(defs_1.car(defs_1.cdr(p1)));
        const secondArgument = defs_1.car(defs_1.cdr(defs_1.cdr(p1)));
        if (secondArgument === defs_1.symbol(defs_1.NIL)) {
          run_1.stop("pattern needs at least a template and a transformed version");
        }
        let moreArgs = defs_1.cdr(defs_1.cdr(p1));
        while (moreArgs !== defs_1.symbol(defs_1.NIL)) {
          args.push(defs_1.car(moreArgs));
          moreArgs = defs_1.cdr(moreArgs);
        }
        if (args.length > 2) {
          let temp = list_1.makeList(defs_1.symbol(defs_1.INNER), args[args.length - 2], args[args.length - 1]);
          for (let i = 2; i < args.length; i++) {
            temp = list_1.makeList(defs_1.symbol(defs_1.INNER), args[args.length - i - 1], temp);
          }
          Eval_inner(temp);
          return;
        }
        let operands = [];
        get_innerprod_factors(p1, operands);
        let refinedOperands = [];
        for (let i = 0; i < operands.length; i++) {
          if (operands[i] !== defs_1.symbol(defs_1.SYMBOL_IDENTITY_MATRIX)) {
            refinedOperands.push(operands[i]);
          }
        }
        operands = refinedOperands;
        refinedOperands = [];
        if (operands.length > 1) {
          let shift = 0;
          for (let i = 0; i < operands.length; i++) {
            if (i + shift + 1 <= operands.length - 1) {
              if (!(defs_1.isNumericAtomOrTensor(operands[i + shift]) || defs_1.isNumericAtomOrTensor(operands[i + shift + 1]))) {
                const arg2 = eval_1.Eval(operands[i + shift + 1]);
                const arg1 = inv_1.inv(eval_1.Eval(operands[i + shift]));
                const difference = add_1.subtract(arg1, arg2);
                if (is_1.isZeroAtomOrTensor(difference)) {
                  shift += 1;
                } else {
                  refinedOperands.push(operands[i + shift]);
                }
              } else {
                refinedOperands.push(operands[i + shift]);
              }
            } else {
              break;
            }
            if (i + shift === operands.length - 2) {
              refinedOperands.push(operands[operands.length - 1]);
            }
            if (i + shift >= operands.length - 1) {
              break;
            }
          }
          operands = refinedOperands;
        }
        if (operands.length === 0) {
          stack_1.push(defs_1.symbol(defs_1.SYMBOL_IDENTITY_MATRIX));
          return;
        }
        p1 = list_1.makeList(defs_1.symbol(defs_1.INNER), ...operands);
        p1 = defs_1.cdr(p1);
        let result = eval_1.Eval(defs_1.car(p1));
        if (defs_1.iscons(p1)) {
          result = p1.tail().reduce((acc, p) => inner(acc, eval_1.Eval(p)), result);
        }
        stack_1.push(result);
      }
      exports.Eval_inner = Eval_inner;
      function inner(p1, p2) {
        if (is_1.isnegativeterm(p2) && is_1.isnegativeterm(p1)) {
          p2 = multiply_1.negate(p2);
          p1 = multiply_1.negate(p1);
        }
        if (defs_1.isinnerordot(p1)) {
          p2 = inner(defs_1.car(defs_1.cdr(defs_1.cdr(p1))), p2);
          p1 = defs_1.car(defs_1.cdr(p1));
        }
        if (p1 === defs_1.symbol(defs_1.SYMBOL_IDENTITY_MATRIX)) {
          return p2;
        } else if (p2 === defs_1.symbol(defs_1.SYMBOL_IDENTITY_MATRIX)) {
          return p1;
        }
        if (defs_1.istensor(p1) && defs_1.istensor(p2)) {
          return inner_f(p1, p2);
        } else {
          if (!(defs_1.isNumericAtomOrTensor(p1) || defs_1.isNumericAtomOrTensor(p2))) {
            const subtractionResult = add_1.subtract(p1, inv_1.inv(p2));
            if (is_1.isZeroAtomOrTensor(subtractionResult)) {
              return defs_1.symbol(defs_1.SYMBOL_IDENTITY_MATRIX);
            }
          }
          if (defs_1.defs.expanding && defs_1.isadd(p1)) {
            return p1.tail().reduce((a, b) => add_1.add(a, inner(b, p2)), defs_1.Constants.zero);
          }
          if (defs_1.defs.expanding && defs_1.isadd(p2)) {
            return p2.tail().reduce((a, b) => add_1.add(a, inner(p1, b)), defs_1.Constants.zero);
          }
          if (defs_1.istensor(p1) && defs_1.isNumericAtom(p2)) {
            return tensor_1.tensor_times_scalar(p1, p2);
          } else if (defs_1.isNumericAtom(p1) && defs_1.istensor(p2)) {
            return tensor_1.scalar_times_tensor(p1, p2);
          } else if (defs_1.isNumericAtom(p1) || defs_1.isNumericAtom(p2)) {
            return multiply_1.multiply(p1, p2);
          } else {
            return list_1.makeList(defs_1.symbol(defs_1.INNER), p1, p2);
          }
        }
      }
      exports.inner = inner;
      function inner_f(p1, p2) {
        const n = p1.tensor.dim[p1.tensor.ndim - 1];
        if (n !== p2.tensor.dim[0]) {
          defs_1.breakpoint;
          run_1.stop("inner: tensor dimension check");
        }
        const ndim = p1.tensor.ndim + p2.tensor.ndim - 2;
        if (ndim > defs_1.MAXDIM) {
          run_1.stop("inner: rank of result exceeds maximum");
        }
        const a = p1.tensor.elem;
        const b = p2.tensor.elem;
        const ak = p1.tensor.dim.slice(0, p1.tensor.dim.length - 1).reduce((a2, b2) => a2 * b2, 1);
        const bk = p2.tensor.dim.slice(1).reduce((a2, b2) => a2 * b2, 1);
        const p3 = alloc_1.alloc_tensor(ak * bk);
        const c = p3.tensor.elem;
        for (let i = 0; i < ak; i++) {
          for (let j = 0; j < n; j++) {
            if (is_1.isZeroAtomOrTensor(a[i * n + j])) {
              continue;
            }
            for (let k = 0; k < bk; k++) {
              c[i * bk + k] = add_1.add(multiply_1.multiply(a[i * n + j], b[j * bk + k]), c[i * bk + k]);
            }
          }
        }
        if (ndim === 0) {
          return p3.tensor.elem[0];
        } else {
          p3.tensor.ndim = ndim;
          p3.tensor.dim = [
            ...p1.tensor.dim.slice(0, p1.tensor.ndim - 1),
            ...p2.tensor.dim.slice(1, p2.tensor.ndim)
          ];
          return p3;
        }
      }
      function get_innerprod_factors(tree, factors_accumulator) {
        if (!defs_1.iscons(tree)) {
          add_factor_to_accumulator(tree, factors_accumulator);
          return;
        }
        if (defs_1.cdr(tree) === defs_1.symbol(defs_1.NIL)) {
          get_innerprod_factors(defs_1.car(tree), factors_accumulator);
          return;
        }
        if (defs_1.isinnerordot(tree)) {
          get_innerprod_factors(defs_1.car(defs_1.cdr(tree)), factors_accumulator);
          get_innerprod_factors(defs_1.cdr(defs_1.cdr(tree)), factors_accumulator);
          return;
        }
        add_factor_to_accumulator(tree, factors_accumulator);
      }
      function add_factor_to_accumulator(tree, factors_accumulator) {
        if (tree !== defs_1.symbol(defs_1.NIL)) {
          factors_accumulator.push(tree);
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/roots.js
  var require_roots = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/roots.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.roots = exports.Eval_roots = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var abs_1 = require_abs();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var coeff_1 = require_coeff();
      var eval_1 = require_eval();
      var factorpoly_1 = require_factorpoly();
      var guess_1 = require_guess();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var simplify_1 = require_simplify();
      var log = {
        debug: (str) => {
          if (defs_1.DEBUG) {
            console.log(str);
          }
        }
      };
      var flatten = (arr) => [].concat(...arr);
      function Eval_roots(POLY) {
        let X = defs_1.cadr(POLY);
        let POLY1;
        if (defs_1.car(X) === defs_1.symbol(defs_1.SETQ) || defs_1.car(X) === defs_1.symbol(defs_1.TESTEQ)) {
          POLY1 = add_1.subtract(eval_1.Eval(defs_1.cadr(X)), eval_1.Eval(defs_1.caddr(X)));
        } else {
          X = eval_1.Eval(X);
          if (defs_1.car(X) === defs_1.symbol(defs_1.SETQ) || defs_1.car(X) === defs_1.symbol(defs_1.TESTEQ)) {
            POLY1 = add_1.subtract(eval_1.Eval(defs_1.cadr(X)), eval_1.Eval(defs_1.caddr(X)));
          } else {
            POLY1 = X;
          }
        }
        X = eval_1.Eval(defs_1.caddr(POLY));
        const X1 = X === defs_1.symbol(defs_1.NIL) ? guess_1.guess(POLY1) : X;
        if (!is_1.ispolyexpandedform(POLY1, X1)) {
          run_1.stop("roots: 1st argument is not a polynomial in the variable " + X1);
        }
        stack_1.push_all(roots(POLY1, X1));
      }
      exports.Eval_roots = Eval_roots;
      function hasImaginaryCoeff(k) {
        return k.some((c) => is_1.iscomplexnumber(c));
      }
      function isSimpleRoot(k) {
        if (k.length <= 2) {
          return false;
        }
        if (is_1.isZeroAtomOrTensor(k[0])) {
          return false;
        }
        return k.slice(1, k.length - 1).every((el) => is_1.isZeroAtomOrTensor(el));
      }
      function normalisedCoeff(poly, x) {
        const miniStack = coeff_1.coeff(poly, x);
        const divideBy = miniStack[miniStack.length - 1];
        return miniStack.map((item) => multiply_1.divide(item, divideBy));
      }
      function roots(POLY, X) {
        if (defs_1.defs.recursionLevelNestedRadicalsRemoval > 1) {
          return [defs_1.symbol(defs_1.NIL)];
        }
        log.debug(`checking if ${stack_1.top()} is a case of simple roots`);
        const k = normalisedCoeff(POLY, X);
        const results = [];
        if (isSimpleRoot(k)) {
          log.debug(`yes, ${k[k.length - 1]} is a case of simple roots`);
          const kn = k.length;
          const lastCoeff = k[0];
          const leadingCoeff = k.pop();
          const simpleRoots = getSimpleRoots(kn, leadingCoeff, lastCoeff);
          results.push(...simpleRoots);
        } else {
          const roots4 = roots2(POLY, X);
          results.push(...roots4);
        }
        const n = results.length;
        if (n === 0) {
          run_1.stop("roots: the polynomial is not factorable, try nroots");
        }
        if (n === 1) {
          return results;
        }
        misc_1.sort(results);
        POLY = alloc_1.alloc_tensor(n);
        POLY.tensor.ndim = 1;
        POLY.tensor.dim[0] = n;
        for (let i = 0; i < n; i++) {
          POLY.tensor.elem[i] = results[i];
        }
        return [POLY];
      }
      exports.roots = roots;
      function getSimpleRoots(n, leadingCoeff, lastCoeff) {
        log.debug("getSimpleRoots");
        n = n - 1;
        const commonPart = multiply_1.divide(power_1.power(lastCoeff, bignum_1.rational(1, n)), power_1.power(leadingCoeff, bignum_1.rational(1, n)));
        const results = [];
        if (n % 2 === 0) {
          for (let i = 1; i <= n; i += 2) {
            const aSol = multiply_1.multiply(commonPart, power_1.power(defs_1.Constants.negOne, bignum_1.rational(i, n)));
            results.push(aSol);
            results.push(multiply_1.negate(aSol));
          }
          return results;
        }
        for (let i = 1; i <= n; i++) {
          let sol = multiply_1.multiply(commonPart, power_1.power(defs_1.Constants.negOne, bignum_1.rational(i, n)));
          if (i % 2 === 0) {
            sol = multiply_1.negate(sol);
          }
          results.push(sol);
        }
        return results;
      }
      function roots2(POLY, X) {
        const k = normalisedCoeff(POLY, X);
        if (!hasImaginaryCoeff(k)) {
          POLY = factorpoly_1.factorpoly(POLY, X);
        }
        if (defs_1.ismultiply(POLY)) {
          const mapped = POLY.tail().map((p) => roots3(p, X));
          return flatten(mapped);
        }
        return roots3(POLY, X);
      }
      function roots3(POLY, X) {
        if (defs_1.ispower(POLY) && is_1.ispolyexpandedform(defs_1.cadr(POLY), X) && is_1.isposint(defs_1.caddr(POLY))) {
          const n = normalisedCoeff(defs_1.cadr(POLY), X);
          return mini_solve(n);
        }
        if (is_1.ispolyexpandedform(POLY, X)) {
          const n = normalisedCoeff(POLY, X);
          return mini_solve(n);
        }
        return [];
      }
      function mini_solve(coefficients) {
        const n = coefficients.length;
        if (n === 2) {
          const A = coefficients.pop();
          const B = coefficients.pop();
          return _solveDegree1(A, B);
        }
        if (n === 3) {
          const A = coefficients.pop();
          const B = coefficients.pop();
          const C = coefficients.pop();
          return _solveDegree2(A, B, C);
        }
        if (n === 4) {
          const A = coefficients.pop();
          const B = coefficients.pop();
          const C = coefficients.pop();
          const D = coefficients.pop();
          return _solveDegree3(A, B, C, D);
        }
        if (n === 5) {
          const A = coefficients.pop();
          const B = coefficients.pop();
          const C = coefficients.pop();
          const D = coefficients.pop();
          const E = coefficients.pop();
          return _solveDegree4(A, B, C, D, E);
        }
        return [];
      }
      function _solveDegree1(A, B) {
        return [multiply_1.negate(multiply_1.divide(B, A))];
      }
      function _solveDegree2(A, B, C) {
        const p6 = power_1.power(add_1.subtract(power_1.power(B, bignum_1.integer(2)), multiply_1.multiply(multiply_1.multiply(bignum_1.integer(4), A), C)), bignum_1.rational(1, 2));
        const result1 = multiply_1.divide(add_1.subtract(p6, B), multiply_1.multiply(A, bignum_1.integer(2)));
        const result2 = multiply_1.multiply(multiply_1.divide(multiply_1.negate(add_1.add(p6, B)), A), bignum_1.rational(1, 2));
        return [result1, result2];
      }
      function _solveDegree3(A, B, C, D) {
        const R_c3 = multiply_1.multiply(multiply_1.multiply(C, C), C);
        const R_b2 = multiply_1.multiply(B, B);
        const R_b3 = multiply_1.multiply(R_b2, B);
        const R_m4_b3_d = multiply_1.multiply(multiply_1.multiply(R_b3, D), bignum_1.integer(-4));
        const R_2_b3 = multiply_1.multiply(R_b3, bignum_1.integer(2));
        const R_3_a = multiply_1.multiply(bignum_1.integer(3), A);
        const R_a2_d = multiply_1.multiply(multiply_1.multiply(A, A), D);
        const R_27_a2_d = multiply_1.multiply(R_a2_d, bignum_1.integer(27));
        const R_m27_a2_d2 = multiply_1.multiply(multiply_1.multiply(R_a2_d, D), bignum_1.integer(-27));
        const R_a_b_c = multiply_1.multiply(multiply_1.multiply(A, C), B);
        const R_3_a_c = multiply_1.multiply(multiply_1.multiply(A, C), bignum_1.integer(3));
        const R_m4_a_c3 = multiply_1.multiply(bignum_1.integer(-4), multiply_1.multiply(A, R_c3));
        const R_m9_a_b_c = multiply_1.negate(multiply_1.multiply(R_a_b_c, bignum_1.integer(9)));
        const R_18_a_b_c_d = multiply_1.multiply(multiply_1.multiply(R_a_b_c, D), bignum_1.integer(18));
        const R_DELTA0 = add_1.subtract(R_b2, R_3_a_c);
        const R_b2_c2 = multiply_1.multiply(R_b2, multiply_1.multiply(C, C));
        const R_m_b_over_3a = multiply_1.divide(multiply_1.negate(B), R_3_a);
        const R_4_DELTA03 = multiply_1.multiply(power_1.power(R_DELTA0, bignum_1.integer(3)), bignum_1.integer(4));
        const R_DELTA0_toBeCheckedIfZero = abs_1.absValFloat(simplify_1.simplify(R_DELTA0));
        const R_determinant = abs_1.absValFloat(simplify_1.simplify(add_1.add_all([R_18_a_b_c_d, R_m4_b3_d, R_b2_c2, R_m4_a_c3, R_m27_a2_d2])));
        const R_DELTA1 = add_1.add_all([R_2_b3, R_m9_a_b_c, R_27_a2_d]);
        const R_Q = simplify_1.simplify(power_1.power(add_1.subtract(power_1.power(R_DELTA1, bignum_1.integer(2)), R_4_DELTA03), bignum_1.rational(1, 2)));
        log.debug(">>>>>>>>>>>>>>>> actually using cubic formula <<<<<<<<<<<<<<< ");
        log.debug(`cubic: D0: ${R_DELTA0}`);
        log.debug(`cubic: D0 as float: ${R_DELTA0_toBeCheckedIfZero}`);
        log.debug(`cubic: DETERMINANT: ${R_determinant}`);
        log.debug(`cubic: D1: ${R_DELTA1}`);
        if (is_1.isZeroAtomOrTensor(R_determinant)) {
          const data = {
            R_DELTA0_toBeCheckedIfZero,
            R_m_b_over_3a,
            R_DELTA0,
            R_b3,
            R_a_b_c
          };
          return _solveDegree3ZeroRDeterminant(A, B, C, D, data);
        }
        let C_CHECKED_AS_NOT_ZERO = false;
        let flipSignOFQSoCIsNotZero = false;
        let R_C;
        while (!C_CHECKED_AS_NOT_ZERO) {
          const arg1 = flipSignOFQSoCIsNotZero ? multiply_1.negate(R_Q) : R_Q;
          R_C = simplify_1.simplify(power_1.power(multiply_1.multiply(add_1.add(arg1, R_DELTA1), bignum_1.rational(1, 2)), bignum_1.rational(1, 3)));
          const R_C_simplified_toCheckIfZero = abs_1.absValFloat(simplify_1.simplify(R_C));
          log.debug(`cubic: C: ${R_C}`);
          log.debug(`cubic: C as absval and float: ${R_C_simplified_toCheckIfZero}`);
          if (is_1.isZeroAtomOrTensor(R_C_simplified_toCheckIfZero)) {
            log.debug(" cubic: C IS ZERO flipping the sign");
            flipSignOFQSoCIsNotZero = true;
          } else {
            C_CHECKED_AS_NOT_ZERO = true;
          }
        }
        const R_6_a_C = multiply_1.multiply(multiply_1.multiply(R_C, R_3_a), bignum_1.integer(2));
        const i_sqrt3 = multiply_1.multiply(defs_1.Constants.imaginaryunit, power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
        const one_plus_i_sqrt3 = add_1.add(defs_1.Constants.one, i_sqrt3);
        const one_minus_i_sqrt3 = add_1.subtract(defs_1.Constants.one, i_sqrt3);
        const R_C_over_3a = multiply_1.divide(R_C, R_3_a);
        const firstSolTerm1 = R_m_b_over_3a;
        const firstSolTerm2 = multiply_1.negate(R_C_over_3a);
        const firstSolTerm3 = multiply_1.negate(multiply_1.divide(R_DELTA0, multiply_1.multiply(R_C, R_3_a)));
        const firstSolution = simplify_1.simplify(add_1.add_all([firstSolTerm1, firstSolTerm2, firstSolTerm3]));
        const secondSolTerm1 = R_m_b_over_3a;
        const secondSolTerm2 = multiply_1.divide(multiply_1.multiply(R_C_over_3a, one_plus_i_sqrt3), bignum_1.integer(2));
        const secondSolTerm3 = multiply_1.divide(multiply_1.multiply(one_minus_i_sqrt3, R_DELTA0), R_6_a_C);
        const secondSolution = simplify_1.simplify(add_1.add_all([secondSolTerm1, secondSolTerm2, secondSolTerm3]));
        const thirdSolTerm1 = R_m_b_over_3a;
        const thirdSolTerm2 = multiply_1.divide(multiply_1.multiply(R_C_over_3a, one_minus_i_sqrt3), bignum_1.integer(2));
        const thirdSolTerm3 = multiply_1.divide(multiply_1.multiply(one_plus_i_sqrt3, R_DELTA0), R_6_a_C);
        const thirdSolution = simplify_1.simplify(add_1.add_all([thirdSolTerm1, thirdSolTerm2, thirdSolTerm3]));
        return [firstSolution, secondSolution, thirdSolution];
      }
      function _solveDegree3ZeroRDeterminant(A, B, C, D, common) {
        const { R_DELTA0_toBeCheckedIfZero, R_m_b_over_3a, R_DELTA0, R_b3, R_a_b_c } = common;
        if (is_1.isZeroAtomOrTensor(R_DELTA0_toBeCheckedIfZero)) {
          log.debug(" cubic: DETERMINANT IS ZERO and delta0 is zero");
          return [R_m_b_over_3a];
        }
        log.debug(" cubic: DETERMINANT IS ZERO and delta0 is not zero");
        const rootSolution = multiply_1.divide(add_1.subtract(multiply_1.multiply(A, multiply_1.multiply(D, bignum_1.integer(9))), multiply_1.multiply(B, C)), multiply_1.multiply(R_DELTA0, bignum_1.integer(2)));
        const numer_term1 = multiply_1.negate(R_b3);
        const numer_term2 = multiply_1.negate(multiply_1.multiply(A, multiply_1.multiply(A, multiply_1.multiply(D, bignum_1.integer(9)))));
        const numer_term3 = multiply_1.multiply(R_a_b_c, bignum_1.integer(4));
        const secondSolution = multiply_1.divide(add_1.add_all([numer_term3, numer_term2, numer_term1]), multiply_1.multiply(A, R_DELTA0));
        return [rootSolution, rootSolution, secondSolution];
      }
      function _solveDegree4(A, B, C, D, E) {
        log.debug(">>>>>>>>>>>>>>>> actually using quartic formula <<<<<<<<<<<<<<< ");
        if (is_1.isZeroAtomOrTensor(B) && is_1.isZeroAtomOrTensor(D) && !is_1.isZeroAtomOrTensor(C) && !is_1.isZeroAtomOrTensor(E)) {
          return _solveDegree4Biquadratic(A, B, C, D, E);
        }
        if (!is_1.isZeroAtomOrTensor(B)) {
          return _solveDegree4NonzeroB(A, B, C, D, E);
        } else {
          return _solveDegree4ZeroB(A, B, C, D, E);
        }
      }
      function _solveDegree4Biquadratic(A, B, C, D, E) {
        log.debug("biquadratic case");
        const biquadraticSolutions = roots(add_1.add(multiply_1.multiply(A, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2))), add_1.add(multiply_1.multiply(C, defs_1.symbol(defs_1.SECRETX)), E)), defs_1.symbol(defs_1.SECRETX))[0];
        const results = [];
        for (const sol of biquadraticSolutions.tensor.elem) {
          results.push(simplify_1.simplify(power_1.power(sol, bignum_1.rational(1, 2))));
          results.push(simplify_1.simplify(multiply_1.negate(power_1.power(sol, bignum_1.rational(1, 2)))));
        }
        return results;
      }
      function _solveDegree4ZeroB(A, B, C, D, E) {
        const R_p = C;
        const R_q = D;
        const R_r = E;
        const coeff2 = multiply_1.multiply(bignum_1.rational(5, 2), R_p);
        const coeff3 = add_1.subtract(multiply_1.multiply(bignum_1.integer(2), power_1.power(R_p, bignum_1.integer(2))), R_r);
        const coeff4 = add_1.add(multiply_1.multiply(bignum_1.rational(-1, 2), multiply_1.multiply(R_p, R_r)), add_1.add(multiply_1.divide(power_1.power(R_p, bignum_1.integer(3)), bignum_1.integer(2)), multiply_1.multiply(bignum_1.rational(-1, 8), power_1.power(R_q, bignum_1.integer(2)))));
        const arg1 = add_1.add(power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(3)), add_1.add(multiply_1.multiply(coeff2, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2))), add_1.add(multiply_1.multiply(coeff3, defs_1.symbol(defs_1.SECRETX)), coeff4)));
        log.debug(`resolventCubic: ${stack_1.top()}`);
        const resolventCubicSolutions = roots(arg1, defs_1.symbol(defs_1.SECRETX))[0];
        log.debug(`resolventCubicSolutions: ${resolventCubicSolutions}`);
        let R_m = null;
        for (const sol of resolventCubicSolutions.tensor.elem) {
          log.debug(`examining solution: ${sol}`);
          const toBeCheckedIfZero = abs_1.absValFloat(add_1.add(multiply_1.multiply(sol, bignum_1.integer(2)), R_p));
          log.debug(`abs value is: ${sol}`);
          if (!is_1.isZeroAtomOrTensor(toBeCheckedIfZero)) {
            R_m = sol;
            break;
          }
        }
        log.debug(`chosen solution: ${R_m}`);
        const sqrtPPlus2M = simplify_1.simplify(power_1.power(add_1.add(multiply_1.multiply(R_m, bignum_1.integer(2)), R_p), bignum_1.rational(1, 2)));
        const twoQOversqrtPPlus2M = simplify_1.simplify(multiply_1.divide(multiply_1.multiply(R_q, bignum_1.integer(2)), sqrtPPlus2M));
        const threePPlus2M = add_1.add(multiply_1.multiply(R_p, bignum_1.integer(3)), multiply_1.multiply(R_m, bignum_1.integer(2)));
        const sol1Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.add(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
        const solution1 = multiply_1.divide(add_1.add(sqrtPPlus2M, sol1Arg), bignum_1.integer(2));
        const sol2Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.add(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
        const solution2 = multiply_1.divide(add_1.subtract(sqrtPPlus2M, sol2Arg), bignum_1.integer(2));
        const sol3Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.subtract(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
        const solution3 = multiply_1.divide(add_1.add(multiply_1.negate(sqrtPPlus2M), sol3Arg), bignum_1.integer(2));
        const sol4Arg = simplify_1.simplify(power_1.power(multiply_1.negate(add_1.subtract(threePPlus2M, twoQOversqrtPPlus2M)), bignum_1.rational(1, 2)));
        const solution4 = multiply_1.divide(add_1.subtract(multiply_1.negate(sqrtPPlus2M), sol4Arg), bignum_1.integer(2));
        return [solution1, solution2, solution3, solution4];
      }
      function _solveDegree4NonzeroB(A, B, C, D, E) {
        const R_p = multiply_1.divide(add_1.add(multiply_1.multiply(bignum_1.integer(8), multiply_1.multiply(C, A)), multiply_1.multiply(bignum_1.integer(-3), power_1.power(B, bignum_1.integer(2)))), multiply_1.multiply(bignum_1.integer(8), power_1.power(A, bignum_1.integer(2))));
        const R_q = multiply_1.divide(add_1.add(power_1.power(B, bignum_1.integer(3)), add_1.add(multiply_1.multiply(bignum_1.integer(-4), multiply_1.multiply(A, multiply_1.multiply(B, C))), multiply_1.multiply(bignum_1.integer(8), multiply_1.multiply(D, power_1.power(A, bignum_1.integer(2)))))), multiply_1.multiply(bignum_1.integer(8), power_1.power(A, bignum_1.integer(3))));
        const R_a3 = multiply_1.multiply(multiply_1.multiply(A, A), A);
        const R_b2 = multiply_1.multiply(B, B);
        const R_a2_d = multiply_1.multiply(multiply_1.multiply(A, A), D);
        let R_r = multiply_1.divide(add_1.add(multiply_1.multiply(power_1.power(B, bignum_1.integer(4)), bignum_1.integer(-3)), add_1.add(multiply_1.multiply(bignum_1.integer(256), multiply_1.multiply(R_a3, E)), add_1.add(multiply_1.multiply(bignum_1.integer(-64), multiply_1.multiply(R_a2_d, B)), multiply_1.multiply(bignum_1.integer(16), multiply_1.multiply(R_b2, multiply_1.multiply(A, C)))))), multiply_1.multiply(bignum_1.integer(256), power_1.power(A, bignum_1.integer(4))));
        const four_x_4 = power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(4));
        const r_q_x_2 = multiply_1.multiply(R_p, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2)));
        const r_q_x = multiply_1.multiply(R_q, defs_1.symbol(defs_1.SECRETX));
        const simplified = simplify_1.simplify(add_1.add_all([four_x_4, r_q_x_2, r_q_x, R_r]));
        const depressedSolutions = roots(simplified, defs_1.symbol(defs_1.SECRETX))[0];
        log.debug(`p for depressed quartic: ${R_p}`);
        log.debug(`q for depressed quartic: ${R_q}`);
        log.debug(`r for depressed quartic: ${R_r}`);
        log.debug(`tos 4 ${defs_1.defs.tos}`);
        log.debug(`4 * x^4: ${four_x_4}`);
        log.debug(`R_p * x^2: ${r_q_x_2}`);
        log.debug(`R_q * x: ${r_q_x}`);
        log.debug(`R_r: ${R_r}`);
        log.debug(`solving depressed quartic: ${simplified}`);
        log.debug(`depressedSolutions: ${depressedSolutions}`);
        return depressedSolutions.tensor.elem.map((sol) => {
          const result = simplify_1.simplify(add_1.subtract(sol, multiply_1.divide(B, multiply_1.multiply(bignum_1.integer(4), A))));
          log.debug(`solution from depressed: ${result}`);
          return result;
        });
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/simfac.js
  var require_simfac = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/simfac.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.simfac = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var factorial_1 = require_factorial();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      function simfac(p1) {
        if (defs_1.isadd(p1)) {
          const terms = p1.tail().map(simfac_term);
          return add_1.add_all(terms);
        }
        return simfac_term(p1);
      }
      exports.simfac = simfac;
      function simfac_term(p1) {
        if (!defs_1.ismultiply(p1)) {
          return p1;
        }
        const factors = p1.tail();
        while (yysimfac(factors)) {
        }
        return multiply_1.multiply_all_noexpand(factors);
      }
      function yysimfac(stack) {
        for (let i = 0; i < stack.length; i++) {
          let p1 = stack[i];
          for (let j = 0; j < stack.length; j++) {
            if (i === j) {
              continue;
            }
            let p2 = stack[j];
            if (defs_1.isfactorial(p1) && defs_1.ispower(p2) && is_1.isminusone(defs_1.caddr(p2)) && misc_1.equal(defs_1.cadr(p1), defs_1.cadr(p2))) {
              stack[i] = factorial_1.factorial(add_1.subtract(defs_1.cadr(p1), defs_1.Constants.one));
              stack[j] = defs_1.Constants.one;
              return true;
            }
            if (defs_1.ispower(p2) && is_1.isminusone(defs_1.caddr(p2)) && defs_1.caadr(p2) === defs_1.symbol(defs_1.FACTORIAL) && misc_1.equal(p1, defs_1.cadadr(p2))) {
              stack[i] = multiply_1.reciprocate(factorial_1.factorial(add_1.add(p1, defs_1.Constants.negOne)));
              stack[j] = defs_1.Constants.one;
              return true;
            }
            if (defs_1.isfactorial(p2)) {
              const p3 = add_1.subtract(p1, defs_1.cadr(p2));
              if (is_1.isplusone(p3)) {
                stack[i] = factorial_1.factorial(p1);
                stack[j] = defs_1.Constants.one;
                return true;
              }
            }
            if (defs_1.ispower(p1) && is_1.isminusone(defs_1.caddr(p1)) && defs_1.ispower(p2) && is_1.isminusone(defs_1.caddr(p2)) && defs_1.caadr(p2) === defs_1.symbol(defs_1.FACTORIAL)) {
              const p3 = add_1.subtract(defs_1.cadr(p1), defs_1.cadr(defs_1.cadr(p2)));
              if (is_1.isplusone(p3)) {
                stack[i] = multiply_1.reciprocate(factorial_1.factorial(defs_1.cadr(p1)));
                stack[j] = defs_1.Constants.one;
                return true;
              }
            }
            if (defs_1.isfactorial(p1) && defs_1.ispower(p2) && is_1.isminusone(defs_1.caddr(p2)) && defs_1.caadr(p2) === defs_1.symbol(defs_1.FACTORIAL)) {
              const p3 = add_1.subtract(defs_1.cadr(p1), defs_1.cadr(defs_1.cadr(p2)));
              if (is_1.isplusone(p3)) {
                stack[i] = defs_1.cadr(p1);
                stack[j] = defs_1.Constants.one;
                return true;
              }
              if (is_1.isminusone(p3)) {
                stack[i] = multiply_1.reciprocate(defs_1.cadr(defs_1.cadr(p2)));
                stack[j] = defs_1.Constants.one;
                return true;
              }
              if (is_1.equaln(p3, 2)) {
                stack[i] = defs_1.cadr(p1);
                stack[j] = add_1.add(defs_1.cadr(p1), defs_1.Constants.negOne);
                return true;
              }
              if (is_1.equaln(p3, -2)) {
                stack[i] = multiply_1.reciprocate(defs_1.cadr(defs_1.cadr(p2)));
                stack[j] = multiply_1.reciprocate(add_1.add(defs_1.cadr(defs_1.cadr(p2)), defs_1.Constants.negOne));
                return true;
              }
            }
          }
        }
        return false;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/decomp.js
  var require_decomp = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/decomp.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.decomp = exports.Eval_decomp = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var guess_1 = require_guess();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function Eval_decomp(p1) {
        console.log("Eval_decomp is being called!!!!!!!!!!!!!!!!!!!!");
        const arg = eval_1.Eval(defs_1.cadr(p1));
        p1 = eval_1.Eval(defs_1.caddr(p1));
        const variable = p1 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(arg) : p1;
        const result = decomp(false, arg, variable);
        stack_1.push(list_1.makeList(defs_1.symbol(defs_1.NIL), ...result));
      }
      exports.Eval_decomp = Eval_decomp;
      function pushTryNotToDuplicateLocal(localStack, item) {
        if (localStack.length > 0 && misc_1.equal(item, localStack[localStack.length - 1])) {
          return false;
        }
        localStack.push(item);
        return true;
      }
      function decomp(generalTransform, p1, p2) {
        if (defs_1.DEBUG) {
          console.log(`DECOMPOSING ${p1}`);
        }
        if (generalTransform) {
          if (!defs_1.iscons(p1)) {
            if (defs_1.DEBUG) {
              console.log(` ground thing: ${p1}`);
            }
            return [p1];
          }
        } else {
          if (!find_1.Find(p1, p2)) {
            if (defs_1.DEBUG) {
              console.log(" entire expression is constant");
            }
            return [p1];
          }
        }
        if (defs_1.isadd(p1)) {
          return decomp_sum(generalTransform, p1, p2);
        }
        if (defs_1.ismultiply(p1)) {
          return decomp_product(generalTransform, p1, p2);
        }
        let p3 = defs_1.cdr(p1);
        if (defs_1.DEBUG) {
          console.log(" naive decomp");
          console.log(`startig p3: ${p3}`);
        }
        const stack = [];
        while (defs_1.iscons(p3)) {
          if (generalTransform) {
            stack.push(defs_1.car(p3));
          }
          if (defs_1.DEBUG) {
            console.log("recursive decomposition");
            console.log(`car(p3): ${defs_1.car(p3)}`);
            console.log(`p2: ${p2}`);
          }
          stack.push(...decomp(generalTransform, defs_1.car(p3), p2));
          p3 = defs_1.cdr(p3);
        }
        return stack;
      }
      exports.decomp = decomp;
      function decomp_sum(generalTransform, p1, p2) {
        if (defs_1.DEBUG) {
          console.log(" decomposing the sum ");
        }
        let p3 = defs_1.cdr(p1);
        const stack = [];
        while (defs_1.iscons(p3)) {
          if (find_1.Find(defs_1.car(p3), p2) || generalTransform) {
            stack.push(...decomp(generalTransform, defs_1.car(p3), p2));
          }
          p3 = defs_1.cdr(p3);
        }
        p3 = defs_1.cdr(p1);
        const constantTerms = [...p3].filter((t) => !find_1.Find(t, p2));
        if (constantTerms.length) {
          p3 = add_1.add_all(constantTerms);
          pushTryNotToDuplicateLocal(stack, p3);
          stack.push(multiply_1.negate(p3));
        }
        return stack;
      }
      function decomp_product(generalTransform, p1, p2) {
        if (defs_1.DEBUG) {
          console.log(" decomposing the product ");
        }
        let p3 = defs_1.cdr(p1);
        const stack = [];
        while (defs_1.iscons(p3)) {
          if (find_1.Find(defs_1.car(p3), p2) || generalTransform) {
            stack.push(...decomp(generalTransform, defs_1.car(p3), p2));
          }
          p3 = defs_1.cdr(p3);
        }
        p3 = defs_1.cdr(p1);
        const constantFactors = [];
        while (defs_1.iscons(p3)) {
          const item = defs_1.car(p3);
          if (!find_1.Find(item, p2)) {
            if (constantFactors.length < 1 || !misc_1.equal(item, constantFactors[constantFactors.length - 1])) {
              constantFactors.push(item);
            }
          }
          p3 = defs_1.cdr(p3);
        }
        if (constantFactors.length > 0) {
          stack.push(multiply_1.multiply_all(constantFactors));
        }
        return stack;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/transform.js
  var require_transform = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/transform.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.transform = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var add_1 = require_add();
      var bake_1 = require_bake();
      var decomp_1 = require_decomp();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var scan_1 = require_scan();
      var subst_1 = require_subst();
      function transform(F, X, s, generalTransform) {
        if (defs_1.DEBUG) {
          console.log(`         !!!!!!!!!   transform on: ${F}`);
        }
        const state = saveMetaBindings();
        symbol_1.set_binding(defs_1.symbol(defs_1.METAX), X);
        const arg = bake_1.polyform(F, X);
        const result = decomp_1.decomp(generalTransform, arg, X);
        if (defs_1.DEBUG) {
          console.log(`  ${result.length} decomposed elements ====== `);
          for (let i = 0; i < result.length; i++) {
            console.log(`  decomposition element ${i}: ${result[i]}`);
          }
        }
        let transformationSuccessful = false;
        let B;
        if (generalTransform) {
          if (!defs_1.isNumericAtom(F)) {
            const theTransform = s;
            if (defs_1.DEBUG) {
              console.log(`applying transform: ${theTransform}`);
              console.log(`scanning table entry ${theTransform}`);
            }
            let expr = subst_1.subst(theTransform, defs_1.symbol(defs_1.SYMBOL_A_UNDERSCORE), defs_1.symbol(defs_1.METAA));
            expr = subst_1.subst(expr, defs_1.symbol(defs_1.SYMBOL_B_UNDERSCORE), defs_1.symbol(defs_1.METAB));
            const p1 = subst_1.subst(expr, defs_1.symbol(defs_1.SYMBOL_X_UNDERSCORE), defs_1.symbol(defs_1.METAX));
            const A = defs_1.car(p1);
            if (defs_1.DEBUG) {
              console.log(`template expression: ${A}`);
            }
            B = defs_1.cadr(p1);
            const C = defs_1.cddr(p1);
            if (f_equals_a([defs_1.Constants.one, ...result], generalTransform, F, A, C)) {
              transformationSuccessful = true;
            } else {
              if (defs_1.DEBUG) {
                console.log(`p3 at this point: ${F}`);
                console.log(`car(p3): ${defs_1.car(F)}`);
              }
              const transformedTerms = [];
              let restTerm = F;
              if (defs_1.iscons(restTerm)) {
                transformedTerms.push(defs_1.car(F));
                restTerm = defs_1.cdr(F);
              }
              while (defs_1.iscons(restTerm)) {
                const secondTerm = defs_1.car(restTerm);
                restTerm = defs_1.cdr(restTerm);
                if (defs_1.DEBUG) {
                  console.log("tos before recursive transform: " + defs_1.defs.tos);
                  console.log(`testing: ${secondTerm}`);
                  console.log(`about to try to simplify other term: ${secondTerm}`);
                }
                const [t, success] = transform(secondTerm, defs_1.symbol(defs_1.NIL), s, generalTransform);
                transformationSuccessful = transformationSuccessful || success;
                transformedTerms.push(t);
                if (defs_1.DEBUG) {
                  console.log(`tried to simplify other term: ${secondTerm} ...successful?: ${success} ...transformed: ${transformedTerms[transformedTerms.length - 1]}`);
                }
              }
              if (transformedTerms.length !== 0) {
                B = list_1.makeList(...transformedTerms);
              }
            }
          }
        } else {
          for (let eachTransformEntry of Array.from(s)) {
            if (defs_1.DEBUG) {
              console.log(`scanning table entry ${eachTransformEntry}`);
              if ((eachTransformEntry + "").indexOf("f(sqrt(a+b*x),2/3*1/b*sqrt((a+b*x)^3))") !== -1) {
                defs_1.breakpoint;
              }
            }
            if (eachTransformEntry) {
              scan_1.scan_meta(eachTransformEntry);
              const temp2 = stack_1.pop();
              const p5 = defs_1.cadr(temp2);
              B = defs_1.caddr(temp2);
              const p7 = defs_1.cdddr(temp2);
              if (f_equals_a([defs_1.Constants.one, ...result], generalTransform, F, p5, p7)) {
                transformationSuccessful = true;
                break;
              }
            }
          }
        }
        const temp = transformationSuccessful ? eval_1.Eval(B) : generalTransform ? F : defs_1.symbol(defs_1.NIL);
        restoreMetaBindings(state);
        return [temp, transformationSuccessful];
      }
      exports.transform = transform;
      function saveMetaBindings() {
        return {
          METAA: symbol_1.get_binding(defs_1.symbol(defs_1.METAA)),
          METAB: symbol_1.get_binding(defs_1.symbol(defs_1.METAB)),
          METAX: symbol_1.get_binding(defs_1.symbol(defs_1.METAX))
        };
      }
      function restoreMetaBindings(state) {
        symbol_1.set_binding(defs_1.symbol(defs_1.METAX), state.METAX);
        symbol_1.set_binding(defs_1.symbol(defs_1.METAB), state.METAB);
        symbol_1.set_binding(defs_1.symbol(defs_1.METAA), state.METAA);
      }
      function f_equals_a(stack, generalTransform, F, A, C) {
        for (const fea_i of stack) {
          symbol_1.set_binding(defs_1.symbol(defs_1.METAA), fea_i);
          if (defs_1.DEBUG) {
            console.log(`  binding METAA to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))}`);
          }
          for (const fea_j of stack) {
            symbol_1.set_binding(defs_1.symbol(defs_1.METAB), fea_j);
            if (defs_1.DEBUG) {
              console.log(`  binding METAB to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))}`);
            }
            let temp = C;
            while (defs_1.iscons(temp)) {
              const p2 = eval_1.Eval(defs_1.car(temp));
              if (is_1.isZeroAtomOrTensor(p2)) {
                break;
              }
              temp = defs_1.cdr(temp);
            }
            if (defs_1.iscons(temp)) {
              continue;
            }
            const arg2 = generalTransform ? defs_1.noexpand(eval_1.Eval, A) : eval_1.Eval(A);
            if (defs_1.DEBUG) {
              console.log(`about to evaluate template expression: ${A} binding METAA to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))} and binding METAB to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))} and binding METAX to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAX))}`);
              console.log(`  comparing ${arg2} to: ${F}`);
            }
            if (is_1.isZeroAtomOrTensor(add_1.subtract(F, arg2))) {
              if (defs_1.DEBUG) {
                console.log(`binding METAA to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))}`);
                console.log(`binding METAB to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))}`);
                console.log(`binding METAX to ${symbol_1.get_binding(defs_1.symbol(defs_1.METAX))}`);
                console.log(`comparing ${F} to: ${A}`);
              }
              return true;
            }
          }
        }
        return false;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/transpose.js
  var require_transpose = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/transpose.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.transpose = exports.Eval_transpose = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var inner_1 = require_inner();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function Eval_transpose(p1) {
        const arg1 = eval_1.Eval(defs_1.cadr(p1));
        let arg2 = defs_1.Constants.one;
        let arg3 = bignum_1.integer(2);
        if (defs_1.cddr(p1) !== defs_1.symbol(defs_1.NIL)) {
          arg2 = eval_1.Eval(defs_1.caddr(p1));
          arg3 = eval_1.Eval(defs_1.cadddr(p1));
        }
        stack_1.push(transpose(arg1, arg2, arg3));
      }
      exports.Eval_transpose = Eval_transpose;
      function transpose(p1, p2, p3) {
        let t = 0;
        const ai = Array(defs_1.MAXDIM).fill(0);
        const an = Array(defs_1.MAXDIM).fill(0);
        if (defs_1.isNumericAtom(p1)) {
          return p1;
        }
        if (is_1.isplusone(p2) && is_1.isplustwo(p3) || is_1.isplusone(p3) && is_1.isplustwo(p2)) {
          if (defs_1.isidentitymatrix(p1)) {
            return p1;
          }
        }
        if (defs_1.istranspose(p1)) {
          const innerTranspSwitch1 = defs_1.car(defs_1.cdr(defs_1.cdr(p1)));
          const innerTranspSwitch2 = defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.cdr(p1))));
          if (misc_1.equal(innerTranspSwitch1, p3) && misc_1.equal(innerTranspSwitch2, p2) || misc_1.equal(innerTranspSwitch2, p3) && misc_1.equal(innerTranspSwitch1, p2) || misc_1.equal(innerTranspSwitch1, defs_1.symbol(defs_1.NIL)) && misc_1.equal(innerTranspSwitch2, defs_1.symbol(defs_1.NIL)) && (is_1.isplusone(p3) && is_1.isplustwo(p2) || is_1.isplusone(p2) && is_1.isplustwo(p3))) {
            return defs_1.car(defs_1.cdr(p1));
          }
        }
        if (defs_1.defs.expanding && defs_1.isadd(p1)) {
          return p1.tail().reduce((a2, b2) => add_1.add(a2, transpose(b2, p2, p3)), defs_1.Constants.zero);
        }
        if (defs_1.defs.expanding && defs_1.ismultiply(p1)) {
          return p1.tail().reduce((a2, b2) => multiply_1.multiply(a2, transpose(b2, p2, p3)), defs_1.Constants.one);
        }
        if (defs_1.defs.expanding && defs_1.isinnerordot(p1)) {
          const accumulator = [];
          if (defs_1.iscons(p1)) {
            accumulator.push(...p1.tail().map((p) => [p, p2, p3]));
          }
          accumulator.reverse();
          return accumulator.reduce((acc, p) => inner_1.inner(acc, transpose(p[0], p[1], p[2])), defs_1.symbol(defs_1.SYMBOL_IDENTITY_MATRIX));
        }
        if (!defs_1.istensor(p1)) {
          if (!is_1.isZeroAtomOrTensor(p1)) {
            if ((!is_1.isplusone(p2) || !is_1.isplustwo(p3)) && (!is_1.isplusone(p3) || !is_1.isplustwo(p2))) {
              return list_1.makeList(defs_1.symbol(defs_1.TRANSPOSE), p1, p2, p3);
            }
            return list_1.makeList(defs_1.symbol(defs_1.TRANSPOSE), p1);
          }
          return defs_1.Constants.zero;
        }
        const { ndim, nelem } = p1.tensor;
        if (ndim === 1) {
          return p1;
        }
        let l = bignum_1.nativeInt(p2);
        let m = bignum_1.nativeInt(p3);
        if (l < 1 || l > ndim || m < 1 || m > ndim) {
          run_1.stop("transpose: index out of range");
        }
        l--;
        m--;
        p2 = alloc_1.alloc_tensor(nelem);
        p2.tensor.ndim = ndim;
        p2.tensor.dim = [...p1.tensor.dim];
        p2.tensor.dim[l] = p1.tensor.dim[m];
        p2.tensor.dim[m] = p1.tensor.dim[l];
        const a = p1.tensor.elem;
        const b = p2.tensor.elem;
        for (let i = 0; i < ndim; i++) {
          ai[i] = 0;
          an[i] = p1.tensor.dim[i];
        }
        for (let i = 0; i < nelem; i++) {
          t = ai[l];
          ai[l] = ai[m];
          ai[m] = t;
          t = an[l];
          an[l] = an[m];
          an[m] = t;
          let k = 0;
          for (let j = 0; j < ndim; j++) {
            k = k * an[j] + ai[j];
          }
          t = ai[l];
          ai[l] = ai[m];
          ai[m] = t;
          t = an[l];
          an[l] = an[m];
          an[m] = t;
          b[k] = a[i];
          for (let j = ndim - 1; j >= 0; j--) {
            if (++ai[j] < an[j]) {
              break;
            }
            ai[j] = 0;
          }
        }
        return p2;
      }
      exports.transpose = transpose;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/simplify.js
  var require_simplify = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/simplify.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.simplify_trig = exports.simplify = exports.simplifyForCodeGeneration = exports.Eval_simplify = void 0;
      var alloc_1 = require_alloc();
      var count_1 = require_count();
      var defs_1 = require_defs();
      var find_1 = require_find();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var clock_1 = require_clock();
      var condense_1 = require_condense();
      var eval_1 = require_eval();
      var float_1 = require_float();
      var inner_1 = require_inner();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var polar_1 = require_polar();
      var power_1 = require_power();
      var rationalize_1 = require_rationalize();
      var real_1 = require_real();
      var rect_1 = require_rect();
      var roots_1 = require_roots();
      var simfac_1 = require_simfac();
      var tensor_1 = require_tensor();
      var transform_1 = require_transform();
      var transpose_1 = require_transpose();
      var denominator_1 = require_denominator();
      var gcd_1 = require_gcd();
      var factor_1 = require_factor();
      var numerator_1 = require_numerator();
      function Eval_simplify(p1) {
        const arg = runUserDefinedSimplifications(defs_1.cadr(p1));
        const result = simplify(eval_1.Eval(arg));
        stack_1.push(result);
      }
      exports.Eval_simplify = Eval_simplify;
      function runUserDefinedSimplifications(p) {
        if (defs_1.defs.userSimplificationsInListForm.length === 0 || find_1.Find(p, defs_1.symbol(defs_1.INTEGRAL))) {
          return p;
        }
        if (defs_1.DEBUG) {
          console.log(`runUserDefinedSimplifications passed: ${p}`);
        }
        let F1 = defs_1.noexpand(eval_1.Eval, p);
        if (defs_1.DEBUG) {
          console.log(`runUserDefinedSimplifications after eval no expanding: ${F1}`);
          console.log("patterns to be checked: ");
          for (const simplification of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            console.log(`...${simplification}`);
          }
        }
        let atLeastOneSuccessInRouldOfRulesApplications = true;
        let numberOfRulesApplications = 0;
        while (atLeastOneSuccessInRouldOfRulesApplications && numberOfRulesApplications < defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES) {
          atLeastOneSuccessInRouldOfRulesApplications = false;
          numberOfRulesApplications++;
          for (const eachSimplification of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            let success = true;
            let eachConsecutiveRuleApplication = 0;
            while (success && eachConsecutiveRuleApplication < defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE) {
              eachConsecutiveRuleApplication++;
              if (defs_1.DEBUG) {
                console.log(`simplify - tos: ${defs_1.defs.tos} checking pattern: ${eachSimplification} on: ${F1}`);
              }
              [F1, success] = transform_1.transform(F1, defs_1.symbol(defs_1.NIL), eachSimplification, true);
              if (success) {
                atLeastOneSuccessInRouldOfRulesApplications = true;
              }
              if (defs_1.DEBUG) {
                console.log(`p1 at this stage of simplification: ${F1}`);
              }
            }
            if (eachConsecutiveRuleApplication === defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE) {
              run_1.stop(`maximum application of single transformation rule exceeded: ${eachSimplification}`);
            }
          }
        }
        if (numberOfRulesApplications === defs_1.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES) {
          run_1.stop("maximum application of all transformation rules exceeded ");
        }
        if (defs_1.DEBUG) {
          console.log(`METAX = ${symbol_1.get_binding(defs_1.symbol(defs_1.METAX))}`);
          console.log(`METAA = ${symbol_1.get_binding(defs_1.symbol(defs_1.METAA))}`);
          console.log(`METAB = ${symbol_1.get_binding(defs_1.symbol(defs_1.METAB))}`);
        }
        return F1;
      }
      function simplifyForCodeGeneration(p) {
        const arg = runUserDefinedSimplifications(p);
        defs_1.defs.codeGen = true;
        const result = simplify(arg);
        defs_1.defs.codeGen = false;
        return result;
      }
      exports.simplifyForCodeGeneration = simplifyForCodeGeneration;
      function simplify(p1) {
        if (defs_1.defs.codeGen && defs_1.car(p1) === defs_1.symbol(defs_1.FUNCTION)) {
          const fbody = defs_1.cadr(p1);
          const p3 = simplify(eval_1.Eval(fbody));
          const args = defs_1.caddr(p1);
          p1 = list_1.makeList(defs_1.symbol(defs_1.FUNCTION), p3, args);
        }
        if (defs_1.istensor(p1)) {
          return simplify_tensor(p1);
        }
        if (find_1.Find(p1, defs_1.symbol(defs_1.FACTORIAL))) {
          const p2 = simfac_1.simfac(p1);
          const p3 = simfac_1.simfac(rationalize_1.rationalize(p1));
          p1 = count_1.count(p2) < count_1.count(p3) ? p2 : p3;
        }
        p1 = f10(p1);
        p1 = f1(p1);
        p1 = f2(p1);
        p1 = f3(p1);
        p1 = f4(p1);
        p1 = f5(p1);
        p1 = f9(p1);
        [p1] = simplify_polarRect(p1);
        if (defs_1.do_simplify_nested_radicals) {
          let simplify_nested_radicalsResult;
          [simplify_nested_radicalsResult, p1] = simplify_nested_radicals(p1);
          if (simplify_nested_radicalsResult) {
            if (defs_1.DEBUG) {
              console.log("de-nesting successful into: " + p1.toString());
            }
            return simplify(p1);
          }
        }
        [p1] = simplify_rectToClock(p1);
        p1 = simplify_rational_expressions(p1);
        return p1;
      }
      exports.simplify = simplify;
      function simplify_tensor(p1) {
        let p2 = alloc_1.alloc_tensor(p1.tensor.nelem);
        p2.tensor.ndim = p1.tensor.ndim;
        p2.tensor.dim = Array.from(p1.tensor.dim);
        p2.tensor.elem = p1.tensor.elem.map(simplify);
        tensor_1.check_tensor_dimensions(p2);
        if (is_1.isZeroAtomOrTensor(p2)) {
          p2 = defs_1.Constants.zero;
        }
        return p2;
      }
      function f1(p1) {
        if (!defs_1.isadd(p1)) {
          return p1;
        }
        const p2 = rationalize_1.rationalize(p1);
        if (count_1.count(p2) < count_1.count(p1)) {
          p1 = p2;
        }
        return p1;
      }
      function f2(p1) {
        if (!defs_1.isadd(p1)) {
          return p1;
        }
        const p2 = condense_1.Condense(p1);
        if (count_1.count(p2) <= count_1.count(p1)) {
          p1 = p2;
        }
        return p1;
      }
      function f3(p1) {
        const p2 = rationalize_1.rationalize(multiply_1.negate(rationalize_1.rationalize(multiply_1.negate(rationalize_1.rationalize(p1)))));
        if (count_1.count(p2) < count_1.count(p1)) {
          p1 = p2;
        }
        return p1;
      }
      function f10(p1) {
        const carp1 = defs_1.car(p1);
        if (carp1 === defs_1.symbol(defs_1.MULTIPLY) || defs_1.isinnerordot(p1)) {
          if (defs_1.car(defs_1.car(defs_1.cdr(p1))) === defs_1.symbol(defs_1.TRANSPOSE) && defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(p1)))) === defs_1.symbol(defs_1.TRANSPOSE)) {
            if (defs_1.DEBUG) {
              console.log(`maybe collecting a transpose ${p1}`);
            }
            const a = defs_1.cadr(defs_1.car(defs_1.cdr(p1)));
            const b = defs_1.cadr(defs_1.car(defs_1.cdr(defs_1.cdr(p1))));
            let arg1;
            if (carp1 === defs_1.symbol(defs_1.MULTIPLY)) {
              arg1 = multiply_1.multiply(a, b);
            } else if (defs_1.isinnerordot(p1)) {
              arg1 = inner_1.inner(b, a);
            } else {
              arg1 = stack_1.pop();
            }
            const p2 = defs_1.noexpand(() => {
              return transpose_1.transpose(arg1, defs_1.Constants.one, bignum_1.integer(2));
            });
            if (count_1.count(p2) < count_1.count(p1)) {
              p1 = p2;
            }
            if (defs_1.DEBUG) {
              console.log(`collecting a transpose ${p2}`);
            }
          }
        }
        return p1;
      }
      function f4(p1) {
        if (is_1.isZeroAtomOrTensor(p1)) {
          return p1;
        }
        const p2 = rationalize_1.rationalize(multiply_1.inverse(rationalize_1.rationalize(multiply_1.inverse(rationalize_1.rationalize(p1)))));
        if (count_1.count(p2) < count_1.count(p1)) {
          p1 = p2;
        }
        return p1;
      }
      function simplify_trig(p1) {
        return f5(p1);
      }
      exports.simplify_trig = simplify_trig;
      function f5(p1) {
        if (!find_1.Find(p1, defs_1.symbol(defs_1.SIN)) && !find_1.Find(p1, defs_1.symbol(defs_1.COS))) {
          return p1;
        }
        const p2 = p1;
        defs_1.defs.trigmode = 1;
        let p3 = eval_1.Eval(p2);
        defs_1.defs.trigmode = 2;
        let p4 = eval_1.Eval(p2);
        defs_1.defs.trigmode = 0;
        if (count_1.count(p4) < count_1.count(p3) || nterms(p4) < nterms(p3)) {
          p3 = p4;
        }
        if (count_1.count(p3) < count_1.count(p1) || nterms(p3) < nterms(p1)) {
          p1 = p3;
        }
        return p1;
      }
      function f9(p1) {
        if (!defs_1.isadd(p1)) {
          return p1;
        }
        let p2 = defs_1.cdr(p1);
        if (defs_1.iscons(p2)) {
          p2 = [...p2].reduce((acc, p) => simplify_rational_expressions(add_1.add(acc, simplify(p))), defs_1.Constants.zero);
        }
        if (count_1.count(p2) < count_1.count(p1)) {
          p1 = p2;
        }
        return p1;
      }
      function simplify_rational_expressions(p1) {
        var denom, num, p2, polyVar, theGCD;
        denom = denominator_1.denominator(p1);
        if (is_1.isone(denom)) {
          return p1;
        }
        num = numerator_1.numerator(p1);
        if (is_1.isone(num)) {
          return p1;
        }
        if (!(polyVar = gcd_1.areunivarpolysfactoredorexpandedform(num, denom))) {
          return p1;
        }
        theGCD = factor_1.factor(gcd_1.gcd(num, denom), polyVar);
        if (is_1.isone(theGCD)) {
          return p1;
        }
        let factoredNum = factor_1.factor(num, polyVar);
        let theGCDInverse = multiply_1.inverse(theGCD);
        let multipliedNoeExpandNum = multiply_1.multiply_noexpand(factoredNum, theGCDInverse);
        let simplifiedNum = simplify(multipliedNoeExpandNum);
        let factoredDenom = factor_1.factor(denom, polyVar);
        let multipliedNoeExpandDenom = multiply_1.multiply_noexpand(factoredDenom, theGCDInverse);
        let simplifiedDenom = simplify(multipliedNoeExpandDenom);
        let numDividedDenom = multiply_1.divide(simplifiedNum, simplifiedDenom);
        p2 = condense_1.Condense(numDividedDenom);
        if (count_1.count(p2) < count_1.count(p1)) {
          return p2;
        } else {
          return p1;
        }
      }
      function simplify_rectToClock(p1) {
        let p2;
        if (!find_1.Find(p1, defs_1.symbol(defs_1.SIN)) && !find_1.Find(p1, defs_1.symbol(defs_1.COS))) {
          return [p1];
        }
        p2 = clock_1.clockform(eval_1.Eval(p1));
        if (defs_1.DEBUG) {
          console.log(`before simplification clockform: ${p1} after: ${p2}`);
        }
        if (count_1.count(p2) < count_1.count(p1)) {
          p1 = p2;
        }
        return [p1];
      }
      function simplify_polarRect(p1) {
        const tmp = polarRectAMinusOneBase(p1);
        const p2 = eval_1.Eval(tmp);
        if (count_1.count(p2) < count_1.count(p1)) {
          p1 = p2;
        }
        return [p1];
      }
      function polarRectAMinusOneBase(p1) {
        if (is_1.isimaginaryunit(p1)) {
          return p1;
        }
        if (misc_1.equal(defs_1.car(p1), defs_1.symbol(defs_1.POWER)) && is_1.isminusone(defs_1.cadr(p1))) {
          const base = multiply_1.negate(defs_1.Constants.one);
          const exponent = polarRectAMinusOneBase(defs_1.caddr(p1));
          return rect_1.rect(polar_1.polar(power_1.power(base, exponent)));
        }
        if (defs_1.iscons(p1)) {
          const arr = [];
          while (defs_1.iscons(p1)) {
            arr.push(polarRectAMinusOneBase(defs_1.car(p1)));
            p1 = defs_1.cdr(p1);
          }
          return list_1.makeList(...arr);
        }
        return p1;
      }
      function nterms(p) {
        if (!defs_1.isadd(p)) {
          return 1;
        } else {
          return misc_1.length(p) - 1;
        }
      }
      function simplify_nested_radicals(p1) {
        if (defs_1.defs.recursionLevelNestedRadicalsRemoval > 0) {
          if (defs_1.DEBUG) {
            console.log("denesting bailing out because of too much recursion");
          }
          return [false, p1];
        }
        const [simplificationWithoutCondense, somethingSimplified] = take_care_of_nested_radicals(p1);
        const simplificationWithCondense = defs_1.noexpand(condense_1.yycondense, simplificationWithoutCondense);
        p1 = count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.POWER), simplificationWithoutCondense) < count_1.countOccurrencesOfSymbol(defs_1.symbol(defs_1.POWER), simplificationWithCondense) ? simplificationWithoutCondense : simplificationWithCondense;
        return [somethingSimplified, p1];
      }
      function take_care_of_nested_radicals(p1) {
        if (defs_1.defs.recursionLevelNestedRadicalsRemoval > 0) {
          if (defs_1.DEBUG) {
            console.log("denesting bailing out because of too much recursion");
          }
          return [p1, false];
        }
        if (misc_1.equal(defs_1.car(p1), defs_1.symbol(defs_1.POWER))) {
          return _nestedPowerSymbol(p1);
        }
        if (defs_1.iscons(p1)) {
          return _nestedCons(p1);
        }
        return [p1, false];
      }
      function _nestedPowerSymbol(p1) {
        const base = defs_1.cadr(p1);
        const exponent = defs_1.caddr(p1);
        if (is_1.isminusone(exponent) || !misc_1.equal(defs_1.car(base), defs_1.symbol(defs_1.ADD)) || !is_1.isfraction(exponent) || !is_1.equalq(exponent, 1, 3) && !is_1.equalq(exponent, 1, 2)) {
          return [p1, false];
        }
        const firstTerm = defs_1.cadr(base);
        take_care_of_nested_radicals(firstTerm);
        const secondTerm = defs_1.caddr(base);
        take_care_of_nested_radicals(secondTerm);
        let numberOfTerms = 0;
        let countingTerms = base;
        while (defs_1.cdr(countingTerms) !== defs_1.symbol(defs_1.NIL)) {
          numberOfTerms++;
          countingTerms = defs_1.cdr(countingTerms);
        }
        if (numberOfTerms > 2) {
          return [p1, false];
        }
        const { commonBases, termsThatAreNotPowers } = _listAll(secondTerm);
        if (commonBases.length === 0) {
          return [p1, false];
        }
        const A = firstTerm;
        const C = commonBases.reduce(multiply_1.multiply, defs_1.Constants.one);
        const B = termsThatAreNotPowers.reduce(multiply_1.multiply, defs_1.Constants.one);
        let temp;
        if (is_1.equalq(exponent, 1, 3)) {
          const checkSize1 = multiply_1.divide(multiply_1.multiply(multiply_1.negate(A), C), B);
          const result1 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize1)));
          if (Math.abs(result1) > Math.pow(2, 32)) {
            return [p1, false];
          }
          const checkSize2 = multiply_1.multiply(bignum_1.integer(3), C);
          const result2 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize2)));
          if (Math.abs(result2) > Math.pow(2, 32)) {
            return [p1, false];
          }
          const arg1b = multiply_1.multiply(checkSize2, defs_1.symbol(defs_1.SECRETX));
          const checkSize3 = multiply_1.divide(multiply_1.multiply(bignum_1.integer(-3), A), B);
          const result3 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize3)));
          if (Math.abs(result3) > Math.pow(2, 32)) {
            return [p1, false];
          }
          const result = add_1.add_all([
            checkSize1,
            arg1b,
            multiply_1.multiply(checkSize3, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2))),
            multiply_1.multiply(defs_1.Constants.one, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(3)))
          ]);
          temp = result;
        } else if (is_1.equalq(exponent, 1, 2)) {
          const result1 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(C)));
          if (Math.abs(result1) > Math.pow(2, 32)) {
            return [p1, false];
          }
          const checkSize = multiply_1.divide(multiply_1.multiply(bignum_1.integer(-2), A), B);
          const result2 = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(checkSize)));
          if (Math.abs(result2) > Math.pow(2, 32)) {
            return [p1, false];
          }
          temp = add_1.add(C, add_1.add(multiply_1.multiply(checkSize, defs_1.symbol(defs_1.SECRETX)), multiply_1.multiply(defs_1.Constants.one, power_1.power(defs_1.symbol(defs_1.SECRETX), bignum_1.integer(2)))));
        }
        defs_1.defs.recursionLevelNestedRadicalsRemoval++;
        const r = roots_1.roots(temp, defs_1.symbol(defs_1.SECRETX));
        defs_1.defs.recursionLevelNestedRadicalsRemoval--;
        if (misc_1.equal(r[r.length - 1], defs_1.symbol(defs_1.NIL))) {
          if (defs_1.DEBUG) {
            console.log("roots bailed out because of too much recursion");
          }
          return [p1, false];
        }
        const possibleSolutions = r[r.length - 1].elem.filter((sol) => !find_1.Find(sol, defs_1.symbol(defs_1.POWER)));
        if (possibleSolutions.length === 0) {
          return [p1, false];
        }
        const possibleRationalSolutions = [];
        const realOfpossibleRationalSolutions = [];
        for (const i of Array.from(possibleSolutions)) {
          const result = bignum_1.nativeDouble(float_1.yyfloat(real_1.real(i)));
          possibleRationalSolutions.push(i);
          realOfpossibleRationalSolutions.push(result);
        }
        const whichRationalSolution = realOfpossibleRationalSolutions.indexOf(Math.max.apply(Math, realOfpossibleRationalSolutions));
        const SOLUTION = possibleRationalSolutions[whichRationalSolution];
        if (!is_1.equalq(exponent, 1, 3) && !is_1.equalq(exponent, 1, 2)) {
          return [p1, false];
        }
        if (is_1.equalq(exponent, 1, 3)) {
          const lowercase_b = power_1.power(multiply_1.divide(A, add_1.add(power_1.power(SOLUTION, bignum_1.integer(3)), multiply_1.multiply(multiply_1.multiply(bignum_1.integer(3), C), SOLUTION))), bignum_1.rational(1, 3));
          const lowercase_a = multiply_1.multiply(lowercase_b, SOLUTION);
          const result = simplify(add_1.add(multiply_1.multiply(lowercase_b, power_1.power(C, bignum_1.rational(1, 2))), lowercase_a));
          return [result, true];
        }
        if (is_1.equalq(exponent, 1, 2)) {
          const lowercase_b = power_1.power(multiply_1.divide(A, add_1.add(power_1.power(SOLUTION, bignum_1.integer(2)), C)), bignum_1.rational(1, 2));
          const lowercase_a = multiply_1.multiply(lowercase_b, SOLUTION);
          const possibleNewExpression = simplify(add_1.add(multiply_1.multiply(lowercase_b, power_1.power(C, bignum_1.rational(1, 2))), lowercase_a));
          const possibleNewExpressionValue = float_1.yyfloat(real_1.real(possibleNewExpression));
          if (!is_1.isnegativenumber(possibleNewExpressionValue)) {
            return [possibleNewExpression, true];
          }
          const result = simplify(add_1.add(multiply_1.multiply(multiply_1.negate(lowercase_b), power_1.power(C, bignum_1.rational(1, 2))), multiply_1.negate(lowercase_a)));
          return [result, true];
        }
        return [null, true];
      }
      function _listAll(secondTerm) {
        let commonInnerExponent = null;
        const commonBases = [];
        const termsThatAreNotPowers = [];
        if (defs_1.ismultiply(secondTerm)) {
          let secondTermFactor = defs_1.cdr(secondTerm);
          if (defs_1.iscons(secondTermFactor)) {
            while (defs_1.iscons(secondTermFactor)) {
              const potentialPower = defs_1.car(secondTermFactor);
              if (defs_1.ispower(potentialPower)) {
                const innerbase = defs_1.cadr(potentialPower);
                const innerexponent = defs_1.caddr(potentialPower);
                if (is_1.equalq(innerexponent, 1, 2)) {
                  if (commonInnerExponent == null) {
                    commonInnerExponent = innerexponent;
                    commonBases.push(innerbase);
                  } else if (misc_1.equal(innerexponent, commonInnerExponent)) {
                    commonBases.push(innerbase);
                  }
                }
              } else {
                termsThatAreNotPowers.push(potentialPower);
              }
              secondTermFactor = defs_1.cdr(secondTermFactor);
            }
          }
        } else if (defs_1.ispower(secondTerm)) {
          const innerbase = defs_1.cadr(secondTerm);
          const innerexponent = defs_1.caddr(secondTerm);
          if (commonInnerExponent == null && is_1.equalq(innerexponent, 1, 2)) {
            commonInnerExponent = innerexponent;
            commonBases.push(innerbase);
          }
        }
        return { commonBases, termsThatAreNotPowers };
      }
      function _nestedCons(p1) {
        let anyRadicalSimplificationWorked = false;
        const arr = [];
        if (defs_1.iscons(p1)) {
          const items = Array.from(p1).map((p) => {
            if (!anyRadicalSimplificationWorked) {
              let p2;
              [p2, anyRadicalSimplificationWorked] = take_care_of_nested_radicals(p);
              return p2;
            }
            return p;
          });
          arr.push(...items);
        }
        return [list_1.makeList(...arr), anyRadicalSimplificationWorked];
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/abs.js
  var require_abs = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/abs.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.absval = exports.abs = exports.absValFloat = exports.Eval_abs = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var conj_1 = require_conj();
      var denominator_1 = require_denominator();
      var eval_1 = require_eval();
      var float_1 = require_float();
      var imag_1 = require_imag();
      var inner_1 = require_inner();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var numerator_1 = require_numerator();
      var power_1 = require_power();
      var real_1 = require_real();
      var rect_1 = require_rect();
      var simplify_1 = require_simplify();
      var DEBUG_ABS = false;
      function Eval_abs(p1) {
        const result = abs(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_abs = Eval_abs;
      function absValFloat(p1) {
        return float_1.zzfloat(eval_1.Eval(absval(eval_1.Eval(p1))));
      }
      exports.absValFloat = absValFloat;
      function abs(p1) {
        const numer = numerator_1.numerator(p1);
        const absNumer = absval(numer);
        const denom = denominator_1.denominator(p1);
        const absDenom = absval(denom);
        const result = multiply_1.divide(absNumer, absDenom);
        if (DEBUG_ABS) {
          console.trace(">>>>  ABS of " + p1);
          console.log(`ABS numerator ${numer}`);
          console.log(`ABSVAL numerator: ${absNumer}`);
          console.log(`ABS denominator: ${denom}`);
          console.log(`ABSVAL denominator: ${absDenom}`);
          console.log(`ABSVAL divided: ${result}`);
          console.log("<<<<<<<  ABS");
        }
        return result;
      }
      exports.abs = abs;
      function absval(p1) {
        const input = p1;
        if (DEBUG_ABS) {
          console.log(`ABS of ${p1}`);
        }
        if (is_1.isZeroAtomOrTensor(p1)) {
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} just zero`);
            console.log(" --> ABS of " + input + " : " + defs_1.Constants.zero);
          }
          return defs_1.Constants.zero;
        }
        if (is_1.isnegativenumber(p1)) {
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} just a negative`);
          }
          return multiply_1.negate(p1);
        }
        if (is_1.ispositivenumber(p1)) {
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} just a positive`);
            console.log(` --> ABS of ${input} : ${p1}`);
          }
          return p1;
        }
        if (p1 === defs_1.symbol(defs_1.PI)) {
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} of PI`);
            console.log(` --> ABS of ${input} : ${p1}`);
          }
          return p1;
        }
        if (defs_1.isadd(p1) && (find_1.findPossibleClockForm(p1, p1) || find_1.findPossibleExponentialForm(p1) || find_1.Find(p1, defs_1.Constants.imaginaryunit))) {
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} is a sum`);
            console.log("abs of a sum");
          }
          p1 = rect_1.rect(p1);
          const result = simplify_1.simplify_trig(power_1.power(add_1.add(power_1.power(real_1.real(p1), bignum_1.integer(2)), power_1.power(imag_1.imag(p1), bignum_1.integer(2))), bignum_1.rational(1, 2)));
          if (DEBUG_ABS) {
            console.log(` --> ABS of ${input} : ${result}`);
          }
          return result;
        }
        if (defs_1.ispower(p1) && is_1.equaln(defs_1.cadr(p1), -1)) {
          const one = defs_1.Constants.One();
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} is -1 to any power`);
            const msg = defs_1.defs.evaluatingAsFloats ? " abs: numeric, so result is 1.0" : " abs: symbolic, so result is 1";
            console.log(msg);
            console.log(` --> ABS of ${input} : ${one}`);
          }
          return one;
        }
        if (defs_1.ispower(p1) && is_1.ispositivenumber(defs_1.caddr(p1))) {
          const result = power_1.power(abs(defs_1.cadr(p1)), defs_1.caddr(p1));
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} is something to the power of a positive number`);
            console.log(` --> ABS of ${input} : ${result}`);
          }
          return result;
        }
        if (defs_1.ispower(p1) && defs_1.cadr(p1) === defs_1.symbol(defs_1.E)) {
          const result = misc_1.exponential(real_1.real(defs_1.caddr(p1)));
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} is an exponential`);
            console.log(` --> ABS of ${input} : ${result}`);
          }
          return result;
        }
        if (defs_1.ismultiply(p1)) {
          const result = p1.tail().map(absval).reduce(multiply_1.multiply);
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} is a product`);
            console.log(` --> ABS of ${input} : ${result}`);
          }
          return result;
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ABS)) {
          const absOfAbs = list_1.makeList(defs_1.symbol(defs_1.ABS), defs_1.cadr(p1));
          if (DEBUG_ABS) {
            console.log(` abs: ${p1} is abs of a abs`);
            console.log(` --> ABS of ${input} : ${absOfAbs}`);
          }
          return absOfAbs;
        }
        if (defs_1.istensor(p1)) {
          return absval_tensor(p1);
        }
        if (is_1.isnegativeterm(p1) || defs_1.isadd(p1) && is_1.isnegativeterm(defs_1.cadr(p1))) {
          p1 = multiply_1.negate(p1);
        }
        const l = list_1.makeList(defs_1.symbol(defs_1.ABS), p1);
        if (DEBUG_ABS) {
          console.log(` abs: ${p1} is nothing decomposable`);
          console.log(` --> ABS of ${input} : ${l}`);
        }
        return l;
      }
      exports.absval = absval;
      function absval_tensor(p1) {
        if (p1.tensor.ndim !== 1) {
          run_1.stop("abs(tensor) with tensor rank > 1");
        }
        return eval_1.Eval(simplify_1.simplify(power_1.power(inner_1.inner(p1, conj_1.conjugate(p1)), bignum_1.rational(1, 2))));
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/approxratio.js
  var require_approxratio = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/approxratio.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.testApprox = exports.approxAll = exports.approxRationalsOfLogs = exports.approxRadicals = exports.Eval_approxratio = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var float_1 = require_float();
      var list_1 = require_list();
      var tensor_1 = require_tensor();
      function Eval_approxratio(p1) {
        stack_1.push(approxratioRecursive(defs_1.cadr(p1)));
      }
      exports.Eval_approxratio = Eval_approxratio;
      function approxratioRecursive(expr) {
        if (defs_1.istensor(expr)) {
          const p4 = alloc_1.alloc_tensor(expr.tensor.nelem);
          p4.tensor.ndim = expr.tensor.ndim;
          p4.tensor.dim = Array.from(expr.tensor.dim);
          p4.tensor.elem = p4.tensor.elem.map((el) => {
            const result = approxratioRecursive(el);
            tensor_1.check_tensor_dimensions(p4);
            return result;
          });
          return p4;
        }
        if (expr.k === defs_1.DOUBLE) {
          return approxOneRatioOnly(expr);
        }
        if (defs_1.iscons(expr)) {
          return new defs_1.Cons(approxratioRecursive(defs_1.car(expr)), approxratioRecursive(defs_1.cdr(expr)));
        }
        return expr;
      }
      function approxOneRatioOnly(p1) {
        const supposedlyTheFloat = float_1.zzfloat(p1);
        if (supposedlyTheFloat.k === defs_1.DOUBLE) {
          const theFloat = supposedlyTheFloat.d;
          const splitBeforeAndAfterDot = theFloat.toString().split(".");
          if (splitBeforeAndAfterDot.length === 2) {
            const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
            const precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
            const theRatio = floatToRatioRoutine(theFloat, precision);
            return bignum_1.rational(theRatio[0], theRatio[1]);
          }
          return bignum_1.integer(theFloat);
        }
        return list_1.makeList(defs_1.symbol(defs_1.APPROXRATIO), supposedlyTheFloat);
      }
      function floatToRatioRoutine(decimal, AccuracyFactor) {
        if (isNaN(decimal)) {
          return [0, 0];
        }
        if (decimal === Infinity) {
          return [1, 0];
        }
        if (decimal === -Infinity) {
          return [-1, 0];
        }
        const DecimalSign = decimal < 0 ? -1 : 1;
        decimal = Math.abs(decimal);
        if (Math.abs(decimal - Math.floor(decimal)) < AccuracyFactor) {
          const FractionNumerator2 = decimal * DecimalSign;
          const FractionDenominator2 = 1;
          return [FractionNumerator2, FractionDenominator2];
        }
        if (decimal < 1e-19) {
          const FractionNumerator2 = DecimalSign;
          const FractionDenominator2 = 1e19;
          return [FractionNumerator2, FractionDenominator2];
        }
        if (decimal > 1e19) {
          const FractionNumerator2 = 1e19 * DecimalSign;
          const FractionDenominator2 = 1;
          return [FractionNumerator2, FractionDenominator2];
        }
        let Z = decimal;
        let PreviousDenominator = 0;
        let FractionDenominator = 1;
        let FractionNumerator = void 0;
        while (true) {
          Z = 1 / (Z - Math.floor(Z));
          const temp = FractionDenominator;
          FractionDenominator = FractionDenominator * Math.floor(Z) + PreviousDenominator;
          PreviousDenominator = temp;
          FractionNumerator = Math.floor(decimal * FractionDenominator + 0.5);
          if (!(Math.abs(decimal - FractionNumerator / FractionDenominator) > AccuracyFactor) || Z === Math.floor(Z)) {
            break;
          }
        }
        FractionNumerator = DecimalSign * FractionNumerator;
        return [FractionNumerator, FractionDenominator];
      }
      var approx_just_an_integer = 0;
      var approx_sine_of_rational = 1;
      var approx_sine_of_pi_times_rational = 2;
      var approx_rationalOfPi = 3;
      var approx_radicalOfRatio = 4;
      var approx_ratioOfRadical = 6;
      var approx_rationalOfE = 7;
      var approx_logarithmsOfRationals = 8;
      var approx_rationalsOfLogarithms = 9;
      function approxRationalsOfRadicals(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i of [2, 3, 5, 6, 7, 8, 10]) {
          for (let j = 1; j <= 10; j++) {
            let error, likelyMultiplier, ratio;
            const hypothesis = Math.sqrt(i) / j;
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (error < 2 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * sqrt( ${i} ) / ${j}`;
                bestResultSoFar = [
                  result,
                  approx_ratioOfRadical,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      function approxRadicalsOfRationals(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i of [1, 2, 3, 5, 6, 7, 8, 10]) {
          for (let j of [1, 2, 3, 5, 6, 7, 8, 10]) {
            let error, likelyMultiplier, ratio;
            const hypothesis = Math.sqrt(i / j);
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (error < 2 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * (sqrt( ${i} / ${j} )`;
                bestResultSoFar = [
                  result,
                  approx_radicalOfRatio,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      function approxRadicals(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        const approxRationalsOfRadicalsResult = approxRationalsOfRadicals(theFloat);
        if (approxRationalsOfRadicalsResult != null) {
          return approxRationalsOfRadicalsResult;
        }
        const approxRadicalsOfRationalsResult = approxRadicalsOfRationals(theFloat);
        if (approxRadicalsOfRationalsResult != null) {
          return approxRadicalsOfRationalsResult;
        }
        return null;
      }
      exports.approxRadicals = approxRadicals;
      function approxLogs(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        const approxRationalsOfLogsResult = approxRationalsOfLogs(theFloat);
        if (approxRationalsOfLogsResult != null) {
          return approxRationalsOfLogsResult;
        }
        const approxLogsOfRationalsResult = approxLogsOfRationals(theFloat);
        if (approxLogsOfRationalsResult != null) {
          return approxLogsOfRationalsResult;
        }
        return null;
      }
      function approxRationalsOfLogs(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i = 2; i <= 5; i++) {
          for (let j = 1; j <= 5; j++) {
            let error, likelyMultiplier, ratio;
            const hypothesis = Math.log(i) / j;
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (likelyMultiplier !== 1 && Math.abs(Math.floor(likelyMultiplier / j)) === Math.abs(likelyMultiplier / j)) {
              continue;
            }
            if (error < 2.2 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * log( ${i} ) / ${j}`;
                bestResultSoFar = [
                  result,
                  approx_rationalsOfLogarithms,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      exports.approxRationalsOfLogs = approxRationalsOfLogs;
      function approxLogsOfRationals(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 5; j++) {
            let error, likelyMultiplier, ratio;
            const hypothesis = Math.log(i / j);
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (error < 1.96 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * log( ${i} / ${j} )`;
                bestResultSoFar = [
                  result,
                  approx_logarithmsOfRationals,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      function approxRationalsOfPowersOfE(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i = 1; i <= 2; i++) {
          for (let j = 1; j <= 12; j++) {
            let error, likelyMultiplier, ratio;
            const hypothesis = Math.pow(Math.E, i) / j;
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (error < 2 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * (e ^ ${i} ) / ${j}`;
                bestResultSoFar = [
                  result,
                  approx_rationalOfE,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      function approxRationalsOfPowersOfPI(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 12; j++) {
            let error, likelyMultiplier, ratio;
            const hypothesis = Math.pow(Math.PI, i) / j;
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (error < 2 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * (pi ^ ${i} ) / ${j} )`;
                bestResultSoFar = [
                  result,
                  approx_rationalOfPi,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      function approxTrigonometric(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        const approxSineOfRationalsResult = approxSineOfRationals(theFloat);
        if (approxSineOfRationalsResult != null) {
          return approxSineOfRationalsResult;
        }
        const approxSineOfRationalMultiplesOfPIResult = approxSineOfRationalMultiplesOfPI(theFloat);
        if (approxSineOfRationalMultiplesOfPIResult != null) {
          return approxSineOfRationalMultiplesOfPIResult;
        }
        return null;
      }
      function approxSineOfRationals(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i = 1; i <= 4; i++) {
          for (let j = 1; j <= 4; j++) {
            let error, likelyMultiplier, ratio;
            const fraction = i / j;
            const hypothesis = Math.sin(fraction);
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (error < 2 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * sin( ${i}/${j} )`;
                bestResultSoFar = [
                  result,
                  approx_sine_of_rational,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      function approxSineOfRationalMultiplesOfPI(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let bestResultSoFar = null;
        let minimumComplexity = Number.MAX_VALUE;
        for (let i = 1; i <= 13; i++) {
          for (let j = 1; j <= 13; j++) {
            let error, likelyMultiplier, ratio;
            const fraction = i / j;
            const hypothesis = Math.sin(Math.PI * fraction);
            if (Math.abs(hypothesis) > 1e-10) {
              ratio = theFloat / hypothesis;
              likelyMultiplier = Math.round(ratio);
              error = Math.abs(1 - ratio / likelyMultiplier);
            } else {
              ratio = 1;
              likelyMultiplier = 1;
              error = Math.abs(theFloat - hypothesis);
            }
            if (error < 23 * precision) {
              const complexity = simpleComplexityMeasure(likelyMultiplier, i, j);
              if (complexity < minimumComplexity) {
                minimumComplexity = complexity;
                const result = `${likelyMultiplier} * sin( ${i}/${j} * pi )`;
                bestResultSoFar = [
                  result,
                  approx_sine_of_pi_times_rational,
                  likelyMultiplier,
                  i,
                  j
                ];
              }
            }
          }
        }
        return bestResultSoFar;
      }
      function approxAll(theFloat) {
        let precision;
        const splitBeforeAndAfterDot = theFloat.toString().split(".");
        if (splitBeforeAndAfterDot.length === 2) {
          const numberOfDigitsAfterTheDot = splitBeforeAndAfterDot[1].length;
          precision = 1 / Math.pow(10, numberOfDigitsAfterTheDot);
        } else {
          return [
            "" + Math.floor(theFloat),
            approx_just_an_integer,
            Math.floor(theFloat),
            1,
            2
          ];
        }
        console.log(`precision: ${precision}`);
        let constantsSumMin = Number.MAX_VALUE;
        let constantsSum = 0;
        let bestApproxSoFar = null;
        const LOG_EXPLANATIONS = true;
        const approxRadicalsResult = approxRadicals(theFloat);
        if (approxRadicalsResult != null) {
          constantsSum = simpleComplexityMeasure(approxRadicalsResult);
          if (constantsSum < constantsSumMin) {
            if (LOG_EXPLANATIONS) {
              console.log(`better explanation by approxRadicals: ${approxRadicalsResult} complexity: ${constantsSum}`);
            }
            constantsSumMin = constantsSum;
            bestApproxSoFar = approxRadicalsResult;
          } else {
            if (LOG_EXPLANATIONS) {
              console.log(`subpar explanation by approxRadicals: ${approxRadicalsResult} complexity: ${constantsSum}`);
            }
          }
        }
        const approxLogsResult = approxLogs(theFloat);
        if (approxLogsResult != null) {
          constantsSum = simpleComplexityMeasure(approxLogsResult);
          if (constantsSum < constantsSumMin) {
            if (LOG_EXPLANATIONS) {
              console.log(`better explanation by approxLogs: ${approxLogsResult} complexity: ${constantsSum}`);
            }
            constantsSumMin = constantsSum;
            bestApproxSoFar = approxLogsResult;
          } else {
            if (LOG_EXPLANATIONS) {
              console.log(`subpar explanation by approxLogs: ${approxLogsResult} complexity: ${constantsSum}`);
            }
          }
        }
        const approxRationalsOfPowersOfEResult = approxRationalsOfPowersOfE(theFloat);
        if (approxRationalsOfPowersOfEResult != null) {
          constantsSum = simpleComplexityMeasure(approxRationalsOfPowersOfEResult);
          if (constantsSum < constantsSumMin) {
            if (LOG_EXPLANATIONS) {
              console.log(`better explanation by approxRationalsOfPowersOfE: ${approxRationalsOfPowersOfEResult} complexity: ${constantsSum}`);
            }
            constantsSumMin = constantsSum;
            bestApproxSoFar = approxRationalsOfPowersOfEResult;
          } else {
            if (LOG_EXPLANATIONS) {
              console.log(`subpar explanation by approxRationalsOfPowersOfE: ${approxRationalsOfPowersOfEResult} complexity: ${constantsSum}`);
            }
          }
        }
        const approxRationalsOfPowersOfPIResult = approxRationalsOfPowersOfPI(theFloat);
        if (approxRationalsOfPowersOfPIResult != null) {
          constantsSum = simpleComplexityMeasure(approxRationalsOfPowersOfPIResult);
          if (constantsSum < constantsSumMin) {
            if (LOG_EXPLANATIONS) {
              console.log(`better explanation by approxRationalsOfPowersOfPI: ${approxRationalsOfPowersOfPIResult} complexity: ${constantsSum}`);
            }
            constantsSumMin = constantsSum;
            bestApproxSoFar = approxRationalsOfPowersOfPIResult;
          } else {
            if (LOG_EXPLANATIONS) {
              console.log(`subpar explanation by approxRationalsOfPowersOfPI: ${approxRationalsOfPowersOfPIResult} complexity: ${constantsSum}`);
            }
          }
        }
        const approxTrigonometricResult = approxTrigonometric(theFloat);
        if (approxTrigonometricResult != null) {
          constantsSum = simpleComplexityMeasure(approxTrigonometricResult);
          if (constantsSum < constantsSumMin) {
            if (LOG_EXPLANATIONS) {
              console.log(`better explanation by approxTrigonometric: ${approxTrigonometricResult} complexity: ${constantsSum}`);
            }
            constantsSumMin = constantsSum;
            bestApproxSoFar = approxTrigonometricResult;
          } else {
            if (LOG_EXPLANATIONS) {
              console.log(`subpar explanation by approxTrigonometric: ${approxTrigonometricResult} complexity: ${constantsSum}`);
            }
          }
        }
        return bestApproxSoFar;
      }
      exports.approxAll = approxAll;
      function simpleComplexityMeasure(aResult, b, c) {
        let theSum = 0;
        if (aResult instanceof Array) {
          switch (aResult[1]) {
            case approx_sine_of_pi_times_rational:
              theSum = 4;
              break;
            case approx_rationalOfPi:
              theSum = Math.pow(4, Math.abs(aResult[3])) * Math.abs(aResult[2]);
              break;
            case approx_rationalOfE:
              theSum = Math.pow(3, Math.abs(aResult[3])) * Math.abs(aResult[2]);
              break;
            default:
              theSum = 0;
          }
          theSum += Math.abs(aResult[2]) * (Math.abs(aResult[3]) + Math.abs(aResult[4]));
        } else {
          theSum += Math.abs(aResult) * (Math.abs(b) + Math.abs(c));
        }
        if (aResult[2] === 1) {
          theSum -= 1;
        } else {
          theSum += 1;
        }
        if (aResult[3] === 1) {
          theSum -= 1;
        } else {
          theSum += 1;
        }
        if (aResult[4] === 1) {
          theSum -= 1;
        } else {
          theSum += 1;
        }
        if (theSum < 0) {
          theSum = 0;
        }
        return theSum;
      }
      function testApprox() {
        for (let i of [2, 3, 5, 6, 7, 8, 10]) {
          for (let j of [2, 3, 5, 6, 7, 8, 10]) {
            if (i === j) {
              continue;
            }
            console.log(`testapproxRadicals testing: 1 * sqrt( ${i} ) / ${j}`);
            const fraction = i / j;
            const value2 = Math.sqrt(i) / j;
            const returned = approxRadicals(value2);
            const returnedValue = returned[2] * Math.sqrt(returned[3]) / returned[4];
            if (Math.abs(value2 - returnedValue) > 1e-15) {
              console.log(`fail testapproxRadicals: 1 * sqrt( ${i} ) / ${j} . obtained: ${returned}`);
            }
          }
        }
        for (let i of [2, 3, 5, 6, 7, 8, 10]) {
          for (let j of [2, 3, 5, 6, 7, 8, 10]) {
            if (i === j) {
              continue;
            }
            console.log(`testapproxRadicals testing with 4 digits: 1 * sqrt( ${i} ) / ${j}`);
            const fraction = i / j;
            const originalValue = Math.sqrt(i) / j;
            const value2 = originalValue.toFixed(4);
            const returned = approxRadicals(Number(value2));
            const returnedValue = returned[2] * Math.sqrt(returned[3]) / returned[4];
            if (Math.abs(originalValue - returnedValue) > 1e-15) {
              console.log(`fail testapproxRadicals with 4 digits: 1 * sqrt( ${i} ) / ${j} . obtained: ${returned}`);
            }
          }
        }
        for (let i of [2, 3, 5, 6, 7, 8, 10]) {
          for (let j of [2, 3, 5, 6, 7, 8, 10]) {
            if (i === j) {
              continue;
            }
            console.log(`testapproxRadicals testing: 1 * sqrt( ${i} / ${j} )`);
            const fraction = i / j;
            const value2 = Math.sqrt(i / j);
            const returned = approxRadicals(value2);
            if (returned != null) {
              const returnedValue = returned[2] * Math.sqrt(returned[3] / returned[4]);
              if (returned[1] === approx_radicalOfRatio && Math.abs(value2 - returnedValue) > 1e-15) {
                console.log(`fail testapproxRadicals: 1 * sqrt( ${i} / ${j} ) . obtained: ${returned}`);
              }
            }
          }
        }
        for (let i of [1, 2, 3, 5, 6, 7, 8, 10]) {
          for (let j of [1, 2, 3, 5, 6, 7, 8, 10]) {
            if (i === 1 && j === 1) {
              continue;
            }
            console.log(`testapproxRadicals testing with 4 digits:: 1 * sqrt( ${i} / ${j} )`);
            const fraction = i / j;
            const originalValue = Math.sqrt(i / j);
            const value2 = originalValue.toFixed(4);
            const returned = approxRadicals(Number(value2));
            const returnedValue = returned[2] * Math.sqrt(returned[3] / returned[4]);
            if (returned[1] === approx_radicalOfRatio && Math.abs(originalValue - returnedValue) > 1e-15) {
              console.log(`fail testapproxRadicals with 4 digits:: 1 * sqrt( ${i} / ${j} ) . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 5; j++) {
            console.log(`testApproxAll testing: 1 * log(${i} ) / ${j}`);
            const fraction = i / j;
            const value2 = Math.log(i) / j;
            const returned = approxAll(value2);
            const returnedValue = returned[2] * Math.log(returned[3]) / returned[4];
            if (Math.abs(value2 - returnedValue) > 1e-15) {
              console.log(`fail testApproxAll: 1 * log(${i} ) / ${j} . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 5; j++) {
            console.log(`testApproxAll testing with 4 digits: 1 * log(${i} ) / ${j}`);
            const fraction = i / j;
            const originalValue = Math.log(i) / j;
            const value2 = originalValue.toFixed(4);
            const returned = approxAll(Number(value2));
            const returnedValue = returned[2] * Math.log(returned[3]) / returned[4];
            if (Math.abs(originalValue - returnedValue) > 1e-15) {
              console.log(`fail testApproxAll with 4 digits: 1 * log(${i} ) / ${j} . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 5; j++) {
            console.log(`testApproxAll testing: 1 * log(${i} / ${j} )}`);
            const fraction = i / j;
            const value2 = Math.log(i / j);
            const returned = approxAll(value2);
            const returnedValue = returned[2] * Math.log(returned[3] / returned[4]);
            if (Math.abs(value2 - returnedValue) > 1e-15) {
              console.log(`fail testApproxAll: 1 * log(${i} / ${j} ) . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 5; i++) {
          for (let j = 1; j <= 5; j++) {
            console.log(`testApproxAll testing with 4 digits: 1 * log(${i} / ${j} )`);
            const fraction = i / j;
            const originalValue = Math.log(i / j);
            const value2 = originalValue.toFixed(4);
            const returned = approxAll(Number(value2));
            const returnedValue = returned[2] * Math.log(returned[3] / returned[4]);
            if (Math.abs(originalValue - returnedValue) > 1e-15) {
              console.log(`fail testApproxAll with 4 digits: 1 * log(${i} / ${j} ) . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 2; i++) {
          for (let j = 1; j <= 12; j++) {
            console.log(`testApproxAll testing: 1 * (e ^ ${i} ) / ${j}`);
            const fraction = i / j;
            const value2 = Math.pow(Math.E, i) / j;
            const returned = approxAll(value2);
            const returnedValue = returned[2] * Math.pow(Math.E, returned[3]) / returned[4];
            if (Math.abs(value2 - returnedValue) > 1e-15) {
              console.log(`fail testApproxAll: 1 * (e ^ ${i} ) / ${j} . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 2; i++) {
          for (let j = 1; j <= 12; j++) {
            console.log(`approxRationalsOfPowersOfE testing with 4 digits: 1 * (e ^ ${i} ) / ${j}`);
            const fraction = i / j;
            const originalValue = Math.pow(Math.E, i) / j;
            const value2 = originalValue.toFixed(4);
            const returned = approxRationalsOfPowersOfE(Number(value2));
            const returnedValue = returned[2] * Math.pow(Math.E, returned[3]) / returned[4];
            if (Math.abs(originalValue - returnedValue) > 1e-15) {
              console.log(`fail approxRationalsOfPowersOfE with 4 digits: 1 * (e ^ ${i} ) / ${j} . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 2; i++) {
          for (let j = 1; j <= 12; j++) {
            console.log(`testApproxAll testing: 1 * pi ^ ${i} / ${j}`);
            const fraction = i / j;
            const value2 = Math.pow(Math.PI, i) / j;
            const returned = approxAll(value2);
            const returnedValue = returned[2] * Math.pow(Math.PI, returned[3]) / returned[4];
            if (Math.abs(value2 - returnedValue) > 1e-15) {
              console.log(`fail testApproxAll: 1 * pi ^ ${i} / ${j} ) . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 2; i++) {
          for (let j = 1; j <= 12; j++) {
            console.log(`approxRationalsOfPowersOfPI testing with 4 digits: 1 * pi ^ ${i} / ${j}`);
            const fraction = i / j;
            const originalValue = Math.pow(Math.PI, i) / j;
            const value2 = originalValue.toFixed(4);
            const returned = approxRationalsOfPowersOfPI(Number(value2));
            const returnedValue = returned[2] * Math.pow(Math.PI, returned[3]) / returned[4];
            if (Math.abs(originalValue - returnedValue) > 1e-15) {
              console.log(`fail approxRationalsOfPowersOfPI with 4 digits: 1 * pi ^ ${i} / ${j} ) . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 4; i++) {
          for (let j = 1; j <= 4; j++) {
            console.log(`testApproxAll testing: 1 * sin( ${i}/${j} )}`);
            const fraction = i / j;
            const value2 = Math.sin(fraction);
            const returned = approxAll(value2);
            const returnedFraction = returned[3] / returned[4];
            const returnedValue = returned[2] * Math.sin(returnedFraction);
            if (Math.abs(value2 - returnedValue) > 1e-15) {
              console.log(`fail testApproxAll: 1 * sin( ${i}/${j} ) . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 4; i++) {
          for (let j = 1; j <= 4; j++) {
            console.log(`testApproxAll testing with 5 digits: 1 * sin( ${i}/${j} )`);
            const fraction = i / j;
            const originalValue = Math.sin(fraction);
            const value2 = originalValue.toFixed(5);
            const returned = approxAll(Number(value2));
            if (returned == null) {
              console.log(`fail testApproxAll with 5 digits: 1 * sin( ${i}/${j} ) . obtained:  undefined `);
            }
            const returnedFraction = returned[3] / returned[4];
            const returnedValue = returned[2] * Math.sin(returnedFraction);
            const error = Math.abs(originalValue - returnedValue);
            if (error > 1e-14) {
              console.log(`fail testApproxAll with 5 digits: 1 * sin( ${i}/${j} ) . obtained: ${returned} error: ${error}`);
            }
          }
        }
        for (let i = 1; i <= 4; i++) {
          for (let j = 1; j <= 4; j++) {
            console.log(`testApproxAll testing with 4 digits: 1 * sin( ${i}/${j} )`);
            const fraction = i / j;
            const originalValue = Math.sin(fraction);
            const value2 = originalValue.toFixed(4);
            const returned = approxAll(Number(value2));
            if (returned == null) {
              console.log(`fail testApproxAll with 4 digits: 1 * sin( ${i}/${j} ) . obtained:  undefined `);
            }
            const returnedFraction = returned[3] / returned[4];
            const returnedValue = returned[2] * Math.sin(returnedFraction);
            const error = Math.abs(originalValue - returnedValue);
            if (error > 1e-14) {
              console.log(`fail testApproxAll with 4 digits: 1 * sin( ${i}/${j} ) . obtained: ${returned} error: ${error}`);
            }
          }
        }
        let value = 0;
        if (approxAll(value)[0] !== "0") {
          console.log("fail testApproxAll: 0");
        }
        value = 0;
        if (approxAll(value)[0] !== "0") {
          console.log("fail testApproxAll: 0.0");
        }
        value = 0;
        if (approxAll(value)[0] !== "0") {
          console.log("fail testApproxAll: 0.00");
        }
        value = 0;
        if (approxAll(value)[0] !== "0") {
          console.log("fail testApproxAll: 0.000");
        }
        value = 0;
        if (approxAll(value)[0] !== "0") {
          console.log("fail testApproxAll: 0.0000");
        }
        value = 1;
        if (approxAll(value)[0] !== "1") {
          console.log("fail testApproxAll: 1");
        }
        value = 1;
        if (approxAll(value)[0] !== "1") {
          console.log("fail testApproxAll: 1.0");
        }
        value = 1;
        if (approxAll(value)[0] !== "1") {
          console.log("fail testApproxAll: 1.00");
        }
        value = 1;
        if (approxAll(value)[0] !== "1") {
          console.log("fail testApproxAll: 1.000");
        }
        value = 1;
        if (approxAll(value)[0] !== "1") {
          console.log("fail testApproxAll: 1.0000");
        }
        value = 1;
        if (approxAll(value)[0] !== "1") {
          console.log("fail testApproxAll: 1.00000");
        }
        value = Math.sqrt(2);
        if (approxAll(value)[0] !== "1 * sqrt( 2 ) / 1") {
          console.log("fail testApproxAll: Math.sqrt(2)");
        }
        value = 1.41;
        if (approxAll(value)[0] !== "1 * sqrt( 2 ) / 1") {
          console.log("fail testApproxAll: 1.41");
        }
        value = 1.4;
        if (approxRadicals(value)[0] !== "1 * sqrt( 2 ) / 1") {
          console.log("fail approxRadicals: 1.4");
        }
        value = 0.6;
        if (approxLogs(value)[0] !== "1 * log( 2 ) / 1") {
          console.log("fail approxLogs: 0.6");
        }
        value = 0.69;
        if (approxLogs(value)[0] !== "1 * log( 2 ) / 1") {
          console.log("fail approxLogs: 0.69");
        }
        value = 0.7;
        if (approxLogs(value)[0] !== "1 * log( 2 ) / 1") {
          console.log("fail approxLogs: 0.7");
        }
        value = 1.09;
        if (approxLogs(value)[0] !== "1 * log( 3 ) / 1") {
          console.log("fail approxLogs: 1.09");
        }
        value = 1.09;
        if (approxAll(value)[0] !== "1 * log( 3 ) / 1") {
          console.log("fail approxAll: 1.09");
        }
        value = 1.098;
        if (approxAll(value)[0] !== "1 * log( 3 ) / 1") {
          console.log("fail approxAll: 1.098");
        }
        value = 1.1;
        if (approxAll(value)[0] !== "1 * log( 3 ) / 1") {
          console.log("fail approxAll: 1.1");
        }
        value = 1.11;
        if (approxAll(value)[0] !== "1 * log( 3 ) / 1") {
          console.log("fail approxAll: 1.11");
        }
        value = Math.sqrt(3);
        if (approxAll(value)[0] !== "1 * sqrt( 3 ) / 1") {
          console.log("fail testApproxAll: Math.sqrt(3)");
        }
        value = 1;
        if (approxAll(value)[0] !== "1") {
          console.log("fail testApproxAll: 1.0000");
        }
        value = 3.141592;
        if (approxAll(value)[0] !== "1 * (pi ^ 1 ) / 1 )") {
          console.log("fail testApproxAll: 3.141592");
        }
        value = 31.41592;
        if (approxAll(value)[0] !== "10 * (pi ^ 1 ) / 1 )") {
          console.log("fail testApproxAll: 31.41592");
        }
        value = 314.1592;
        if (approxAll(value)[0] !== "100 * (pi ^ 1 ) / 1 )") {
          console.log("fail testApproxAll: 314.1592");
        }
        value = 3141592653589793e-8;
        if (approxAll(value)[0] !== "10000000 * (pi ^ 1 ) / 1 )") {
          console.log("fail testApproxAll: 31415926.53589793");
        }
        value = Math.sqrt(2);
        if (approxTrigonometric(value)[0] !== "2 * sin( 1/4 * pi )") {
          console.log("fail approxTrigonometric: Math.sqrt(2)");
        }
        value = Math.sqrt(3);
        if (approxTrigonometric(value)[0] !== "2 * sin( 1/3 * pi )") {
          console.log("fail approxTrigonometric: Math.sqrt(3)");
        }
        value = (Math.sqrt(6) - Math.sqrt(2)) / 4;
        if (approxAll(value)[0] !== "1 * sin( 1/12 * pi )") {
          console.log("fail testApproxAll: (Math.sqrt(6) - Math.sqrt(2))/4");
        }
        value = Math.sqrt(2 - Math.sqrt(2)) / 2;
        if (approxAll(value)[0] !== "1 * sin( 1/8 * pi )") {
          console.log("fail testApproxAll: Math.sqrt(2 - Math.sqrt(2))/2");
        }
        value = (Math.sqrt(6) + Math.sqrt(2)) / 4;
        if (approxAll(value)[0] !== "1 * sin( 5/12 * pi )") {
          console.log("fail testApproxAll: (Math.sqrt(6) + Math.sqrt(2))/4");
        }
        value = Math.sqrt(2 + Math.sqrt(3)) / 2;
        if (approxAll(value)[0] !== "1 * sin( 5/12 * pi )") {
          console.log("fail testApproxAll: Math.sqrt(2 + Math.sqrt(3))/2");
        }
        value = (Math.sqrt(5) - 1) / 4;
        if (approxAll(value)[0] !== "1 * sin( 1/10 * pi )") {
          console.log("fail testApproxAll: (Math.sqrt(5) - 1)/4");
        }
        value = Math.sqrt(10 - 2 * Math.sqrt(5)) / 4;
        if (approxAll(value)[0] !== "1 * sin( 1/5 * pi )") {
          console.log("fail testApproxAll: Math.sqrt(10 - 2*Math.sqrt(5))/4");
        }
        value = Math.sin(Math.PI / 7);
        if (approxAll(value)[0] !== "1 * sin( 1/7 * pi )") {
          console.log("fail testApproxAll: Math.sin(Math.PI/7)");
        }
        value = Math.sin(Math.PI / 9);
        if (approxAll(value)[0] !== "1 * sin( 1/9 * pi )") {
          console.log("fail testApproxAll: Math.sin(Math.PI/9)");
        }
        value = 1836.15267;
        if (approxRationalsOfPowersOfPI(value)[0] !== "6 * (pi ^ 5 ) / 1 )") {
          console.log("fail approxRationalsOfPowersOfPI: 1836.15267");
        }
        for (let i = 1; i <= 13; i++) {
          for (let j = 1; j <= 13; j++) {
            console.log(`approxTrigonometric testing: 1 * sin( ${i}/${j} * pi )`);
            const fraction = i / j;
            value = Math.sin(Math.PI * fraction);
            const returned = approxTrigonometric(value);
            const returnedFraction = returned[3] / returned[4];
            const returnedValue = returned[2] * Math.sin(Math.PI * returnedFraction);
            if (Math.abs(value - returnedValue) > 1e-15) {
              console.log(`fail approxTrigonometric: 1 * sin( ${i}/${j} * pi ) . obtained: ${returned}`);
            }
          }
        }
        for (let i = 1; i <= 13; i++) {
          for (let j = 1; j <= 13; j++) {
            if (i === 5 && j === 11 || i === 6 && j === 11) {
              continue;
            }
            console.log(`approxTrigonometric testing with 4 digits: 1 * sin( ${i}/${j} * pi )`);
            const fraction = i / j;
            const originalValue = Math.sin(Math.PI * fraction);
            const value2 = originalValue.toFixed(4);
            const returned = approxTrigonometric(Number(value2));
            const returnedFraction = returned[3] / returned[4];
            const returnedValue = returned[2] * Math.sin(Math.PI * returnedFraction);
            const error = Math.abs(originalValue - returnedValue);
            if (error > 1e-14) {
              console.log(`fail approxTrigonometric with 4 digits: 1 * sin( ${i}/${j} * pi ) . obtained: ${returned} error: ${error}`);
            }
          }
        }
        return console.log("testApprox done");
      }
      exports.testApprox = testApprox;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/arccos.js
  var require_arccos = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/arccos.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_arccos = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function Eval_arccos(x) {
        stack_1.push(arccos(eval_1.Eval(defs_1.cadr(x))));
      }
      exports.Eval_arccos = Eval_arccos;
      function arccos(x) {
        if (defs_1.car(x) === defs_1.symbol(defs_1.COS)) {
          return defs_1.cadr(x);
        }
        if (defs_1.isdouble(x)) {
          return bignum_1.double(Math.acos(x.d));
        }
        if (is_1.isoneoversqrttwo(x) || defs_1.ismultiply(x) && is_1.equalq(defs_1.car(defs_1.cdr(x)), 1, 2) && defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(x)))) === defs_1.symbol(defs_1.POWER) && is_1.equaln(defs_1.car(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x))))), 2) && is_1.equalq(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x)))))), 1, 2)) {
          return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI / 4) : multiply_1.multiply(bignum_1.rational(1, 4), defs_1.symbol(defs_1.PI));
        }
        if (is_1.isminusoneoversqrttwo(x) || defs_1.ismultiply(x) && is_1.equalq(defs_1.car(defs_1.cdr(x)), -1, 2) && defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(x)))) === defs_1.symbol(defs_1.POWER) && is_1.equaln(defs_1.car(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x))))), 2) && is_1.equalq(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x)))))), 1, 2)) {
          return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI * 3 / 4) : multiply_1.multiply(bignum_1.rational(3, 4), defs_1.symbol(defs_1.PI));
        }
        if (is_1.isSqrtThreeOverTwo(x)) {
          return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI / 6) : multiply_1.multiply(bignum_1.rational(1, 6), defs_1.symbol(defs_1.PI));
        }
        if (is_1.isMinusSqrtThreeOverTwo(x)) {
          return defs_1.defs.evaluatingAsFloats ? bignum_1.double(5 * Math.PI / 6) : multiply_1.multiply(bignum_1.rational(5, 6), defs_1.symbol(defs_1.PI));
        }
        if (!defs_1.isrational(x)) {
          return list_1.makeList(defs_1.symbol(defs_1.ARCCOS), x);
        }
        const n = bignum_1.nativeInt(multiply_1.multiply(x, bignum_1.integer(2)));
        switch (n) {
          case -2:
            return defs_1.Constants.Pi();
          case -1:
            return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI * 2 / 3) : multiply_1.multiply(bignum_1.rational(2, 3), defs_1.symbol(defs_1.PI));
          case 0:
            return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI / 2) : multiply_1.multiply(bignum_1.rational(1, 2), defs_1.symbol(defs_1.PI));
          case 1:
            return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI / 3) : multiply_1.multiply(bignum_1.rational(1, 3), defs_1.symbol(defs_1.PI));
          case 2:
            return defs_1.Constants.Zero();
          default:
            return list_1.makeList(defs_1.symbol(defs_1.ARCCOS), x);
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/arccosh.js
  var require_arccosh = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/arccosh.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_arccosh = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_arccosh(x) {
        stack_1.push(arccosh(eval_1.Eval(defs_1.cadr(x))));
      }
      exports.Eval_arccosh = Eval_arccosh;
      function arccosh(x) {
        if (defs_1.car(x) === defs_1.symbol(defs_1.COSH)) {
          return defs_1.cadr(x);
        }
        if (defs_1.isdouble(x)) {
          let { d } = x;
          if (d < 1) {
            run_1.stop("arccosh function argument is less than 1.0");
          }
          d = Math.log(d + Math.sqrt(d * d - 1));
          return bignum_1.double(d);
        }
        if (is_1.isplusone(x)) {
          return defs_1.Constants.zero;
        }
        return list_1.makeList(defs_1.symbol(defs_1.ARCCOSH), x);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/arcsin.js
  var require_arcsin = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/arcsin.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_arcsin = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function Eval_arcsin(x) {
        stack_1.push(arcsin(eval_1.Eval(defs_1.cadr(x))));
      }
      exports.Eval_arcsin = Eval_arcsin;
      function arcsin(x) {
        if (defs_1.car(x) === defs_1.symbol(defs_1.SIN)) {
          return defs_1.cadr(x);
        }
        if (defs_1.isdouble(x)) {
          return bignum_1.double(Math.asin(x.d));
        }
        if (is_1.isoneoversqrttwo(x) || defs_1.ismultiply(x) && is_1.equalq(defs_1.car(defs_1.cdr(x)), 1, 2) && defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(x)))) === defs_1.symbol(defs_1.POWER) && is_1.equaln(defs_1.car(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x))))), 2) && is_1.equalq(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x)))))), 1, 2)) {
          return multiply_1.multiply(bignum_1.rational(1, 4), defs_1.symbol(defs_1.PI));
        }
        if (is_1.isminusoneoversqrttwo(x) || defs_1.ismultiply(x) && is_1.equalq(defs_1.car(defs_1.cdr(x)), -1, 2) && defs_1.car(defs_1.car(defs_1.cdr(defs_1.cdr(x)))) === defs_1.symbol(defs_1.POWER) && is_1.equaln(defs_1.car(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x))))), 2) && is_1.equalq(defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.car(defs_1.cdr(defs_1.cdr(x)))))), 1, 2)) {
          return defs_1.defs.evaluatingAsFloats ? bignum_1.double(-Math.PI / 4) : multiply_1.multiply(bignum_1.rational(-1, 4), defs_1.symbol(defs_1.PI));
        }
        if (is_1.isSqrtThreeOverTwo(x)) {
          return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI / 3) : multiply_1.multiply(bignum_1.rational(1, 3), defs_1.symbol(defs_1.PI));
        }
        if (is_1.isMinusSqrtThreeOverTwo(x)) {
          return defs_1.defs.evaluatingAsFloats ? bignum_1.double(-Math.PI / 3) : multiply_1.multiply(bignum_1.rational(-1, 3), defs_1.symbol(defs_1.PI));
        }
        if (!defs_1.isrational(x)) {
          return list_1.makeList(defs_1.symbol(defs_1.ARCSIN), x);
        }
        const n = bignum_1.nativeInt(multiply_1.multiply(x, bignum_1.integer(2)));
        switch (n) {
          case -2:
            return defs_1.defs.evaluatingAsFloats ? bignum_1.double(-Math.PI / 2) : multiply_1.multiply(bignum_1.rational(-1, 2), defs_1.symbol(defs_1.PI));
          case -1:
            return defs_1.defs.evaluatingAsFloats ? bignum_1.double(-Math.PI / 6) : multiply_1.multiply(bignum_1.rational(-1, 6), defs_1.symbol(defs_1.PI));
          case 0:
            return defs_1.Constants.Zero();
          case 1:
            return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI / 6) : multiply_1.multiply(bignum_1.rational(1, 6), defs_1.symbol(defs_1.PI));
          case 2:
            return defs_1.defs.evaluatingAsFloats ? bignum_1.double(Math.PI / 2) : multiply_1.multiply(bignum_1.rational(1, 2), defs_1.symbol(defs_1.PI));
          default:
            return list_1.makeList(defs_1.symbol(defs_1.ARCSIN), x);
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/arcsinh.js
  var require_arcsinh = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/arcsinh.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_arcsinh = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_arcsinh(x) {
        stack_1.push(arcsinh(eval_1.Eval(defs_1.cadr(x))));
      }
      exports.Eval_arcsinh = Eval_arcsinh;
      function arcsinh(x) {
        if (defs_1.car(x) === defs_1.symbol(defs_1.SINH)) {
          return defs_1.cadr(x);
        }
        if (defs_1.isdouble(x)) {
          let { d } = x;
          d = Math.log(d + Math.sqrt(d * d + 1));
          return bignum_1.double(d);
        }
        if (is_1.isZeroAtomOrTensor(x)) {
          return defs_1.Constants.zero;
        }
        return list_1.makeList(defs_1.symbol(defs_1.ARCSINH), x);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/arctanh.js
  var require_arctanh = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/arctanh.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_arctanh = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_arctanh(x) {
        stack_1.push(arctanh(eval_1.Eval(defs_1.cadr(x))));
      }
      exports.Eval_arctanh = Eval_arctanh;
      function arctanh(x) {
        if (defs_1.car(x) === defs_1.symbol(defs_1.TANH)) {
          return defs_1.cadr(x);
        }
        if (defs_1.isdouble(x)) {
          let { d } = x;
          if (d < -1 || d > 1) {
            run_1.stop("arctanh function argument is not in the interval [-1,1]");
          }
          d = Math.log((1 + d) / (1 - d)) / 2;
          return bignum_1.double(d);
        }
        if (is_1.isZeroAtomOrTensor(x)) {
          return defs_1.Constants.zero;
        }
        return list_1.makeList(defs_1.symbol(defs_1.ARCTANH), x);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/besselj.js
  var require_besselj = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/besselj.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.besselj = exports.Eval_besselj = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var cos_1 = require_cos();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var sin_1 = require_sin();
      var otherCFunctions_1 = require_otherCFunctions();
      function Eval_besselj(p1) {
        const result = besselj(eval_1.Eval(defs_1.cadr(p1)), eval_1.Eval(defs_1.caddr(p1)));
        stack_1.push(result);
      }
      exports.Eval_besselj = Eval_besselj;
      function besselj(p1, p2) {
        return yybesselj(p1, p2);
      }
      exports.besselj = besselj;
      function yybesselj(X, N) {
        const n = bignum_1.nativeInt(N);
        if (defs_1.isdouble(X) && !isNaN(n)) {
          const d = otherCFunctions_1.jn(n, X.d);
          return bignum_1.double(d);
        }
        if (is_1.isZeroAtomOrTensor(X) && is_1.isZeroAtomOrTensor(N)) {
          return defs_1.Constants.one;
        }
        if (is_1.isZeroAtomOrTensor(X) && !isNaN(n)) {
          return defs_1.Constants.zero;
        }
        if (N.k === defs_1.NUM && defs_1.MEQUAL(N.q.b, 2)) {
          if (defs_1.MEQUAL(N.q.a, 1)) {
            const twoOverPi = defs_1.defs.evaluatingAsFloats ? bignum_1.double(2 / Math.PI) : multiply_1.divide(bignum_1.integer(2), defs_1.symbol(defs_1.PI));
            return multiply_1.multiply(power_1.power(multiply_1.divide(twoOverPi, X), bignum_1.rational(1, 2)), sin_1.sine(X));
          }
          if (defs_1.MEQUAL(N.q.a, -1)) {
            const twoOverPi = defs_1.defs.evaluatingAsFloats ? bignum_1.double(2 / Math.PI) : multiply_1.divide(bignum_1.integer(2), defs_1.symbol(defs_1.PI));
            return multiply_1.multiply(power_1.power(multiply_1.divide(twoOverPi, X), bignum_1.rational(1, 2)), cos_1.cosine(X));
          }
          const SGN = bignum_1.integer(defs_1.MSIGN(N.q.a));
          return add_1.subtract(multiply_1.multiply(multiply_1.multiply(multiply_1.divide(bignum_1.integer(2), X), add_1.subtract(N, SGN)), besselj(X, add_1.subtract(N, SGN))), besselj(X, add_1.subtract(N, multiply_1.multiply(bignum_1.integer(2), SGN))));
        }
        if (is_1.isnegativeterm(X)) {
          return multiply_1.multiply(multiply_1.multiply(power_1.power(multiply_1.negate(X), N), power_1.power(X, multiply_1.negate(N))), list_1.makeList(defs_1.symbol(defs_1.BESSELJ), multiply_1.negate(X), N));
        }
        if (is_1.isnegativeterm(N)) {
          return multiply_1.multiply(power_1.power(defs_1.Constants.negOne, N), list_1.makeList(defs_1.symbol(defs_1.BESSELJ), X, multiply_1.negate(N)));
        }
        return list_1.makeList(defs_1.symbol(defs_1.BESSELJ), X, N);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/bessely.js
  var require_bessely = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/bessely.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.bessely = exports.Eval_bessely = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var otherCFunctions_1 = require_otherCFunctions();
      function Eval_bessely(p1) {
        const result = bessely(eval_1.Eval(defs_1.cadr(p1)), eval_1.Eval(defs_1.caddr(p1)));
        stack_1.push(result);
      }
      exports.Eval_bessely = Eval_bessely;
      function bessely(p1, p2) {
        return yybessely(p1, p2);
      }
      exports.bessely = bessely;
      function yybessely(X, N) {
        const n = bignum_1.nativeInt(N);
        if (defs_1.isdouble(X) && !isNaN(n)) {
          const d = otherCFunctions_1.yn(n, X.d);
          return bignum_1.double(d);
        }
        if (is_1.isnegativeterm(N)) {
          return multiply_1.multiply(power_1.power(defs_1.Constants.negOne, N), list_1.makeList(defs_1.symbol(defs_1.BESSELY), X, multiply_1.negate(N)));
        }
        return list_1.makeList(defs_1.symbol(defs_1.BESSELY), X, N);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/binomial.js
  var require_binomial = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/binomial.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_binomial = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var factorial_1 = require_factorial();
      var multiply_1 = require_multiply();
      function Eval_binomial(p1) {
        const N = eval_1.Eval(defs_1.cadr(p1));
        const K = eval_1.Eval(defs_1.caddr(p1));
        const result = binomial(N, K);
        stack_1.push(result);
      }
      exports.Eval_binomial = Eval_binomial;
      function binomial(N, K) {
        return ybinomial(N, K);
      }
      function ybinomial(N, K) {
        if (!BINOM_check_args(N, K)) {
          return defs_1.Constants.zero;
        }
        return multiply_1.divide(multiply_1.divide(factorial_1.factorial(N), factorial_1.factorial(K)), factorial_1.factorial(add_1.subtract(N, K)));
      }
      function BINOM_check_args(N, K) {
        if (defs_1.isNumericAtom(N) && misc_1.lessp(N, defs_1.Constants.zero)) {
          return false;
        } else if (defs_1.isNumericAtom(K) && misc_1.lessp(K, defs_1.Constants.zero)) {
          return false;
        } else if (defs_1.isNumericAtom(N) && defs_1.isNumericAtom(K) && misc_1.lessp(N, K)) {
          return false;
        } else {
          return true;
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/ceiling.js
  var require_ceiling = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/ceiling.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_ceiling = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var mmul_1 = require_mmul();
      function Eval_ceiling(p1) {
        const result = ceiling(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_ceiling = Eval_ceiling;
      function ceiling(p1) {
        return yyceiling(p1);
      }
      function yyceiling(p1) {
        if (!defs_1.isNumericAtom(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.CEILING), p1);
        }
        if (defs_1.isdouble(p1)) {
          return bignum_1.double(Math.ceil(p1.d));
        }
        if (is_1.isinteger(p1)) {
          return p1;
        }
        let result = new defs_1.Num(mmul_1.mdiv(p1.q.a, p1.q.b));
        if (!is_1.isnegativenumber(p1)) {
          result = add_1.add(result, defs_1.Constants.one);
        }
        return result;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/choose.js
  var require_choose = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/choose.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_choose = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var factorial_1 = require_factorial();
      var multiply_1 = require_multiply();
      function Eval_choose(p1) {
        const N = eval_1.Eval(defs_1.cadr(p1));
        const K = eval_1.Eval(defs_1.caddr(p1));
        const result = choose(N, K);
        stack_1.push(result);
      }
      exports.Eval_choose = Eval_choose;
      function choose(N, K) {
        if (!choose_check_args(N, K)) {
          return defs_1.Constants.zero;
        }
        return multiply_1.divide(multiply_1.divide(factorial_1.factorial(N), factorial_1.factorial(K)), factorial_1.factorial(add_1.subtract(N, K)));
      }
      function choose_check_args(N, K) {
        if (defs_1.isNumericAtom(N) && misc_1.lessp(N, defs_1.Constants.zero)) {
          return false;
        } else if (defs_1.isNumericAtom(K) && misc_1.lessp(K, defs_1.Constants.zero)) {
          return false;
        } else if (defs_1.isNumericAtom(N) && defs_1.isNumericAtom(K) && misc_1.lessp(N, K)) {
          return false;
        } else {
          return true;
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/expcos.js
  var require_expcos = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/expcos.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.expcos = exports.Eval_expcos = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      function Eval_expcos(p1) {
        const result = expcos(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_expcos = Eval_expcos;
      function expcos(p1) {
        return add_1.add(multiply_1.multiply(misc_1.exponential(multiply_1.multiply(defs_1.Constants.imaginaryunit, p1)), bignum_1.rational(1, 2)), multiply_1.multiply(misc_1.exponential(multiply_1.multiply(multiply_1.negate(defs_1.Constants.imaginaryunit), p1)), bignum_1.rational(1, 2)));
      }
      exports.expcos = expcos;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/expsin.js
  var require_expsin = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/expsin.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.expsin = exports.Eval_expsin = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      function Eval_expsin(p1) {
        const result = expsin(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_expsin = Eval_expsin;
      function expsin(p1) {
        return add_1.subtract(multiply_1.multiply(multiply_1.divide(misc_1.exponential(multiply_1.multiply(defs_1.Constants.imaginaryunit, p1)), defs_1.Constants.imaginaryunit), bignum_1.rational(1, 2)), multiply_1.multiply(multiply_1.divide(misc_1.exponential(multiply_1.multiply(multiply_1.negate(defs_1.Constants.imaginaryunit), p1)), defs_1.Constants.imaginaryunit), bignum_1.rational(1, 2)));
      }
      exports.expsin = expsin;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/circexp.js
  var require_circexp = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/circexp.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_circexp = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var expcos_1 = require_expcos();
      var expsin_1 = require_expsin();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      function Eval_circexp(p1) {
        const result = circexp(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(eval_1.Eval(result));
      }
      exports.Eval_circexp = Eval_circexp;
      function circexp(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.COS)) {
          return expcos_1.expcos(defs_1.cadr(p1));
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.SIN)) {
          return expsin_1.expsin(defs_1.cadr(p1));
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.TAN)) {
          p1 = defs_1.cadr(p1);
          const p2 = misc_1.exponential(multiply_1.multiply(defs_1.Constants.imaginaryunit, p1));
          const p3 = misc_1.exponential(multiply_1.negate(multiply_1.multiply(defs_1.Constants.imaginaryunit, p1)));
          return multiply_1.divide(multiply_1.multiply(add_1.subtract(p3, p2), defs_1.Constants.imaginaryunit), add_1.add(p2, p3));
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.COSH)) {
          p1 = defs_1.cadr(p1);
          return multiply_1.multiply(add_1.add(misc_1.exponential(p1), misc_1.exponential(multiply_1.negate(p1))), bignum_1.rational(1, 2));
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.SINH)) {
          p1 = defs_1.cadr(p1);
          return multiply_1.multiply(add_1.subtract(misc_1.exponential(p1), misc_1.exponential(multiply_1.negate(p1))), bignum_1.rational(1, 2));
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.TANH)) {
          p1 = misc_1.exponential(multiply_1.multiply(defs_1.cadr(p1), bignum_1.integer(2)));
          return multiply_1.divide(add_1.subtract(p1, defs_1.Constants.one), add_1.add(p1, defs_1.Constants.one));
        }
        if (defs_1.iscons(p1)) {
          return p1.map(circexp);
        }
        if (p1.k === defs_1.TENSOR) {
          p1 = tensor_1.copy_tensor(p1);
          p1.tensor.elem = p1.tensor.elem.map(circexp);
          return p1;
        }
        return p1;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/init.js
  var require_init = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/init.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defn = exports.init = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var list_1 = require_list();
      var print_1 = require_print();
      var scan_1 = require_scan();
      var defs_2 = require_defs();
      var symbol_1 = require_symbol();
      var init_flag = 0;
      function init() {
        init_flag = 0;
        defs_2.reset_after_error();
        defs_2.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated = [];
        if (init_flag) {
          return;
        }
        init_flag = 1;
        for (let i = 0; i < defs_2.NSYM; i++) {
          defs_2.symtab[i] = new defs_2.Sym("");
          defs_2.binding[i] = defs_2.symtab[i];
          defs_2.isSymbolReclaimable[i] = false;
        }
        const [p1, p6] = defn();
      }
      exports.init = init;
      var defn_str = [
        'version="' + defs_1.version + '"',
        "e=exp(1)",
        "i=sqrt(-1)",
        "autoexpand=1",
        "assumeRealVariables=1",
        "trange=[-pi,pi]",
        "xrange=[-10,10]",
        "yrange=[-10,10]",
        "last=0",
        "trace=0",
        "forceFixedPrintout=1",
        "maxFixedPrintoutDigits=6",
        "printLeaveEAlone=1",
        "printLeaveXAlone=0",
        "cross(u,v)=[u[2]*v[3]-u[3]*v[2],u[3]*v[1]-u[1]*v[3],u[1]*v[2]-u[2]*v[1]]",
        "curl(v)=[d(v[3],y)-d(v[2],z),d(v[1],z)-d(v[3],x),d(v[2],x)-d(v[1],y)]",
        "div(v)=d(v[1],x)+d(v[2],y)+d(v[3],z)",
        "ln(x)=log(x)"
      ];
      function defn() {
        const p1 = defs_2.symbol(defs_2.NIL);
        const p6 = defs_2.symbol(defs_2.NIL);
        symbol_1.std_symbol("abs", defs_2.ABS);
        symbol_1.std_symbol("add", defs_2.ADD);
        symbol_1.std_symbol("adj", defs_2.ADJ);
        symbol_1.std_symbol("and", defs_2.AND);
        symbol_1.std_symbol("approxratio", defs_2.APPROXRATIO);
        symbol_1.std_symbol("arccos", defs_2.ARCCOS);
        symbol_1.std_symbol("arccosh", defs_2.ARCCOSH);
        symbol_1.std_symbol("arcsin", defs_2.ARCSIN);
        symbol_1.std_symbol("arcsinh", defs_2.ARCSINH);
        symbol_1.std_symbol("arctan", defs_2.ARCTAN);
        symbol_1.std_symbol("arctanh", defs_2.ARCTANH);
        symbol_1.std_symbol("arg", defs_2.ARG);
        symbol_1.std_symbol("atomize", defs_2.ATOMIZE);
        symbol_1.std_symbol("besselj", defs_2.BESSELJ);
        symbol_1.std_symbol("bessely", defs_2.BESSELY);
        symbol_1.std_symbol("binding", defs_2.BINDING);
        symbol_1.std_symbol("binomial", defs_2.BINOMIAL);
        symbol_1.std_symbol("ceiling", defs_2.CEILING);
        symbol_1.std_symbol("check", defs_2.CHECK);
        symbol_1.std_symbol("choose", defs_2.CHOOSE);
        symbol_1.std_symbol("circexp", defs_2.CIRCEXP);
        symbol_1.std_symbol("clear", defs_2.CLEAR);
        symbol_1.std_symbol("clearall", defs_2.CLEARALL);
        symbol_1.std_symbol("clearpatterns", defs_2.CLEARPATTERNS);
        symbol_1.std_symbol("clock", defs_2.CLOCK);
        symbol_1.std_symbol("coeff", defs_2.COEFF);
        symbol_1.std_symbol("cofactor", defs_2.COFACTOR);
        symbol_1.std_symbol("condense", defs_2.CONDENSE);
        symbol_1.std_symbol("conj", defs_2.CONJ);
        symbol_1.std_symbol("contract", defs_2.CONTRACT);
        symbol_1.std_symbol("cos", defs_2.COS);
        symbol_1.std_symbol("cosh", defs_2.COSH);
        symbol_1.std_symbol("decomp", defs_2.DECOMP);
        symbol_1.std_symbol("defint", defs_2.DEFINT);
        symbol_1.std_symbol("deg", defs_2.DEGREE);
        symbol_1.std_symbol("denominator", defs_2.DENOMINATOR);
        symbol_1.std_symbol("det", defs_2.DET);
        symbol_1.std_symbol("derivative", defs_2.DERIVATIVE);
        symbol_1.std_symbol("dim", defs_2.DIM);
        symbol_1.std_symbol("dirac", defs_2.DIRAC);
        symbol_1.std_symbol("divisors", defs_2.DIVISORS);
        symbol_1.std_symbol("do", defs_2.DO);
        symbol_1.std_symbol("dot", defs_2.DOT);
        symbol_1.std_symbol("draw", defs_2.DRAW);
        symbol_1.std_symbol("dsolve", defs_2.DSOLVE);
        symbol_1.std_symbol("erf", defs_2.ERF);
        symbol_1.std_symbol("erfc", defs_2.ERFC);
        symbol_1.std_symbol("eigen", defs_2.EIGEN);
        symbol_1.std_symbol("eigenval", defs_2.EIGENVAL);
        symbol_1.std_symbol("eigenvec", defs_2.EIGENVEC);
        symbol_1.std_symbol("eval", defs_2.EVAL);
        symbol_1.std_symbol("exp", defs_2.EXP);
        symbol_1.std_symbol("expand", defs_2.EXPAND);
        symbol_1.std_symbol("expcos", defs_2.EXPCOS);
        symbol_1.std_symbol("expsin", defs_2.EXPSIN);
        symbol_1.std_symbol("factor", defs_2.FACTOR);
        symbol_1.std_symbol("factorial", defs_2.FACTORIAL);
        symbol_1.std_symbol("factorpoly", defs_2.FACTORPOLY);
        symbol_1.std_symbol("filter", defs_2.FILTER);
        symbol_1.std_symbol("float", defs_2.FLOATF);
        symbol_1.std_symbol("floor", defs_2.FLOOR);
        symbol_1.std_symbol("for", defs_2.FOR);
        symbol_1.std_symbol("function", defs_2.FUNCTION);
        symbol_1.std_symbol("Gamma", defs_2.GAMMA);
        symbol_1.std_symbol("gcd", defs_2.GCD);
        symbol_1.std_symbol("hermite", defs_2.HERMITE);
        symbol_1.std_symbol("hilbert", defs_2.HILBERT);
        symbol_1.std_symbol("imag", defs_2.IMAG);
        symbol_1.std_symbol("component", defs_2.INDEX);
        symbol_1.std_symbol("inner", defs_2.INNER);
        symbol_1.std_symbol("integral", defs_2.INTEGRAL);
        symbol_1.std_symbol("inv", defs_2.INV);
        symbol_1.std_symbol("invg", defs_2.INVG);
        symbol_1.std_symbol("isinteger", defs_2.ISINTEGER);
        symbol_1.std_symbol("isprime", defs_2.ISPRIME);
        symbol_1.std_symbol("laguerre", defs_2.LAGUERRE);
        symbol_1.std_symbol("lcm", defs_2.LCM);
        symbol_1.std_symbol("leading", defs_2.LEADING);
        symbol_1.std_symbol("legendre", defs_2.LEGENDRE);
        symbol_1.std_symbol("log", defs_2.LOG);
        symbol_1.std_symbol("lookup", defs_2.LOOKUP);
        symbol_1.std_symbol("mod", defs_2.MOD);
        symbol_1.std_symbol("multiply", defs_2.MULTIPLY);
        symbol_1.std_symbol("not", defs_2.NOT);
        symbol_1.std_symbol("nroots", defs_2.NROOTS);
        symbol_1.std_symbol("number", defs_2.NUMBER);
        symbol_1.std_symbol("numerator", defs_2.NUMERATOR);
        symbol_1.std_symbol("operator", defs_2.OPERATOR);
        symbol_1.std_symbol("or", defs_2.OR);
        symbol_1.std_symbol("outer", defs_2.OUTER);
        symbol_1.std_symbol("pattern", defs_2.PATTERN);
        symbol_1.std_symbol("patternsinfo", defs_2.PATTERNSINFO);
        symbol_1.std_symbol("polar", defs_2.POLAR);
        symbol_1.std_symbol("power", defs_2.POWER);
        symbol_1.std_symbol("prime", defs_2.PRIME);
        symbol_1.std_symbol("print", defs_2.PRINT);
        symbol_1.std_symbol("print2dascii", defs_2.PRINT2DASCII);
        symbol_1.std_symbol("printcomputer", defs_2.PRINTFULL);
        symbol_1.std_symbol("printlatex", defs_2.PRINTLATEX);
        symbol_1.std_symbol("printlist", defs_2.PRINTLIST);
        symbol_1.std_symbol("printhuman", defs_2.PRINTPLAIN);
        symbol_1.std_symbol("printLeaveEAlone", defs_2.PRINT_LEAVE_E_ALONE);
        symbol_1.std_symbol("printLeaveXAlone", defs_2.PRINT_LEAVE_X_ALONE);
        symbol_1.std_symbol("product", defs_2.PRODUCT);
        symbol_1.std_symbol("quote", defs_2.QUOTE);
        symbol_1.std_symbol("quotient", defs_2.QUOTIENT);
        symbol_1.std_symbol("rank", defs_2.RANK);
        symbol_1.std_symbol("rationalize", defs_2.RATIONALIZE);
        symbol_1.std_symbol("real", defs_2.REAL);
        symbol_1.std_symbol("rect", defs_2.YYRECT);
        symbol_1.std_symbol("roots", defs_2.ROOTS);
        symbol_1.std_symbol("round", defs_2.ROUND);
        symbol_1.std_symbol("equals", defs_2.SETQ);
        symbol_1.std_symbol("sgn", defs_2.SGN);
        symbol_1.std_symbol("silentpattern", defs_2.SILENTPATTERN);
        symbol_1.std_symbol("simplify", defs_2.SIMPLIFY);
        symbol_1.std_symbol("sin", defs_2.SIN);
        symbol_1.std_symbol("sinh", defs_2.SINH);
        symbol_1.std_symbol("shape", defs_2.SHAPE);
        symbol_1.std_symbol("sqrt", defs_2.SQRT);
        symbol_1.std_symbol("stop", defs_2.STOP);
        symbol_1.std_symbol("subst", defs_2.SUBST);
        symbol_1.std_symbol("sum", defs_2.SUM);
        symbol_1.std_symbol("symbolsinfo", defs_2.SYMBOLSINFO);
        symbol_1.std_symbol("tan", defs_2.TAN);
        symbol_1.std_symbol("tanh", defs_2.TANH);
        symbol_1.std_symbol("taylor", defs_2.TAYLOR);
        symbol_1.std_symbol("test", defs_2.TEST);
        symbol_1.std_symbol("testeq", defs_2.TESTEQ);
        symbol_1.std_symbol("testge", defs_2.TESTGE);
        symbol_1.std_symbol("testgt", defs_2.TESTGT);
        symbol_1.std_symbol("testle", defs_2.TESTLE);
        symbol_1.std_symbol("testlt", defs_2.TESTLT);
        symbol_1.std_symbol("transpose", defs_2.TRANSPOSE);
        symbol_1.std_symbol("unit", defs_2.UNIT);
        symbol_1.std_symbol("zero", defs_2.ZERO);
        symbol_1.std_symbol("nil", defs_2.NIL);
        symbol_1.std_symbol("autoexpand", defs_2.AUTOEXPAND);
        symbol_1.std_symbol("bake", defs_2.BAKE);
        symbol_1.std_symbol("assumeRealVariables", defs_2.ASSUME_REAL_VARIABLES);
        symbol_1.std_symbol("last", defs_2.LAST);
        symbol_1.std_symbol("lastprint", defs_2.LAST_PRINT);
        symbol_1.std_symbol("last2dasciiprint", defs_2.LAST_2DASCII_PRINT);
        symbol_1.std_symbol("lastfullprint", defs_2.LAST_FULL_PRINT);
        symbol_1.std_symbol("lastlatexprint", defs_2.LAST_LATEX_PRINT);
        symbol_1.std_symbol("lastlistprint", defs_2.LAST_LIST_PRINT);
        symbol_1.std_symbol("lastplainprint", defs_2.LAST_PLAIN_PRINT);
        symbol_1.std_symbol("trace", defs_2.TRACE);
        symbol_1.std_symbol("forceFixedPrintout", defs_2.FORCE_FIXED_PRINTOUT);
        symbol_1.std_symbol("maxFixedPrintoutDigits", defs_2.MAX_FIXED_PRINTOUT_DIGITS);
        symbol_1.std_symbol("~", defs_2.YYE);
        symbol_1.std_symbol("$DRAWX", defs_2.DRAWX);
        symbol_1.std_symbol("$METAA", defs_2.METAA);
        symbol_1.std_symbol("$METAB", defs_2.METAB);
        symbol_1.std_symbol("$METAX", defs_2.METAX);
        symbol_1.std_symbol("$SECRETX", defs_2.SECRETX);
        symbol_1.std_symbol("version", defs_2.VERSION);
        symbol_1.std_symbol("pi", defs_2.PI);
        symbol_1.std_symbol("a", defs_2.SYMBOL_A);
        symbol_1.std_symbol("b", defs_2.SYMBOL_B);
        symbol_1.std_symbol("c", defs_2.SYMBOL_C);
        symbol_1.std_symbol("d", defs_2.SYMBOL_D);
        symbol_1.std_symbol("i", defs_2.SYMBOL_I);
        symbol_1.std_symbol("j", defs_2.SYMBOL_J);
        symbol_1.std_symbol("n", defs_2.SYMBOL_N);
        symbol_1.std_symbol("r", defs_2.SYMBOL_R);
        symbol_1.std_symbol("s", defs_2.SYMBOL_S);
        symbol_1.std_symbol("t", defs_2.SYMBOL_T);
        symbol_1.std_symbol("x", defs_2.SYMBOL_X);
        symbol_1.std_symbol("y", defs_2.SYMBOL_Y);
        symbol_1.std_symbol("z", defs_2.SYMBOL_Z);
        symbol_1.std_symbol("I", defs_2.SYMBOL_IDENTITY_MATRIX);
        symbol_1.std_symbol("a_", defs_2.SYMBOL_A_UNDERSCORE);
        symbol_1.std_symbol("b_", defs_2.SYMBOL_B_UNDERSCORE);
        symbol_1.std_symbol("x_", defs_2.SYMBOL_X_UNDERSCORE);
        symbol_1.std_symbol("$C1", defs_2.C1);
        symbol_1.std_symbol("$C2", defs_2.C2);
        symbol_1.std_symbol("$C3", defs_2.C3);
        symbol_1.std_symbol("$C4", defs_2.C4);
        symbol_1.std_symbol("$C5", defs_2.C5);
        symbol_1.std_symbol("$C6", defs_2.C6);
        defineSomeHandyConstants();
        const originalCodeGen = defs_2.defs.codeGen;
        defs_2.defs.codeGen = false;
        for (let defn_i = 0; defn_i < defn_str.length; defn_i++) {
          const definitionOfInterest = defn_str[defn_i];
          scan_1.scan(definitionOfInterest);
          if (defs_2.DEBUG) {
            console.log(`... evaling ${definitionOfInterest}`);
            console.log("top of stack:");
            console.log(print_1.print_list(stack_1.top()));
          }
          eval_1.Eval(stack_1.pop());
        }
        defs_2.defs.codeGen = originalCodeGen;
        return [p1, p6];
      }
      exports.defn = defn;
      function defineSomeHandyConstants() {
        const imaginaryunit = list_1.makeList(defs_2.symbol(defs_2.POWER), bignum_1.integer(-1), bignum_1.rational(1, 2));
        if (defs_2.DEBUG) {
          console.log(print_1.print_list(imaginaryunit));
        }
        defs_2.Constants.imaginaryunit = imaginaryunit;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/pattern.js
  var require_pattern = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/pattern.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_patternsinfo = exports.Eval_clearpatterns = exports.do_clearPatterns = exports.Eval_pattern = exports.Eval_silentpattern = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var misc_1 = require_misc();
      var list_1 = require_list();
      var print_1 = require_print();
      function Eval_silentpattern(p1) {
        Eval_pattern(p1);
        stack_1.pop();
        symbol_1.push_symbol(defs_1.NIL);
      }
      exports.Eval_silentpattern = Eval_silentpattern;
      function Eval_pattern(p1) {
        let thirdArgument;
        if (!defs_1.iscons(defs_1.cdr(p1))) {
          run_1.stop("pattern needs at least a template and a transformed version");
        }
        const firstArgument = defs_1.car(defs_1.cdr(p1));
        const secondArgument = defs_1.car(defs_1.cdr(defs_1.cdr(p1)));
        if (secondArgument === defs_1.symbol(defs_1.NIL)) {
          run_1.stop("pattern needs at least a template and a transformed version");
        }
        if (!defs_1.iscons(defs_1.cdr(defs_1.cdr(p1)))) {
          thirdArgument = defs_1.symbol(defs_1.NIL);
        } else {
          thirdArgument = defs_1.car(defs_1.cdr(defs_1.cdr(defs_1.cdr(p1))));
        }
        if (misc_1.equal(firstArgument, secondArgument)) {
          run_1.stop("recursive pattern");
        }
        let stringKey = "template: " + print_1.print_list(firstArgument);
        stringKey += " tests: " + print_1.print_list(thirdArgument);
        if (defs_1.DEBUG) {
          console.log(`pattern stringkey: ${stringKey}`);
        }
        const patternPosition = defs_1.defs.userSimplificationsInStringForm.indexOf(stringKey);
        if (patternPosition === -1) {
          defs_1.defs.userSimplificationsInStringForm.push(stringKey);
          defs_1.defs.userSimplificationsInListForm.push(defs_1.cdr(p1));
        } else {
          if (defs_1.DEBUG) {
            console.log(`pattern already exists, replacing. ${defs_1.cdr(p1)}`);
          }
          defs_1.defs.userSimplificationsInStringForm[patternPosition] = stringKey;
          defs_1.defs.userSimplificationsInListForm[patternPosition] = defs_1.cdr(p1);
        }
        stack_1.push(list_1.makeList(defs_1.symbol(defs_1.PATTERN), defs_1.cdr(p1)));
      }
      exports.Eval_pattern = Eval_pattern;
      function do_clearPatterns() {
        defs_1.defs.userSimplificationsInListForm = [];
        defs_1.defs.userSimplificationsInStringForm = [];
      }
      exports.do_clearPatterns = do_clearPatterns;
      function Eval_clearpatterns() {
        do_clearPatterns();
        symbol_1.push_symbol(defs_1.NIL);
      }
      exports.Eval_clearpatterns = Eval_clearpatterns;
      function Eval_patternsinfo() {
        const patternsinfoToBePrinted = patternsinfo();
        if (patternsinfoToBePrinted !== "") {
          misc_1.new_string(patternsinfoToBePrinted);
        } else {
          symbol_1.push_symbol(defs_1.NIL);
        }
      }
      exports.Eval_patternsinfo = Eval_patternsinfo;
      function patternsinfo() {
        let patternsinfoToBePrinted = "";
        for (let i of Array.from(defs_1.defs.userSimplificationsInListForm)) {
          patternsinfoToBePrinted += defs_1.defs.userSimplificationsInListForm + "\n";
        }
        return patternsinfoToBePrinted;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/clear.js
  var require_clear = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/clear.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_clear = exports.clearRenamedVariablesToAvoidBindingToExternalScope = exports.do_clearall = exports.Eval_clearall = void 0;
      var defs_1 = require_defs();
      var init_1 = require_init();
      var otherCFunctions_1 = require_otherCFunctions();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var pattern_1 = require_pattern();
      function Eval_clearall() {
        let [p1, p6] = do_clearall();
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_clearall = Eval_clearall;
      function do_clearall() {
        if (!defs_1.defs.test_flag) {
          otherCFunctions_1.clear_term();
        }
        pattern_1.do_clearPatterns();
        symbol_1.clear_symbols();
        let [p1, p6] = init_1.defn();
        return [defs_1.defs.codeGen = false, p1, p6];
      }
      exports.do_clearall = do_clearall;
      function clearRenamedVariablesToAvoidBindingToExternalScope() {
        for (let i = 0; i < defs_1.symtab.length; i++) {
          if (defs_1.symtab[i].printname.indexOf("AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE") !== -1) {
            defs_1.symtab[i].k = defs_1.SYM;
            defs_1.symtab[i].printname = "";
            defs_1.binding[i] = defs_1.symtab[i];
            defs_1.isSymbolReclaimable[i] = true;
          }
        }
      }
      exports.clearRenamedVariablesToAvoidBindingToExternalScope = clearRenamedVariablesToAvoidBindingToExternalScope;
      function Eval_clear(p1) {
        let p2;
        p2 = defs_1.cdr(p1);
        while (defs_1.iscons(p2)) {
          const variableToBeCleared = defs_1.car(p2);
          if (variableToBeCleared.k !== defs_1.SYM) {
            run_1.stop("symbol error");
          }
          const indexFound = defs_1.symtab.indexOf(variableToBeCleared);
          defs_1.symtab[indexFound].k = defs_1.SYM;
          defs_1.symtab[indexFound].printname = "";
          defs_1.binding[indexFound] = defs_1.symtab[indexFound];
          defs_1.isSymbolReclaimable[indexFound] = true;
          p2 = defs_1.cdr(p2);
        }
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_clear = Eval_clear;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/contract.js
  var require_contract = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/contract.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_contract = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      function Eval_contract(p1) {
        const p1_prime = eval_1.Eval(defs_1.cadr(p1));
        let p2, p3;
        if (defs_1.cddr(p1) === defs_1.symbol(defs_1.NIL)) {
          p2 = defs_1.Constants.one;
          p3 = bignum_1.integer(2);
        } else {
          p2 = eval_1.Eval(defs_1.caddr(p1));
          p3 = eval_1.Eval(defs_1.cadddr(p1));
        }
        const result = contract(p1_prime, p2, p3);
        stack_1.push(result);
      }
      exports.Eval_contract = Eval_contract;
      function contract(p1, p2, p3) {
        const ai = [];
        const an = [];
        if (!defs_1.istensor(p1)) {
          if (!is_1.isZeroAtomOrTensor(p1)) {
            run_1.stop("contract: tensor expected, 1st arg is not a tensor");
          }
          return defs_1.Constants.zero;
        }
        let l = bignum_1.nativeInt(p2);
        let m = bignum_1.nativeInt(p3);
        const { ndim } = p1.tensor;
        if (l < 1 || l > ndim || m < 1 || m > ndim || l === m || p1.tensor.dim[l - 1] !== p1.tensor.dim[m - 1]) {
          run_1.stop("contract: index out of range");
        }
        l--;
        m--;
        const n = p1.tensor.dim[l];
        let nelem = 1;
        for (let i = 0; i < ndim; i++) {
          if (i !== l && i !== m) {
            nelem *= p1.tensor.dim[i];
          }
        }
        p2 = alloc_1.alloc_tensor(nelem);
        p2.tensor.ndim = ndim - 2;
        let j = 0;
        for (let i = 0; i < ndim; i++) {
          if (i !== l && i !== m) {
            p2.tensor.dim[j++] = p1.tensor.dim[i];
          }
        }
        const a = p1.tensor.elem;
        const b = p2.tensor.elem;
        for (let i = 0; i < ndim; i++) {
          ai[i] = 0;
          an[i] = p1.tensor.dim[i];
        }
        for (let i = 0; i < nelem; i++) {
          let temp = defs_1.Constants.zero;
          for (let j2 = 0; j2 < n; j2++) {
            ai[l] = j2;
            ai[m] = j2;
            let h = 0;
            for (let k = 0; k < ndim; k++) {
              h = h * an[k] + ai[k];
            }
            temp = add_1.add(temp, a[h]);
          }
          b[i] = temp;
          for (let j2 = ndim - 1; j2 >= 0; j2--) {
            if (j2 === l || j2 === m) {
              continue;
            }
            if (++ai[j2] < an[j2]) {
              break;
            }
            ai[j2] = 0;
          }
        }
        if (nelem === 1) {
          return b[0];
        }
        return p2;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/cosh.js
  var require_cosh = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/cosh.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ycosh = exports.Eval_cosh = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_cosh(p1) {
        const result = ycosh(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_cosh = Eval_cosh;
      function ycosh(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCCOSH)) {
          return defs_1.cadr(p1);
        }
        if (defs_1.isdouble(p1)) {
          let d = Math.cosh(p1.d);
          if (Math.abs(d) < 1e-10) {
            d = 0;
          }
          return bignum_1.double(d);
        }
        if (is_1.isZeroAtomOrTensor(p1)) {
          return defs_1.Constants.one;
        }
        return list_1.makeList(defs_1.symbol(defs_1.COSH), p1);
      }
      exports.ycosh = ycosh;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/define.js
  var require_define = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/define.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_function_reference = exports.define_user_function = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var eval_1 = require_eval();
      var list_1 = require_list();
      function define_user_function(p1) {
        const F = defs_1.caadr(p1);
        const A = defs_1.cdadr(p1);
        let B = defs_1.caddr(p1);
        if (!defs_1.issymbol(F)) {
          run_1.stop("function name?");
        }
        if (defs_1.car(B) === defs_1.symbol(defs_1.EVAL)) {
          B = eval_1.Eval(defs_1.cadr(B));
        }
        B = list_1.makeList(defs_1.symbol(defs_1.FUNCTION), B, A);
        symbol_1.set_binding(F, B);
        symbol_1.push_symbol(defs_1.NIL);
      }
      exports.define_user_function = define_user_function;
      function Eval_function_reference(p1) {
        stack_1.push(p1);
      }
      exports.Eval_function_reference = Eval_function_reference;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/dirac.js
  var require_dirac = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/dirac.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.dirac = exports.Eval_dirac = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var mmul_1 = require_mmul();
      var multiply_1 = require_multiply();
      function Eval_dirac(p1) {
        const result = dirac(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_dirac = Eval_dirac;
      function dirac(p1) {
        return ydirac(p1);
      }
      exports.dirac = dirac;
      function ydirac(p1) {
        if (defs_1.isdouble(p1)) {
          if (p1.d === 0) {
            return defs_1.Constants.one;
          }
          return defs_1.Constants.zero;
        }
        if (defs_1.isrational(p1)) {
          if (defs_1.MZERO(mmul_1.mmul(p1.q.a, p1.q.b))) {
            return defs_1.Constants.one;
          }
          return defs_1.Constants.zero;
        }
        if (defs_1.ispower(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.DIRAC), defs_1.cadr(p1));
        }
        if (is_1.isnegativeterm(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.DIRAC), multiply_1.negate(p1));
        }
        if (is_1.isnegativeterm(p1) || defs_1.isadd(p1) && is_1.isnegativeterm(defs_1.cadr(p1))) {
          p1 = multiply_1.negate(p1);
        }
        return list_1.makeList(defs_1.symbol(defs_1.DIRAC), p1);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/hermite.js
  var require_hermite = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/hermite.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.hermite = void 0;
      var defs_1 = require_defs();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var subst_1 = require_subst();
      function hermite(p1, p2) {
        return yyhermite(p1, p2);
      }
      exports.hermite = hermite;
      function yyhermite(X, N) {
        const n = bignum_1.nativeInt(N);
        if (n < 0 || isNaN(n)) {
          return list_1.makeList(defs_1.symbol(defs_1.HERMITE), X, N);
        }
        if (defs_1.issymbol(X)) {
          return yyhermite2(n, X);
        }
        return eval_1.Eval(subst_1.subst(yyhermite2(n, defs_1.symbol(defs_1.SECRETX)), defs_1.symbol(defs_1.SECRETX), X));
      }
      function yyhermite2(n, p1) {
        let Y1 = defs_1.Constants.zero;
        let temp = defs_1.Constants.one;
        for (let i = 0; i < n; i++) {
          const Y0 = Y1;
          Y1 = temp;
          temp = multiply_1.multiply(add_1.subtract(multiply_1.multiply(p1, Y1), multiply_1.multiply(bignum_1.integer(i), Y0)), bignum_1.integer(2));
        }
        return temp;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/log.js
  var require_log = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/log.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.logarithm = exports.Eval_log = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var denominator_1 = require_denominator();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var numerator_1 = require_numerator();
      function Eval_log(p1) {
        const result = logarithm(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_log = Eval_log;
      function logarithm(p1) {
        if (p1 === defs_1.symbol(defs_1.E)) {
          return defs_1.Constants.one;
        }
        if (is_1.equaln(p1, 1)) {
          return defs_1.Constants.zero;
        }
        if (is_1.isnegativenumber(p1)) {
          return add_1.add(logarithm(multiply_1.negate(p1)), multiply_1.multiply(defs_1.Constants.imaginaryunit, defs_1.Constants.Pi()));
        }
        if (defs_1.isdouble(p1)) {
          return bignum_1.double(Math.log(p1.d));
        }
        if (is_1.isfraction(p1)) {
          return add_1.subtract(logarithm(numerator_1.numerator(p1)), logarithm(denominator_1.denominator(p1)));
        }
        if (defs_1.ispower(p1)) {
          return multiply_1.multiply(defs_1.caddr(p1), logarithm(defs_1.cadr(p1)));
        }
        if (defs_1.ismultiply(p1)) {
          return p1.tail().map(logarithm).reduce(add_1.add, defs_1.Constants.zero);
        }
        return list_1.makeList(defs_1.symbol(defs_1.LOG), p1);
      }
      exports.logarithm = logarithm;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/sgn.js
  var require_sgn = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/sgn.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sgn = exports.Eval_sgn = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var abs_1 = require_abs();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var mmul_1 = require_mmul();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      function Eval_sgn(p1) {
        const result = sgn(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_sgn = Eval_sgn;
      function sgn(X) {
        if (defs_1.isdouble(X)) {
          if (X.d > 0) {
            return defs_1.Constants.one;
          }
          if (X.d === 0) {
            return defs_1.Constants.one;
          }
          return defs_1.Constants.negOne;
        }
        if (defs_1.isrational(X)) {
          if (defs_1.MSIGN(mmul_1.mmul(X.q.a, X.q.b)) === -1) {
            return defs_1.Constants.negOne;
          }
          if (defs_1.MZERO(mmul_1.mmul(X.q.a, X.q.b))) {
            return defs_1.Constants.zero;
          }
          return defs_1.Constants.one;
        }
        if (is_1.iscomplexnumber(X)) {
          return multiply_1.multiply(power_1.power(defs_1.Constants.negOne, abs_1.absval(X)), X);
        }
        if (is_1.isnegativeterm(X)) {
          return multiply_1.multiply(list_1.makeList(defs_1.symbol(defs_1.SGN), multiply_1.negate(X)), defs_1.Constants.negOne);
        }
        return list_1.makeList(defs_1.symbol(defs_1.SGN), X);
      }
      exports.sgn = sgn;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/sinh.js
  var require_sinh = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/sinh.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ysinh = exports.Eval_sinh = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_sinh(p1) {
        const result = ysinh(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_sinh = Eval_sinh;
      function ysinh(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCSINH)) {
          return defs_1.cadr(p1);
        }
        if (defs_1.isdouble(p1)) {
          let d = Math.sinh(p1.d);
          if (Math.abs(d) < 1e-10) {
            d = 0;
          }
          return bignum_1.double(d);
        }
        if (is_1.isZeroAtomOrTensor(p1)) {
          return defs_1.Constants.zero;
        }
        return list_1.makeList(defs_1.symbol(defs_1.SINH), p1);
      }
      exports.ysinh = ysinh;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/derivative.js
  var require_derivative = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/derivative.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.derivative = exports.Eval_derivative = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var besselj_1 = require_besselj();
      var bessely_1 = require_bessely();
      var bignum_1 = require_bignum();
      var cos_1 = require_cos();
      var cosh_1 = require_cosh();
      var dirac_1 = require_dirac();
      var eval_1 = require_eval();
      var guess_1 = require_guess();
      var hermite_1 = require_hermite();
      var integral_1 = require_integral();
      var is_1 = require_is();
      var list_1 = require_list();
      var log_2 = require_log();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var sgn_1 = require_sgn();
      var simplify_1 = require_simplify();
      var sin_1 = require_sin();
      var sinh_1 = require_sinh();
      var subst_1 = require_subst();
      var tensor_1 = require_tensor();
      function Eval_derivative(p1) {
        p1 = defs_1.cdr(p1);
        let F = eval_1.Eval(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        let X, N;
        const p2 = eval_1.Eval(defs_1.car(p1));
        if (p2 === defs_1.symbol(defs_1.NIL)) {
          X = guess_1.guess(F);
          N = defs_1.symbol(defs_1.NIL);
        } else if (defs_1.isNumericAtom(p2)) {
          X = guess_1.guess(F);
          N = p2;
        } else {
          X = p2;
          p1 = defs_1.cdr(p1);
          N = eval_1.Eval(defs_1.car(p1));
        }
        while (true) {
          let n;
          if (defs_1.isNumericAtom(N)) {
            n = bignum_1.nativeInt(N);
            if (isNaN(n)) {
              run_1.stop("nth derivative: check n");
            }
          } else {
            n = 1;
          }
          let temp = F;
          if (n >= 0) {
            for (let i = 0; i < n; i++) {
              temp = derivative(temp, X);
            }
          } else {
            n = -n;
            for (let i = 0; i < n; i++) {
              temp = integral_1.integral(temp, X);
            }
          }
          F = temp;
          if (N === defs_1.symbol(defs_1.NIL)) {
            break;
          }
          if (defs_1.isNumericAtom(N)) {
            p1 = defs_1.cdr(p1);
            N = eval_1.Eval(defs_1.car(p1));
            if (N === defs_1.symbol(defs_1.NIL)) {
              break;
            }
            if (!defs_1.isNumericAtom(N)) {
              X = N;
              p1 = defs_1.cdr(p1);
              N = eval_1.Eval(defs_1.car(p1));
            }
          } else {
            X = N;
            p1 = defs_1.cdr(p1);
            N = eval_1.Eval(defs_1.car(p1));
          }
        }
        stack_1.push(F);
      }
      exports.Eval_derivative = Eval_derivative;
      function derivative(p1, p2) {
        if (defs_1.isNumericAtom(p2)) {
          run_1.stop("undefined function");
        }
        if (defs_1.istensor(p1)) {
          if (defs_1.istensor(p2)) {
            return tensor_1.d_tensor_tensor(p1, p2);
          } else {
            return tensor_1.d_tensor_scalar(p1, p2);
          }
        } else {
          if (defs_1.istensor(p2)) {
            return tensor_1.d_scalar_tensor(p1, p2);
          } else {
            return d_scalar_scalar(p1, p2);
          }
        }
      }
      exports.derivative = derivative;
      function d_scalar_scalar(p1, p2) {
        if (defs_1.issymbol(p2)) {
          return d_scalar_scalar_1(p1, p2);
        }
        const arg1 = subst_1.subst(p1, p2, defs_1.symbol(defs_1.SECRETX));
        return subst_1.subst(derivative(arg1, defs_1.symbol(defs_1.SECRETX)), defs_1.symbol(defs_1.SECRETX), p2);
      }
      function d_scalar_scalar_1(p1, p2) {
        if (misc_1.equal(p1, p2)) {
          return defs_1.Constants.one;
        }
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
      function dpower(p1, p2) {
        const arg1 = multiply_1.divide(defs_1.caddr(p1), defs_1.cadr(p1));
        const deriv_1 = derivative(defs_1.cadr(p1), p2);
        const log_1 = log_2.logarithm(defs_1.cadr(p1));
        const deriv_2 = derivative(defs_1.caddr(p1), p2);
        return multiply_1.multiply(add_1.add(multiply_1.multiply(arg1, deriv_1), multiply_1.multiply(log_1, deriv_2)), p1);
      }
      function dlog(p1, p2) {
        const deriv = derivative(defs_1.cadr(p1), p2);
        return multiply_1.divide(deriv, defs_1.cadr(p1));
      }
      function dd(p1, p2) {
        const p3 = derivative(defs_1.cadr(p1), p2);
        if (defs_1.car(p3) === defs_1.symbol(defs_1.DERIVATIVE)) {
          if (misc_1.lessp(defs_1.caddr(p3), defs_1.caddr(p1))) {
            return list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), defs_1.cadr(p3), defs_1.caddr(p3)), defs_1.caddr(p1));
          } else {
            return list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), defs_1.cadr(p3), defs_1.caddr(p1)), defs_1.caddr(p3));
          }
        }
        return derivative(p3, defs_1.caddr(p1));
      }
      function dfunction(p1, p2) {
        const p3 = defs_1.cdr(p1);
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
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/partition.js
  var require_partition = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/partition.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.partition = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var multiply_1 = require_multiply();
      function partition(p1, p2) {
        let p3 = defs_1.Constants.one;
        let p4 = p3;
        p1 = defs_1.cdr(p1);
        if (!defs_1.iscons(p1)) {
          return [p3, p4];
        }
        for (const p of p1) {
          if (find_1.Find(p, p2)) {
            p4 = multiply_1.multiply(p4, p);
          } else {
            p3 = multiply_1.multiply(p3, p);
          }
        }
        return [p3, p4];
      }
      exports.partition = partition;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/integral.js
  var require_integral = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/integral.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.make_hashed_itab = exports.integral = exports.Eval_integral = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var derivative_1 = require_derivative();
      var eval_1 = require_eval();
      var guess_1 = require_guess();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var partition_1 = require_partition();
      var scan_1 = require_scan();
      var simplify_1 = require_simplify();
      var transform_1 = require_transform();
      var itab = [
        "f(a,a*x)",
        "f(1/x,log(x))",
        "f(x^a,x^(a+1)/(a+1))",
        "f(x^(-2),-x^(-1))",
        "f(x^(-1/2),2*x^(1/2))",
        "f(x^(1/2),2/3*x^(3/2))",
        "f(x,x^2/2)",
        "f(x^2,x^3/3)",
        "f(exp(a*x),1/a*exp(a*x))",
        "f(exp(a*x+b),1/a*exp(a*x+b))",
        "f(x*exp(a*x^2),exp(a*x^2)/(2*a))",
        "f(x*exp(a*x^2+b),exp(a*x^2+b)/(2*a))",
        "f(log(a*x),x*log(a*x)-x)",
        "f(a^x,a^x/log(a),or(not(number(a)),a>0))",
        "f(1/(a+x^2),1/sqrt(a)*arctan(x/sqrt(a)),or(not(number(a)),a>0))",
        "f(1/(a-x^2),1/sqrt(a)*arctanh(x/sqrt(a)))",
        "f(1/sqrt(a-x^2),arcsin(x/(sqrt(a))))",
        "f(1/sqrt(a+x^2),log(x+sqrt(a+x^2)))",
        "f(1/(a+b*x),1/b*log(a+b*x))",
        "f(1/(a+b*x)^2,-1/(b*(a+b*x)))",
        "f(1/(a+b*x)^3,-1/(2*b)*1/(a+b*x)^2)",
        "f(x/(a+b*x),x/b-a*log(a+b*x)/b/b)",
        "f(x/(a+b*x)^2,1/b^2*(log(a+b*x)+a/(a+b*x)))",
        "f(x^2/(a+b*x),1/b^2*(1/2*(a+b*x)^2-2*a*(a+b*x)+a^2*log(a+b*x)))",
        "f(x^2/(a+b*x)^2,1/b^3*(a+b*x-2*a*log(a+b*x)-a^2/(a+b*x)))",
        "f(x^2/(a+b*x)^3,1/b^3*(log(a+b*x)+2*a/(a+b*x)-1/2*a^2/(a+b*x)^2))",
        "f(1/x*1/(a+b*x),-1/a*log((a+b*x)/x))",
        "f(1/x*1/(a+b*x)^2,1/a*1/(a+b*x)-1/a^2*log((a+b*x)/x))",
        "f(1/x*1/(a+b*x)^3,1/a^3*(1/2*((2*a+b*x)/(a+b*x))^2+log(x/(a+b*x))))",
        "f(1/x^2*1/(a+b*x),-1/(a*x)+b/a^2*log((a+b*x)/x))",
        "f(1/x^3*1/(a+b*x),(2*b*x-a)/(2*a^2*x^2)+b^2/a^3*log(x/(a+b*x)))",
        "f(1/x^2*1/(a+b*x)^2,-(a+2*b*x)/(a^2*x*(a+b*x))+2*b/a^3*log((a+b*x)/x))",
        "f(1/(a+b*x^2),1/sqrt(a*b)*arctan(x*sqrt(a*b)/a),or(not(number(a*b)),a*b>0))",
        "f(1/(a+b*x^2),1/(2*sqrt(-a*b))*log((a+x*sqrt(-a*b))/(a-x*sqrt(-a*b))),or(not(number(a*b)),a*b<0))",
        "f(x/(a+b*x^2),1/2*1/b*log(a+b*x^2))",
        "f(x^2/(a+b*x^2),x/b-a/b*integral(1/(a+b*x^2),x))",
        "f(1/(a+b*x^2)^2,x/(2*a*(a+b*x^2))+1/2*1/a*integral(1/(a+b*x^2),x))",
        "f(1/x*1/(a+b*x^2),1/2*1/a*log(x^2/(a+b*x^2)))",
        "f(1/x^2*1/(a+b*x^2),-1/(a*x)-b/a*integral(1/(a+b*x^2),x))",
        "f(1/(a+b*x^3),1/3*1/a*(a/b)^(1/3)*(1/2*log(((a/b)^(1/3)+x)^3/(a+b*x^3))+sqrt(3)*arctan((2*x-(a/b)^(1/3))*(a/b)^(-1/3)/sqrt(3))))",
        "f(x^2/(a+b*x^3),1/3*1/b*log(a+b*x^3))",
        "f(x/(a+b*x^4),1/2*sqrt(b/a)/b*arctan(x^2*sqrt(b/a)),or(not(number(a*b)),a*b>0))",
        "f(x/(a+b*x^4),1/4*sqrt(-b/a)/b*log((x^2-sqrt(-a/b))/(x^2+sqrt(-a/b))),or(not(number(a*b)),a*b<0))",
        "f(x^3/(a+b*x^4),1/4*1/b*log(a+b*x^4))",
        "f(sqrt(a+b*x),2/3*1/b*sqrt((a+b*x)^3))",
        "f(x*sqrt(a+b*x),-2*(2*a-3*b*x)*sqrt((a+b*x)^3)/15/b^2)",
        "f(x^2*sqrt(a+b*x),2*(8*a^2-12*a*b*x+15*b^2*x^2)*sqrt((a+b*x)^3)/105/b^3)",
        "f(sqrt(a+b*x)/x,2*sqrt(a+b*x)+a*integral(1/x*1/sqrt(a+b*x),x))",
        "f(sqrt(a+b*x)/x^2,-sqrt(a+b*x)/x+b/2*integral(1/x*1/sqrt(a+b*x),x))",
        "f(1/sqrt(a+b*x),2*sqrt(a+b*x)/b)",
        "f(x/sqrt(a+b*x),-2/3*(2*a-b*x)*sqrt(a+b*x)/b^2)",
        "f(x^2/sqrt(a+b*x),2/15*(8*a^2-4*a*b*x+3*b^2*x^2)*sqrt(a+b*x)/b^3)",
        "f(1/x*1/sqrt(a+b*x),1/sqrt(a)*log((sqrt(a+b*x)-sqrt(a))/(sqrt(a+b*x)+sqrt(a))),or(not(number(a)),a>0))",
        "f(1/x*1/sqrt(a+b*x),2/sqrt(-a)*arctan(sqrt(-(a+b*x)/a)),or(not(number(a)),a<0))",
        "f(1/x^2*1/sqrt(a+b*x),-sqrt(a+b*x)/a/x-1/2*b/a*integral(1/x*1/sqrt(a+b*x),x))",
        "f(sqrt(x^2+a),1/2*(x*sqrt(x^2+a)+a*log(x+sqrt(x^2+a))))",
        "f(1/sqrt(x^2+a),log(x+sqrt(x^2+a)))",
        "f(1/x*1/sqrt(x^2+a),arcsec(x/sqrt(-a))/sqrt(-a),or(not(number(a)),a<0))",
        "f(1/x*1/sqrt(x^2+a),-1/sqrt(a)*log((sqrt(a)+sqrt(x^2+a))/x),or(not(number(a)),a>0))",
        "f(sqrt(x^2+a)/x,sqrt(x^2+a)-sqrt(a)*log((sqrt(a)+sqrt(x^2+a))/x),or(not(number(a)),a>0))",
        "f(sqrt(x^2+a)/x,sqrt(x^2+a)-sqrt(-a)*arcsec(x/sqrt(-a)),or(not(number(a)),a<0))",
        "f(x/sqrt(x^2+a),sqrt(x^2+a))",
        "f(x*sqrt(x^2+a),1/3*sqrt((x^2+a)^3))",
        "f(sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/4*(x*sqrt((x^2+a^(1/3))^3)+3/2*a^(1/3)*x*sqrt(x^2+a^(1/3))+3/2*a^(2/3)*log(x+sqrt(x^2+a^(1/3)))))",
        "f(sqrt(-a+x^6-3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/4*(x*sqrt((x^2-a^(1/3))^3)-3/2*a^(1/3)*x*sqrt(x^2-a^(1/3))+3/2*a^(2/3)*log(x+sqrt(x^2-a^(1/3)))))",
        "f(1/sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),x/a^(1/3)/sqrt(x^2+a^(1/3)))",
        "f(x/sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),-1/sqrt(x^2+a^(1/3)))",
        "f(x*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/5*sqrt((x^2+a^(1/3))^5))",
        "f(x^2*sqrt(x^2+a),1/4*x*sqrt((x^2+a)^3)-1/8*a*x*sqrt(x^2+a)-1/8*a^2*log(x+sqrt(x^2+a)))",
        "f(x^3*sqrt(x^2+a),(1/5*x^2-2/15*a)*sqrt((x^2+a)^3),and(number(a),a>0))",
        "f(x^3*sqrt(x^2+a),sqrt((x^2+a)^5)/5-a*sqrt((x^2+a)^3)/3,and(number(a),a<0))",
        "f(x^2/sqrt(x^2+a),1/2*x*sqrt(x^2+a)-1/2*a*log(x+sqrt(x^2+a)))",
        "f(x^3/sqrt(x^2+a),1/3*sqrt((x^2+a)^3)-a*sqrt(x^2+a))",
        "f(1/x^2*1/sqrt(x^2+a),-sqrt(x^2+a)/a/x)",
        "f(1/x^3*1/sqrt(x^2+a),-1/2*sqrt(x^2+a)/a/x^2+1/2*log((sqrt(a)+sqrt(x^2+a))/x)/a^(3/2),or(not(number(a)),a>0))",
        "f(1/x^3*1/sqrt(x^2-a),1/2*sqrt(x^2-a)/a/x^2+1/2*1/(a^(3/2))*arcsec(x/(a^(1/2))),or(not(number(a)),a>0))",
        "f(x^2*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/6*x*sqrt((x^2+a^(1/3))^5)-1/24*a^(1/3)*x*sqrt((x^2+a^(1/3))^3)-1/16*a^(2/3)*x*sqrt(x^2+a^(1/3))-1/16*a*log(x+sqrt(x^2+a^(1/3))),or(not(number(a)),a>0))",
        "f(x^2*sqrt(-a-3*a^(1/3)*x^4+3*a^(2/3)*x^2+x^6),1/6*x*sqrt((x^2-a^(1/3))^5)+1/24*a^(1/3)*x*sqrt((x^2-a^(1/3))^3)-1/16*a^(2/3)*x*sqrt(x^2-a^(1/3))+1/16*a*log(x+sqrt(x^2-a^(1/3))),or(not(number(a)),a>0))",
        "f(x^3*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/7*sqrt((x^2+a^(1/3))^7)-1/5*a^(1/3)*sqrt((x^2+a^(1/3))^5),or(not(number(a)),a>0))",
        "f(x^3*sqrt(-a-3*a^(1/3)*x^4+3*a^(2/3)*x^2+x^6),1/7*sqrt((x^2-a^(1/3))^7)+1/5*a^(1/3)*sqrt((x^2-a^(1/3))^5),or(not(number(a)),a>0))",
        "f(1/(x-a)/sqrt(x^2-a^2),-sqrt(x^2-a^2)/a/(x-a))",
        "f(1/(x+a)/sqrt(x^2-a^2),sqrt(x^2-a^2)/a/(x+a))",
        "f(sqrt(a-x^2),1/2*(x*sqrt(a-x^2)+a*arcsin(x/sqrt(abs(a)))))",
        "f(1/x*1/sqrt(a-x^2),-1/sqrt(a)*log((sqrt(a)+sqrt(a-x^2))/x),or(not(number(a)),a>0))",
        "f(sqrt(a-x^2)/x,sqrt(a-x^2)-sqrt(a)*log((sqrt(a)+sqrt(a-x^2))/x),or(not(number(a)),a>0))",
        "f(x/sqrt(a-x^2),-sqrt(a-x^2))",
        "f(x*sqrt(a-x^2),-1/3*sqrt((a-x^2)^3))",
        "f(x^2*sqrt(a-x^2),-x/4*sqrt((a-x^2)^3)+1/8*a*(x*sqrt(a-x^2)+a*arcsin(x/sqrt(a))),or(not(number(a)),a>0))",
        "f(x^3*sqrt(a-x^2),(-1/5*x^2-2/15*a)*sqrt((a-x^2)^3),or(not(number(a)),a>0))",
        "f(x^2/sqrt(a-x^2),-x/2*sqrt(a-x^2)+a/2*arcsin(x/sqrt(a)),or(not(number(a)),a>0))",
        "f(1/x^2*1/sqrt(a-x^2),-sqrt(a-x^2)/a/x,or(not(number(a)),a>0))",
        "f(sqrt(a-x^2)/x^2,-sqrt(a-x^2)/x-arcsin(x/sqrt(a)),or(not(number(a)),a>0))",
        "f(sqrt(a-x^2)/x^3,-1/2*sqrt(a-x^2)/x^2+1/2*log((sqrt(a)+sqrt(a-x^2))/x)/sqrt(a),or(not(number(a)),a>0))",
        "f(sqrt(a-x^2)/x^4,-1/3*sqrt((a-x^2)^3)/a/x^3,or(not(number(a)),a>0))",
        "f(sqrt(a*x^2+b),x*sqrt(a*x^2+b)/2+b*log(x*sqrt(a)+sqrt(a*x^2+b))/2/sqrt(a),and(number(a),a>0))",
        "f(sqrt(a*x^2+b),x*sqrt(a*x^2+b)/2+b*arcsin(x*sqrt(-a/b))/2/sqrt(-a),and(number(a),a<0))",
        "f(sin(a*x),-cos(a*x)/a)",
        "f(cos(a*x),sin(a*x)/a)",
        "f(tan(a*x),-log(cos(a*x))/a)",
        "f(1/tan(a*x),log(sin(a*x))/a)",
        "f(1/cos(a*x),log(tan(pi/4+a*x/2))/a)",
        "f(1/sin(a*x),log(tan(a*x/2))/a)",
        "f(sin(a*x)^2,x/2-sin(2*a*x)/(4*a))",
        "f(sin(a*x)^3,-cos(a*x)*(sin(a*x)^2+2)/(3*a))",
        "f(sin(a*x)^4,3/8*x-sin(2*a*x)/(4*a)+sin(4*a*x)/(32*a))",
        "f(cos(a*x)^2,x/2+sin(2*a*x)/(4*a))",
        "f(cos(a*x)^3,sin(a*x)*(cos(a*x)^2+2)/(3*a))",
        "f(cos(a*x)^4,3/8*x+sin(2*a*x)/(4*a)+sin(4*a*x)/(32*a))",
        "f(1/sin(a*x)^2,-1/(a*tan(a*x)))",
        "f(1/cos(a*x)^2,tan(a*x)/a)",
        "f(sin(a*x)*cos(a*x),sin(a*x)^2/(2*a))",
        "f(sin(a*x)^2*cos(a*x)^2,-sin(4*a*x)/(32*a)+x/8)",
        "f(sin(a*x)/cos(a*x)^2,1/(a*cos(a*x)))",
        "f(sin(a*x)^2/cos(a*x),(log(tan(pi/4+a*x/2))-sin(a*x))/a)",
        "f(cos(a*x)/sin(a*x)^2,-1/(a*sin(a*x)))",
        "f(1/(sin(a*x)*cos(a*x)),log(tan(a*x))/a)",
        "f(1/(sin(a*x)*cos(a*x)^2),(1/cos(a*x)+log(tan(a*x/2)))/a)",
        "f(1/(sin(a*x)^2*cos(a*x)),(log(tan(pi/4+a*x/2))-1/sin(a*x))/a)",
        "f(1/(sin(a*x)^2*cos(a*x)^2),-2/(a*tan(2*a*x)))",
        "f(sin(a+b*x),-cos(a+b*x)/b)",
        "f(cos(a+b*x),sin(a+b*x)/b)",
        "f(1/(b+b*sin(a*x)),-tan(pi/4-a*x/2)/a/b)",
        "f(1/(b-b*sin(a*x)),tan(pi/4+a*x/2)/a/b)",
        "f(1/(b+b*cos(a*x)),tan(a*x/2)/a/b)",
        "f(1/(b-b*cos(a*x)),-1/tan(a*x/2)/a/b)",
        "f(1/(a+b*sin(x)),1/sqrt(b^2-a^2)*log((a*tan(x/2)+b-sqrt(b^2-a^2))/(a*tan(x/2)+b+sqrt(b^2-a^2))),b^2-a^2)",
        "f(1/(a+b*cos(x)),1/sqrt(b^2-a^2)*log((sqrt(b^2-a^2)*tan(x/2)+a+b)/(sqrt(b^2-a^2)*tan(x/2)-a-b)),b^2-a^2)",
        "f(x*sin(a*x),sin(a*x)/a^2-x*cos(a*x)/a)",
        "f(x^2*sin(a*x),2*x*sin(a*x)/a^2-(a^2*x^2-2)*cos(a*x)/a^3)",
        "f(x*cos(a*x),cos(a*x)/a^2+x*sin(a*x)/a)",
        "f(x^2*cos(a*x),2*x*cos(a*x)/a^2+(a^2*x^2-2)*sin(a*x)/a^3)",
        "f(arcsin(a*x),x*arcsin(a*x)+sqrt(1-a^2*x^2)/a)",
        "f(arccos(a*x),x*arccos(a*x)-sqrt(1-a^2*x^2)/a)",
        "f(arctan(a*x),x*arctan(a*x)-1/2*log(1+a^2*x^2)/a)",
        "f(x*log(a*x),x^2*log(a*x)/2-x^2/4)",
        "f(x^2*log(a*x),x^3*log(a*x)/3-1/9*x^3)",
        "f(log(x)^2,x*log(x)^2-2*x*log(x)+2*x)",
        "f(1/x*1/(a+log(x)),log(a+log(x)))",
        "f(log(a*x+b),(a*x+b)*log(a*x+b)/a-x)",
        "f(log(a*x+b)/x^2,a/b*log(x)-(a*x+b)*log(a*x+b)/b/x)",
        "f(sinh(x),cosh(x))",
        "f(cosh(x),sinh(x))",
        "f(tanh(x),log(cosh(x)))",
        "f(x*sinh(x),x*cosh(x)-sinh(x))",
        "f(x*cosh(x),x*sinh(x)-cosh(x))",
        "f(sinh(x)^2,sinh(2*x)/4-x/2)",
        "f(tanh(x)^2,x-tanh(x))",
        "f(cosh(x)^2,sinh(2*x)/4+x/2)",
        "f(x^3*exp(a*x^2),exp(a*x^2)*(x^2/a-1/(a^2))/2)",
        "f(x^3*exp(a*x^2+b),exp(a*x^2)*exp(b)*(x^2/a-1/(a^2))/2)",
        "f(exp(a*x^2),-i*sqrt(pi)*erf(i*sqrt(a)*x)/sqrt(a)/2)",
        "f(erf(a*x),x*erf(a*x)+exp(-a^2*x^2)/a/sqrt(pi))",
        "f(x^2*(1-x^2)^(3/2),(x*sqrt(1-x^2)*(-8*x^4+14*x^2-3)+3*arcsin(x))/48)",
        "f(x^2*(1-x^2)^(5/2),(x*sqrt(1-x^2)*(48*x^6-136*x^4+118*x^2-15)+15*arcsin(x))/384)",
        "f(x^4*(1-x^2)^(3/2),(-x*sqrt(1-x^2)*(16*x^6-24*x^4+2*x^2+3)+3*arcsin(x))/128)",
        "f(x*exp(a*x),exp(a*x)*(a*x-1)/(a^2))",
        "f(x*exp(a*x+b),exp(a*x+b)*(a*x-1)/(a^2))",
        "f(x^2*exp(a*x),exp(a*x)*(a^2*x^2-2*a*x+2)/(a^3))",
        "f(x^2*exp(a*x+b),exp(a*x+b)*(a^2*x^2-2*a*x+2)/(a^3))",
        "f(x^3*exp(a*x),exp(a*x)*x^3/a-3/a*integral(x^2*exp(a*x),x))",
        "f(x^3*exp(a*x+b),exp(a*x+b)*x^3/a-3/a*integral(x^2*exp(a*x+b),x))"
      ];
      function Eval_integral(p1) {
        let n = 0;
        p1 = defs_1.cdr(p1);
        let F = eval_1.Eval(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        const p2 = eval_1.Eval(defs_1.car(p1));
        let N, X;
        if (p2 === defs_1.symbol(defs_1.NIL)) {
          X = guess_1.guess(F);
          N = defs_1.symbol(defs_1.NIL);
        } else if (defs_1.isNumericAtom(p2)) {
          X = guess_1.guess(F);
          N = p2;
        } else {
          X = p2;
          p1 = defs_1.cdr(p1);
          N = eval_1.Eval(defs_1.car(p1));
        }
        while (true) {
          if (defs_1.isNumericAtom(N)) {
            n = bignum_1.nativeInt(N);
            if (isNaN(n)) {
              run_1.stop("nth integral: check n");
            }
          } else {
            n = 1;
          }
          let temp = F;
          if (n >= 0) {
            for (let i = 0; i < n; i++) {
              temp = integral(temp, X);
            }
          } else {
            n = -n;
            for (let i = 0; i < n; i++) {
              temp = derivative_1.derivative(temp, X);
            }
          }
          F = temp;
          if (N === defs_1.symbol(defs_1.NIL)) {
            break;
          }
          if (defs_1.isNumericAtom(N)) {
            p1 = defs_1.cdr(p1);
            N = eval_1.Eval(defs_1.car(p1));
            if (N === defs_1.symbol(defs_1.NIL)) {
              break;
            }
            if (!defs_1.isNumericAtom(N)) {
              X = N;
              p1 = defs_1.cdr(p1);
              N = eval_1.Eval(defs_1.car(p1));
            }
          } else {
            X = N;
            p1 = defs_1.cdr(p1);
            N = eval_1.Eval(defs_1.car(p1));
          }
        }
        stack_1.push(F);
      }
      exports.Eval_integral = Eval_integral;
      function integral(F, X) {
        let integ;
        if (defs_1.isadd(F)) {
          integ = integral_of_sum(F, X);
        } else if (defs_1.ismultiply(F)) {
          integ = integral_of_product(F, X);
        } else {
          integ = integral_of_form(F, X);
        }
        if (find_1.Find(integ, defs_1.symbol(defs_1.INTEGRAL))) {
          run_1.stop("integral: sorry, could not find a solution");
        }
        return eval_1.Eval(simplify_1.simplify(integ));
      }
      exports.integral = integral;
      function integral_of_sum(F, X) {
        F = defs_1.cdr(F);
        let result = integral(defs_1.car(F), X);
        if (defs_1.iscons(F)) {
          result = F.tail().reduce((acc, b) => add_1.add(acc, integral(b, X)), result);
        }
        return result;
      }
      function integral_of_product(F, X) {
        const [constantExpr, variableExpr] = partition_1.partition(F, X);
        return multiply_1.multiply(constantExpr, integral_of_form(variableExpr, X));
      }
      function integral_of_form(F, X) {
        const hc = italu_hashcode(F, X).toFixed(6);
        const tab = hashed_itab[hc];
        if (!tab) {
          return list_1.makeList(defs_1.symbol(defs_1.INTEGRAL), F, X);
        }
        const [p3, _] = transform_1.transform(F, X, tab, false);
        if (p3 === defs_1.symbol(defs_1.NIL)) {
          return list_1.makeList(defs_1.symbol(defs_1.INTEGRAL), F, X);
        }
        return p3;
      }
      var hashcode_values = {
        x: 0.95532,
        constexp: 1.43762,
        constant: 1.1441659362941434,
        constbase: 1.2036412230421882,
        sin: 1.7330548251830322,
        arcsin: 1.6483368529465805,
        cos: 1.0586721236863401,
        arccos: 1.8405225918106694,
        tan: 1.1224943776292506,
        arctan: 1.1297397925394963,
        sinh: 1.8176164926060079,
        cosh: 1.9404934661708022,
        tanh: 1.6421307715103122,
        log: 1.477443701354924,
        erf: 1.0825269225702916
      };
      function italu_hashcode(u, x) {
        if (defs_1.issymbol(u)) {
          if (misc_1.equal(u, x)) {
            return hashcode_values.x;
          } else {
            return hashcode_values.constant;
          }
        } else if (defs_1.iscons(u)) {
          switch (symbol_1.symnum(defs_1.car(u))) {
            case defs_1.ADD:
              return hash_addition(defs_1.cdr(u), x);
            case defs_1.MULTIPLY:
              return hash_multiplication(defs_1.cdr(u), x);
            case defs_1.POWER:
              return hash_power(defs_1.cadr(u), defs_1.caddr(u), x);
            case defs_1.EXP:
              return hash_power(defs_1.symbol(defs_1.E), defs_1.cadr(u), x);
            case defs_1.SQRT:
              bignum_1.push_double(0.5);
              var half = stack_1.pop();
              return hash_power(defs_1.cadr(u), half, x);
            default:
              return hash_function(u, x);
          }
        }
        return hashcode_values.constant;
      }
      function hash_function(u, x) {
        if (!find_1.Find(defs_1.cadr(u), x)) {
          return hashcode_values.constant;
        }
        const name = defs_1.car(u);
        const arg_hash = italu_hashcode(defs_1.cadr(u), x);
        const base = hashcode_values[name.printname];
        if (!base) {
          throw new Error("Unsupported function " + name.printname);
        }
        return Math.pow(base, arg_hash);
      }
      function hash_addition(terms, x) {
        const term_set = {};
        while (defs_1.iscons(terms)) {
          const term = defs_1.car(terms);
          terms = defs_1.cdr(terms);
          let term_hash = 0;
          if (find_1.Find(term, x)) {
            term_hash = italu_hashcode(term, x);
          } else {
            term_hash = hashcode_values.constant;
          }
          term_set[term_hash.toFixed(6)] = true;
        }
        let sum = 0;
        for (let k of Object.keys(term_set || {})) {
          const v = term_set[k];
          sum = sum + Number(k);
        }
        return sum;
      }
      function hash_multiplication(terms, x) {
        let product = 1;
        if (defs_1.iscons(terms)) {
          [...terms].forEach((term) => {
            if (find_1.Find(term, x)) {
              product = product * italu_hashcode(term, x);
            }
          });
        }
        return product;
      }
      function hash_power(base, power, x) {
        let base_hash = hashcode_values.constant;
        let exp_hash = hashcode_values.constexp;
        if (find_1.Find(base, x)) {
          base_hash = italu_hashcode(base, x);
        }
        if (find_1.Find(power, x)) {
          exp_hash = italu_hashcode(power, x);
        } else {
          if (base_hash === hashcode_values.constant) {
            return hashcode_values.constant;
          }
          if (is_1.isminusone(power)) {
            exp_hash = -1;
          } else if (is_1.isoneovertwo(power)) {
            exp_hash = 0.5;
          } else if (is_1.isminusoneovertwo(power)) {
            exp_hash = -0.5;
          } else if (is_1.equalq(power, 2, 1)) {
            exp_hash = 2;
          } else if (is_1.equalq(power, -2, 1)) {
            exp_hash = -2;
          }
        }
        return Math.pow(base_hash, exp_hash);
      }
      function make_hashed_itab() {
        const tab = {};
        for (let s of Array.from(itab)) {
          scan_1.scan_meta(s);
          const f = stack_1.pop();
          const u = defs_1.cadr(f);
          const h = italu_hashcode(u, defs_1.symbol(defs_1.METAX));
          const key = h.toFixed(6);
          if (!tab[key]) {
            tab[key] = [];
          }
          tab[key].push(s);
        }
        console.log(`hashed_itab = ${JSON.stringify(tab, null, 2)}`);
        return tab;
      }
      exports.make_hashed_itab = make_hashed_itab;
      var hashed_itab = {
        "1.144166": ["f(a,a*x)"],
        "1.046770": ["f(1/x,log(x))"],
        "0.936400": ["f(x^a,x^(a+1)/(a+1))"],
        "1.095727": ["f(x^(-2),-x^(-1))"],
        "1.023118": ["f(x^(-1/2),2*x^(1/2))"],
        "0.977405": ["f(x^(1/2),2/3*x^(3/2))"],
        "0.955320": ["f(x,x^2/2)"],
        "0.912636": ["f(x^2,x^3/3)"],
        "1.137302": [
          "f(exp(a*x),1/a*exp(a*x))",
          "f(a^x,a^x/log(a),or(not(number(a)),a>0))"
        ],
        "1.326774": ["f(exp(a*x+b),1/a*exp(a*x+b))"],
        "1.080259": ["f(x*exp(a*x^2),exp(a*x^2)/(2*a))"],
        "1.260228": ["f(x*exp(a*x^2+b),exp(a*x^2+b)/(2*a))"],
        "1.451902": ["f(log(a*x),x*log(a*x)-x)"],
        "0.486192": [
          "f(1/(a+x^2),1/sqrt(a)*arctan(x/sqrt(a)),or(not(number(a)),a>0))",
          "f(1/(a-x^2),1/sqrt(a)*arctanh(x/sqrt(a)))",
          "f(1/(a+b*x^2),1/sqrt(a*b)*arctan(x*sqrt(a*b)/a),or(not(number(a*b)),a*b>0))",
          "f(1/(a+b*x^2),1/(2*sqrt(-a*b))*log((a+x*sqrt(-a*b))/(a-x*sqrt(-a*b))),or(not(number(a*b)),a*b<0))"
        ],
        "0.697274": [
          "f(1/sqrt(a-x^2),arcsin(x/(sqrt(a))))",
          "f(1/sqrt(a+x^2),log(x+sqrt(a+x^2)))",
          "f(1/sqrt(x^2+a),log(x+sqrt(x^2+a)))"
        ],
        "0.476307": ["f(1/(a+b*x),1/b*log(a+b*x))"],
        "0.226868": ["f(1/(a+b*x)^2,-1/(b*(a+b*x)))"],
        "2.904531": ["f(1/(a+b*x)^3,-1/(2*b)*1/(a+b*x)^2)"],
        "0.455026": ["f(x/(a+b*x),x/b-a*log(a+b*x)/b/b)"],
        "0.216732": ["f(x/(a+b*x)^2,1/b^2*(log(a+b*x)+a/(a+b*x)))"],
        "0.434695": [
          "f(x^2/(a+b*x),1/b^2*(1/2*(a+b*x)^2-2*a*(a+b*x)+a^2*log(a+b*x)))"
        ],
        "0.207048": ["f(x^2/(a+b*x)^2,1/b^3*(a+b*x-2*a*log(a+b*x)-a^2/(a+b*x)))"],
        "2.650781": [
          "f(x^2/(a+b*x)^3,1/b^3*(log(a+b*x)+2*a/(a+b*x)-1/2*a^2/(a+b*x)^2))"
        ],
        "0.498584": ["f(1/x*1/(a+b*x),-1/a*log((a+b*x)/x))"],
        "0.237479": ["f(1/x*1/(a+b*x)^2,1/a*1/(a+b*x)-1/a^2*log((a+b*x)/x))"],
        "3.040375": [
          "f(1/x*1/(a+b*x)^3,1/a^3*(1/2*((2*a+b*x)/(a+b*x))^2+log(x/(a+b*x))))"
        ],
        "0.521902": ["f(1/x^2*1/(a+b*x),-1/(a*x)+b/a^2*log((a+b*x)/x))"],
        "0.446014": [
          "f(1/x^3*1/(a+b*x),(2*b*x-a)/(2*a^2*x^2)+b^2/a^3*log(x/(a+b*x)))"
        ],
        "0.248586": [
          "f(1/x^2*1/(a+b*x)^2,-(a+2*b*x)/(a^2*x*(a+b*x))+2*b/a^3*log((a+b*x)/x))"
        ],
        "0.464469": ["f(x/(a+b*x^2),1/2*1/b*log(a+b*x^2))"],
        "0.443716": ["f(x^2/(a+b*x^2),x/b-a/b*integral(1/(a+b*x^2),x))"],
        "0.236382": [
          "f(1/(a+b*x^2)^2,x/(2*a*(a+b*x^2))+1/2*1/a*integral(1/(a+b*x^2),x))"
        ],
        "0.508931": ["f(1/x*1/(a+b*x^2),1/2*1/a*log(x^2/(a+b*x^2)))"],
        "0.532733": ["f(1/x^2*1/(a+b*x^2),-1/(a*x)-b/a*integral(1/(a+b*x^2),x))"],
        "0.480638": [
          "f(1/(a+b*x^3),1/3*1/a*(a/b)^(1/3)*(1/2*log(((a/b)^(1/3)+x)^3/(a+b*x^3))+sqrt(3)*arctan((2*x-(a/b)^(1/3))*(a/b)^(-1/3)/sqrt(3))))"
        ],
        "0.438648": ["f(x^2/(a+b*x^3),1/3*1/b*log(a+b*x^3))"],
        "0.459164": [
          "f(x/(a+b*x^4),1/2*sqrt(b/a)/b*arctan(x^2*sqrt(b/a)),or(not(number(a*b)),a*b>0))",
          "f(x/(a+b*x^4),1/4*sqrt(-b/a)/b*log((x^2-sqrt(-a/b))/(x^2+sqrt(-a/b))),or(not(number(a*b)),a*b<0))"
        ],
        "0.450070": ["f(x^3/(a+b*x^4),1/4*1/b*log(a+b*x^4))"],
        "1.448960": ["f(sqrt(a+b*x),2/3*1/b*sqrt((a+b*x)^3))"],
        "1.384221": ["f(x*sqrt(a+b*x),-2*(2*a-3*b*x)*sqrt((a+b*x)^3)/15/b^2)"],
        "1.322374": [
          "f(x^2*sqrt(a+b*x),2*(8*a^2-12*a*b*x+15*b^2*x^2)*sqrt((a+b*x)^3)/105/b^3)"
        ],
        "1.516728": [
          "f(sqrt(a+b*x)/x,2*sqrt(a+b*x)+a*integral(1/x*1/sqrt(a+b*x),x))"
        ],
        "1.587665": [
          "f(sqrt(a+b*x)/x^2,-sqrt(a+b*x)/x+b/2*integral(1/x*1/sqrt(a+b*x),x))"
        ],
        "0.690150": ["f(1/sqrt(a+b*x),2*sqrt(a+b*x)/b)"],
        "0.659314": ["f(x/sqrt(a+b*x),-2/3*(2*a-b*x)*sqrt(a+b*x)/b^2)"],
        "0.629856": [
          "f(x^2/sqrt(a+b*x),2/15*(8*a^2-4*a*b*x+3*b^2*x^2)*sqrt(a+b*x)/b^3)"
        ],
        "0.722428": [
          "f(1/x*1/sqrt(a+b*x),1/sqrt(a)*log((sqrt(a+b*x)-sqrt(a))/(sqrt(a+b*x)+sqrt(a))),or(not(number(a)),a>0))",
          "f(1/x*1/sqrt(a+b*x),2/sqrt(-a)*arctan(sqrt(-(a+b*x)/a)),or(not(number(a)),a<0))"
        ],
        "0.756216": [
          "f(1/x^2*1/sqrt(a+b*x),-sqrt(a+b*x)/a/x-1/2*b/a*integral(1/x*1/sqrt(a+b*x),x))"
        ],
        "1.434156": [
          "f(sqrt(x^2+a),1/2*(x*sqrt(x^2+a)+a*log(x+sqrt(x^2+a))))",
          "f(sqrt(a-x^2),1/2*(x*sqrt(a-x^2)+a*arcsin(x/sqrt(abs(a)))))",
          "f(sqrt(a*x^2+b),x*sqrt(a*x^2+b)/2+b*log(x*sqrt(a)+sqrt(a*x^2+b))/2/sqrt(a),and(number(a),a>0))",
          "f(sqrt(a*x^2+b),x*sqrt(a*x^2+b)/2+b*arcsin(x*sqrt(-a/b))/2/sqrt(-a),and(number(a),a<0))"
        ],
        "0.729886": [
          "f(1/x*1/sqrt(x^2+a),arcsec(x/sqrt(-a))/sqrt(-a),or(not(number(a)),a<0))",
          "f(1/x*1/sqrt(x^2+a),-1/sqrt(a)*log((sqrt(a)+sqrt(x^2+a))/x),or(not(number(a)),a>0))",
          "f(1/x*1/sqrt(a-x^2),-1/sqrt(a)*log((sqrt(a)+sqrt(a-x^2))/x),or(not(number(a)),a>0))"
        ],
        "1.501230": [
          "f(sqrt(x^2+a)/x,sqrt(x^2+a)-sqrt(a)*log((sqrt(a)+sqrt(x^2+a))/x),or(not(number(a)),a>0))",
          "f(sqrt(x^2+a)/x,sqrt(x^2+a)-sqrt(-a)*arcsec(x/sqrt(-a)),or(not(number(a)),a<0))",
          "f(sqrt(a-x^2)/x,sqrt(a-x^2)-sqrt(a)*log((sqrt(a)+sqrt(a-x^2))/x),or(not(number(a)),a>0))"
        ],
        "0.666120": ["f(x/sqrt(x^2+a),sqrt(x^2+a))", "f(x/sqrt(a-x^2),-sqrt(a-x^2))"],
        "1.370077": [
          "f(x*sqrt(x^2+a),1/3*sqrt((x^2+a)^3))",
          "f(x*sqrt(a-x^2),-1/3*sqrt((a-x^2)^3))"
        ],
        "1.730087": [
          "f(sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/4*(x*sqrt((x^2+a^(1/3))^3)+3/2*a^(1/3)*x*sqrt(x^2+a^(1/3))+3/2*a^(2/3)*log(x+sqrt(x^2+a^(1/3)))))",
          "f(sqrt(-a+x^6-3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/4*(x*sqrt((x^2-a^(1/3))^3)-3/2*a^(1/3)*x*sqrt(x^2-a^(1/3))+3/2*a^(2/3)*log(x+sqrt(x^2-a^(1/3)))))"
        ],
        "0.578006": [
          "f(1/sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),x/a^(1/3)/sqrt(x^2+a^(1/3)))"
        ],
        "0.552180": [
          "f(x/sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),-1/sqrt(x^2+a^(1/3)))"
        ],
        "1.652787": [
          "f(x*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/5*sqrt((x^2+a^(1/3))^5))"
        ],
        "1.308862": [
          "f(x^2*sqrt(x^2+a),1/4*x*sqrt((x^2+a)^3)-1/8*a*x*sqrt(x^2+a)-1/8*a^2*log(x+sqrt(x^2+a)))",
          "f(x^2*sqrt(a-x^2),-x/4*sqrt((a-x^2)^3)+1/8*a*(x*sqrt(a-x^2)+a*arcsin(x/sqrt(a))),or(not(number(a)),a>0))"
        ],
        "1.342944": [
          "f(x^3*sqrt(x^2+a),(1/5*x^2-2/15*a)*sqrt((x^2+a)^3),and(number(a),a>0))",
          "f(x^3*sqrt(x^2+a),sqrt((x^2+a)^5)/5-a*sqrt((x^2+a)^3)/3,and(number(a),a<0))",
          "f(x^3*sqrt(a-x^2),(-1/5*x^2-2/15*a)*sqrt((a-x^2)^3),or(not(number(a)),a>0))",
          "f(sqrt(a-x^2)/x^3,-1/2*sqrt(a-x^2)/x^2+1/2*log((sqrt(a)+sqrt(a-x^2))/x)/sqrt(a),or(not(number(a)),a>0))",
          "f(sqrt(a-x^2)/x^4,-1/3*sqrt((a-x^2)^3)/a/x^3,or(not(number(a)),a>0))"
        ],
        "0.636358": [
          "f(x^2/sqrt(x^2+a),1/2*x*sqrt(x^2+a)-1/2*a*log(x+sqrt(x^2+a)))",
          "f(x^2/sqrt(a-x^2),-x/2*sqrt(a-x^2)+a/2*arcsin(x/sqrt(a)),or(not(number(a)),a>0))"
        ],
        "0.652928": [
          "f(x^3/sqrt(x^2+a),1/3*sqrt((x^2+a)^3)-a*sqrt(x^2+a))",
          "f(1/x^3*1/sqrt(x^2+a),-1/2*sqrt(x^2+a)/a/x^2+1/2*log((sqrt(a)+sqrt(x^2+a))/x)/a^(3/2),or(not(number(a)),a>0))",
          "f(1/x^3*1/sqrt(x^2-a),1/2*sqrt(x^2-a)/a/x^2+1/2*1/(a^(3/2))*arcsec(x/(a^(1/2))),or(not(number(a)),a>0))"
        ],
        "0.764022": [
          "f(1/x^2*1/sqrt(x^2+a),-sqrt(x^2+a)/a/x)",
          "f(1/x^2*1/sqrt(a-x^2),-sqrt(a-x^2)/a/x,or(not(number(a)),a>0))"
        ],
        "1.578940": [
          "f(x^2*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/6*x*sqrt((x^2+a^(1/3))^5)-1/24*a^(1/3)*x*sqrt((x^2+a^(1/3))^3)-1/16*a^(2/3)*x*sqrt(x^2+a^(1/3))-1/16*a*log(x+sqrt(x^2+a^(1/3))),or(not(number(a)),a>0))",
          "f(x^2*sqrt(-a-3*a^(1/3)*x^4+3*a^(2/3)*x^2+x^6),1/6*x*sqrt((x^2-a^(1/3))^5)+1/24*a^(1/3)*x*sqrt((x^2-a^(1/3))^3)-1/16*a^(2/3)*x*sqrt(x^2-a^(1/3))+1/16*a*log(x+sqrt(x^2-a^(1/3))),or(not(number(a)),a>0))"
        ],
        "1.620055": [
          "f(x^3*sqrt(a+x^6+3*a^(1/3)*x^4+3*a^(2/3)*x^2),1/7*sqrt((x^2+a^(1/3))^7)-1/5*a^(1/3)*sqrt((x^2+a^(1/3))^5),or(not(number(a)),a>0))",
          "f(x^3*sqrt(-a-3*a^(1/3)*x^4+3*a^(2/3)*x^2+x^6),1/7*sqrt((x^2-a^(1/3))^7)+1/5*a^(1/3)*sqrt((x^2-a^(1/3))^5),or(not(number(a)),a>0))"
        ],
        "0.332117": [
          "f(1/(x-a)/sqrt(x^2-a^2),-sqrt(x^2-a^2)/a/(x-a))",
          "f(1/(x+a)/sqrt(x^2-a^2),sqrt(x^2-a^2)/a/(x+a))"
        ],
        "1.571443": [
          "f(sqrt(a-x^2)/x^2,-sqrt(a-x^2)/x-arcsin(x/sqrt(a)),or(not(number(a)),a>0))"
        ],
        "1.690994": ["f(sin(a*x),-cos(a*x)/a)"],
        "1.055979": ["f(cos(a*x),sin(a*x)/a)"],
        "1.116714": ["f(tan(a*x),-log(cos(a*x))/a)"],
        "0.895484": ["f(1/tan(a*x),log(sin(a*x))/a)"],
        "0.946989": ["f(1/cos(a*x),log(tan(pi/4+a*x/2))/a)"],
        "0.591368": ["f(1/sin(a*x),log(tan(a*x/2))/a)"],
        "2.859462": ["f(sin(a*x)^2,x/2-sin(2*a*x)/(4*a))"],
        "2.128050": [
          "f(sin(a*x)^3,-cos(a*x)*(sin(a*x)^2+2)/(3*a))",
          "f(sin(a*x)^4,3/8*x-sin(2*a*x)/(4*a)+sin(4*a*x)/(32*a))"
        ],
        "1.115091": ["f(cos(a*x)^2,x/2+sin(2*a*x)/(4*a))"],
        "1.081452": [
          "f(cos(a*x)^3,sin(a*x)*(cos(a*x)^2+2)/(3*a))",
          "f(cos(a*x)^4,3/8*x+sin(2*a*x)/(4*a)+sin(4*a*x)/(32*a))"
        ],
        "0.349716": ["f(1/sin(a*x)^2,-1/(a*tan(a*x)))"],
        "0.896788": ["f(1/cos(a*x)^2,tan(a*x)/a)"],
        "1.785654": ["f(sin(a*x)*cos(a*x),sin(a*x)^2/(2*a))"],
        "3.188560": ["f(sin(a*x)^2*cos(a*x)^2,-sin(4*a*x)/(32*a)+x/8)"],
        "1.516463": ["f(sin(a*x)/cos(a*x)^2,1/(a*cos(a*x)))"],
        "2.707879": ["f(sin(a*x)^2/cos(a*x),(log(tan(pi/4+a*x/2))-sin(a*x))/a)"],
        "0.369293": ["f(cos(a*x)/sin(a*x)^2,-1/(a*sin(a*x)))"],
        "0.560019": ["f(1/(sin(a*x)*cos(a*x)),log(tan(a*x))/a)"],
        "0.530332": ["f(1/(sin(a*x)*cos(a*x)^2),(1/cos(a*x)+log(tan(a*x/2)))/a)"],
        "0.331177": [
          "f(1/(sin(a*x)^2*cos(a*x)),(log(tan(pi/4+a*x/2))-1/sin(a*x))/a)"
        ],
        "0.313621": ["f(1/(sin(a*x)^2*cos(a*x)^2),-2/(a*tan(2*a*x)))"],
        "3.172365": ["f(sin(a+b*x),-cos(a+b*x)/b)"],
        "1.127162": ["f(cos(a+b*x),sin(a+b*x)/b)"],
        "0.352714": [
          "f(1/(b+b*sin(a*x)),-tan(pi/4-a*x/2)/a/b)",
          "f(1/(b-b*sin(a*x)),tan(pi/4+a*x/2)/a/b)",
          "f(1/(a+b*sin(x)),1/sqrt(b^2-a^2)*log((a*tan(x/2)+b-sqrt(b^2-a^2))/(a*tan(x/2)+b+sqrt(b^2-a^2))),b^2-a^2)"
        ],
        "0.454515": [
          "f(1/(b+b*cos(a*x)),tan(a*x/2)/a/b)",
          "f(1/(b-b*cos(a*x)),-1/tan(a*x/2)/a/b)",
          "f(1/(a+b*cos(x)),1/sqrt(b^2-a^2)*log((sqrt(b^2-a^2)*tan(x/2)+a+b)/(sqrt(b^2-a^2)*tan(x/2)-a-b)),b^2-a^2)"
        ],
        "1.615441": ["f(x*sin(a*x),sin(a*x)/a^2-x*cos(a*x)/a)"],
        "1.543263": ["f(x^2*sin(a*x),2*x*sin(a*x)/a^2-(a^2*x^2-2)*cos(a*x)/a^3)"],
        "1.008798": ["f(x*cos(a*x),cos(a*x)/a^2+x*sin(a*x)/a)"],
        "0.963724": ["f(x^2*cos(a*x),2*x*cos(a*x)/a^2+(a^2*x^2-2)*sin(a*x)/a^3)"],
        "1.611938": ["f(arcsin(a*x),x*arcsin(a*x)+sqrt(1-a^2*x^2)/a)"],
        "1.791033": ["f(arccos(a*x),x*arccos(a*x)-sqrt(1-a^2*x^2)/a)"],
        "1.123599": ["f(arctan(a*x),x*arctan(a*x)-1/2*log(1+a^2*x^2)/a)"],
        "1.387031": ["f(x*log(a*x),x^2*log(a*x)/2-x^2/4)"],
        "1.325058": ["f(x^2*log(a*x),x^3*log(a*x)/3-1/9*x^3)"],
        "2.108018": ["f(log(x)^2,x*log(x)^2-2*x*log(x)+2*x)"],
        "0.403214": ["f(1/x*1/(a+log(x)),log(a+log(x)))"],
        "2.269268": ["f(log(a*x+b),(a*x+b)*log(a*x+b)/a-x)"],
        "2.486498": ["f(log(a*x+b)/x^2,a/b*log(x)-(a*x+b)*log(a*x+b)/b/x)"],
        "1.769733": ["f(sinh(x),cosh(x))"],
        "1.883858": ["f(cosh(x),sinh(x))"],
        "1.606140": ["f(tanh(x),log(cosh(x)))"],
        "1.690661": ["f(x*sinh(x),x*cosh(x)-sinh(x))"],
        "1.799688": ["f(x*cosh(x),x*sinh(x)-cosh(x))"],
        "3.131954": ["f(sinh(x)^2,sinh(2*x)/4-x/2)"],
        "2.579685": ["f(tanh(x)^2,x-tanh(x))"],
        "3.548923": ["f(cosh(x)^2,sinh(2*x)/4+x/2)"],
        "1.058866": ["f(x^3*exp(a*x^2),exp(a*x^2)*(x^2/a-1/(a^2))/2)"],
        "1.235270": ["f(x^3*exp(a*x^2+b),exp(a*x^2)*exp(b)*(x^2/a-1/(a^2))/2)"],
        "1.130783": ["f(exp(a*x^2),-i*sqrt(pi)*erf(i*sqrt(a)*x)/sqrt(a)/2)"],
        "1.078698": ["f(erf(a*x),x*erf(a*x)+exp(-a^2*x^2)/a/sqrt(pi))"],
        "2.573650": [
          "f(x^2*(1-x^2)^(3/2),(x*sqrt(1-x^2)*(-8*x^4+14*x^2-3)+3*arcsin(x))/48)",
          "f(x^2*(1-x^2)^(5/2),(x*sqrt(1-x^2)*(48*x^6-136*x^4+118*x^2-15)+15*arcsin(x))/384)"
        ],
        "2.640666": [
          "f(x^4*(1-x^2)^(3/2),(-x*sqrt(1-x^2)*(16*x^6-24*x^4+2*x^2+3)+3*arcsin(x))/128)"
        ],
        "1.086487": ["f(x*exp(a*x),exp(a*x)*(a*x-1)/(a^2))"],
        "1.267493": ["f(x*exp(a*x+b),exp(a*x+b)*(a*x-1)/(a^2))"],
        "1.037943": ["f(x^2*exp(a*x),exp(a*x)*(a^2*x^2-2*a*x+2)/(a^3))"],
        "1.210862": ["f(x^2*exp(a*x+b),exp(a*x+b)*(a^2*x^2-2*a*x+2)/(a^3))"],
        "1.064970": ["f(x^3*exp(a*x),exp(a*x)*x^3/a-3/a*integral(x^2*exp(a*x),x))"],
        "1.242392": [
          "f(x^3*exp(a*x+b),exp(a*x+b)*x^3/a-3/a*integral(x^2*exp(a*x+b),x))"
        ]
      };
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/defint.js
  var require_defint = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/defint.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_defint = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var integral_1 = require_integral();
      var subst_1 = require_subst();
      function Eval_defint(p1) {
        let F = eval_1.Eval(defs_1.cadr(p1));
        p1 = defs_1.cddr(p1);
        while (defs_1.iscons(p1)) {
          const X = eval_1.Eval(defs_1.car(p1));
          p1 = defs_1.cdr(p1);
          const A = eval_1.Eval(defs_1.car(p1));
          p1 = defs_1.cdr(p1);
          const B = eval_1.Eval(defs_1.car(p1));
          p1 = defs_1.cdr(p1);
          F = integral_1.integral(F, X);
          const arg1 = eval_1.Eval(subst_1.subst(F, X, B));
          const arg2 = eval_1.Eval(subst_1.subst(F, X, A));
          F = add_1.subtract(arg1, arg2);
        }
        stack_1.push(F);
      }
      exports.Eval_defint = Eval_defint;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/degree.js
  var require_degree = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/degree.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.degree = exports.Eval_degree = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var eval_1 = require_eval();
      var guess_1 = require_guess();
      var is_1 = require_is();
      function Eval_degree(p1) {
        p1 = eval_1.Eval(defs_1.caddr(p1));
        const top = eval_1.Eval(defs_1.cadr(p1));
        const variable = p1 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(top) : p1;
        stack_1.push(degree(top, variable));
      }
      exports.Eval_degree = Eval_degree;
      function degree(POLY, X) {
        return yydegree(POLY, X, defs_1.Constants.zero);
      }
      exports.degree = degree;
      function yydegree(POLY, X, DEGREE) {
        if (misc_1.equal(POLY, X)) {
          if (is_1.isZeroAtomOrTensor(DEGREE)) {
            DEGREE = defs_1.Constants.one;
          }
        } else if (defs_1.ispower(POLY)) {
          if (misc_1.equal(defs_1.cadr(POLY), X) && defs_1.isNumericAtom(defs_1.caddr(POLY)) && misc_1.lessp(DEGREE, defs_1.caddr(POLY))) {
            DEGREE = defs_1.caddr(POLY);
          }
        } else if (defs_1.iscons(POLY)) {
          DEGREE = POLY.tail().reduce((a, b) => yydegree(b, X, a), DEGREE);
        }
        return DEGREE;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/eigen.js
  var require_eigen = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/eigen.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_eigenvec = exports.Eval_eigenval = exports.Eval_eigen = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var float_1 = require_float();
      var list_1 = require_list();
      var print_1 = require_print();
      var tensor_1 = require_tensor();
      var EIG_N = 0;
      var EIG_yydd = [];
      var EIG_yyqq = [];
      function Eval_eigen(p1) {
        const { arg } = EIG_check_arg(p1);
        if (!arg) {
          run_1.stop("eigen: argument is not a square matrix");
        }
        let [p2, p3] = eigen(defs_1.EIGEN, arg);
        p1 = symbol_1.usr_symbol("D");
        symbol_1.set_binding(p1, p2);
        p1 = symbol_1.usr_symbol("Q");
        symbol_1.set_binding(p1, p3);
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      exports.Eval_eigen = Eval_eigen;
      function Eval_eigenval(p1) {
        const result = _eigenval(p1);
        stack_1.push(result);
      }
      exports.Eval_eigenval = Eval_eigenval;
      function _eigenval(p1) {
        const { arg, invalid } = EIG_check_arg(p1);
        if (invalid) {
          return list_1.makeList(defs_1.symbol(defs_1.EIGENVAL), invalid);
        }
        let [p2, p3] = eigen(defs_1.EIGENVAL, arg);
        return p2;
      }
      function Eval_eigenvec(p1) {
        const result = _eigenvec(p1);
        stack_1.push(result);
      }
      exports.Eval_eigenvec = Eval_eigenvec;
      function _eigenvec(p1) {
        const { arg, invalid } = EIG_check_arg(p1);
        if (invalid) {
          return list_1.makeList(defs_1.symbol(defs_1.EIGENVEC), invalid);
        }
        let [_, p3] = eigen(defs_1.EIGENVEC, arg);
        return p3;
      }
      function EIG_check_arg(p1) {
        p1 = eval_1.Eval(float_1.yyfloat(eval_1.Eval(defs_1.cadr(p1))));
        if (!defs_1.istensor(p1)) {
          return { invalid: p1 };
        }
        if (p1.tensor.ndim !== 2 || p1.tensor.dim[0] !== p1.tensor.dim[1]) {
          run_1.stop("eigen: argument is not a square matrix");
        }
        EIG_N = p1.tensor.dim[0];
        if (!eigIsDoubleTensor(p1)) {
          run_1.stop("eigen: matrix is not numerical");
        }
        for (let i = 0; i < EIG_N - 1; i++) {
          for (let j = i + 1; j < EIG_N; j++) {
            const eli = p1.tensor.elem[EIG_N * i + j];
            const elj = p1.tensor.elem[EIG_N * j + i];
            if (Math.abs(eli.d - elj.d) > 1e-10) {
              run_1.stop("eigen: matrix is not symmetrical");
            }
          }
        }
        return { arg: p1 };
      }
      function eigIsDoubleTensor(p1) {
        for (let i = 0; i < EIG_N; i++) {
          for (let j = 0; j < EIG_N; j++) {
            if (!defs_1.isdouble(p1.tensor.elem[EIG_N * i + j])) {
              return false;
            }
          }
        }
        return true;
      }
      function eigen(op, p1) {
        for (let i2 = 0; i2 < EIG_N * EIG_N; i2++) {
          EIG_yydd[i2] = 0;
        }
        for (let i2 = 0; i2 < EIG_N * EIG_N; i2++) {
          EIG_yyqq[i2] = 0;
        }
        for (let i2 = 0; i2 < EIG_N; i2++) {
          EIG_yydd[EIG_N * i2 + i2] = p1.tensor.elem[EIG_N * i2 + i2].d;
          for (let j = i2 + 1; j < EIG_N; j++) {
            EIG_yydd[EIG_N * i2 + j] = p1.tensor.elem[EIG_N * i2 + j].d;
            EIG_yydd[EIG_N * j + i2] = p1.tensor.elem[EIG_N * i2 + j].d;
          }
        }
        for (let i2 = 0; i2 < EIG_N; i2++) {
          EIG_yyqq[EIG_N * i2 + i2] = 1;
          for (let j = i2 + 1; j < EIG_N; j++) {
            EIG_yyqq[EIG_N * i2 + j] = 0;
            EIG_yyqq[EIG_N * j + i2] = 0;
          }
        }
        let i = 0;
        for (i = 0; i < 100; i++) {
          if (step() === 0) {
            break;
          }
        }
        if (i === 100) {
          print_1.print_str("\nnote: eigen did not converge\n");
        }
        let D;
        if (op === defs_1.EIGEN || op === defs_1.EIGENVAL) {
          D = tensor_1.copy_tensor(p1);
          for (let i2 = 0; i2 < EIG_N; i2++) {
            for (let j = 0; j < EIG_N; j++) {
              D.tensor.elem[EIG_N * i2 + j] = bignum_1.double(EIG_yydd[EIG_N * i2 + j]);
            }
          }
        }
        let Q;
        if (op === defs_1.EIGEN || op === defs_1.EIGENVEC) {
          Q = tensor_1.copy_tensor(p1);
          for (let i2 = 0; i2 < EIG_N; i2++) {
            for (let j = 0; j < EIG_N; j++) {
              Q.tensor.elem[EIG_N * i2 + j] = bignum_1.double(EIG_yyqq[EIG_N * i2 + j]);
            }
          }
        }
        return [D, Q];
      }
      function step() {
        let count = 0;
        for (let i = 0; i < EIG_N - 1; i++) {
          for (let j = i + 1; j < EIG_N; j++) {
            if (EIG_yydd[EIG_N * i + j] !== 0) {
              step2(i, j);
              count++;
            }
          }
        }
        return count;
      }
      function step2(p, q) {
        const theta = 0.5 * (EIG_yydd[EIG_N * p + p] - EIG_yydd[EIG_N * q + q]) / EIG_yydd[EIG_N * p + q];
        let t = 1 / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        if (theta < 0) {
          t = -t;
        }
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < EIG_N; k++) {
          const cc = EIG_yydd[EIG_N * p + k];
          const ss = EIG_yydd[EIG_N * q + k];
          EIG_yydd[EIG_N * p + k] = c * cc + s * ss;
          EIG_yydd[EIG_N * q + k] = c * ss - s * cc;
        }
        for (let k = 0; k < EIG_N; k++) {
          const cc = EIG_yydd[EIG_N * k + p];
          const ss = EIG_yydd[EIG_N * k + q];
          EIG_yydd[EIG_N * k + p] = c * cc + s * ss;
          EIG_yydd[EIG_N * k + q] = c * ss - s * cc;
        }
        for (let k = 0; k < EIG_N; k++) {
          const cc = EIG_yyqq[EIG_N * p + k];
          const ss = EIG_yyqq[EIG_N * q + k];
          EIG_yyqq[EIG_N * p + k] = c * cc + s * ss;
          EIG_yyqq[EIG_N * q + k] = c * ss - s * cc;
        }
        EIG_yydd[EIG_N * p + q] = 0;
        EIG_yydd[EIG_N * q + p] = 0;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/erfc.js
  var require_erfc = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/erfc.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.erfc = exports.Eval_erfc = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_erfc(p1) {
        const result = yerfc(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_erfc = Eval_erfc;
      function yerfc(p1) {
        if (defs_1.isdouble(p1)) {
          const d = erfc(p1.d);
          return bignum_1.double(d);
        }
        if (is_1.isZeroAtomOrTensor(p1)) {
          return defs_1.Constants.one;
        }
        return list_1.makeList(defs_1.symbol(defs_1.ERFC), p1);
      }
      function erfc(x) {
        if (x === 0) {
          return 1;
        }
        const z = Math.abs(x);
        const t = 1 / (1 + 0.5 * z);
        const ans = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
        if (x >= 0) {
          return ans;
        }
        return 2 - ans;
      }
      exports.erfc = erfc;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/erf.js
  var require_erf = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/erf.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_erf = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var erfc_1 = require_erfc();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function Eval_erf(p1) {
        const result = yerf(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_erf = Eval_erf;
      function yerf(p1) {
        if (defs_1.isdouble(p1)) {
          return bignum_1.double(1 - erfc_1.erfc(p1.d));
        }
        if (is_1.isZeroAtomOrTensor(p1)) {
          return defs_1.Constants.zero;
        }
        if (is_1.isnegativeterm(p1)) {
          return multiply_1.negate(list_1.makeList(defs_1.symbol(defs_1.ERF), multiply_1.negate(p1)));
        }
        return list_1.makeList(defs_1.symbol(defs_1.ERF), p1);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/factors.js
  var require_factors = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/factors.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.factors = void 0;
      var defs_1 = require_defs();
      function factors(p) {
        const result = [];
        if (defs_1.isadd(p)) {
          p.tail().forEach((el) => result.push(...term_factors(el)));
        } else {
          result.push(...term_factors(p));
        }
        return result;
      }
      exports.factors = factors;
      function term_factors(p) {
        if (defs_1.ismultiply(p)) {
          return p.tail();
        }
        return [p];
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/expand.js
  var require_expand = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/expand.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_expand = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var find_1 = require_find();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var degree_1 = require_degree();
      var denominator_1 = require_denominator();
      var eval_1 = require_eval();
      var factorpoly_1 = require_factorpoly();
      var factors_1 = require_factors();
      var filter_1 = require_filter();
      var guess_1 = require_guess();
      var inner_1 = require_inner();
      var inv_1 = require_inv();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var numerator_1 = require_numerator();
      var power_1 = require_power();
      var quotient_1 = require_quotient();
      var tensor_1 = require_tensor();
      function Eval_expand(p1) {
        const top = eval_1.Eval(defs_1.cadr(p1));
        const p2 = eval_1.Eval(defs_1.caddr(p1));
        const X = p2 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(top) : p2;
        const F = top;
        stack_1.push(expand(F, X));
      }
      exports.Eval_expand = Eval_expand;
      function expand(F, X) {
        if (defs_1.istensor(F)) {
          return expand_tensor(F, X);
        }
        if (defs_1.isadd(F)) {
          return F.tail().reduce((a, b) => add_1.add(a, expand(b, X)), defs_1.Constants.zero);
        }
        let B = numerator_1.numerator(F);
        let A = denominator_1.denominator(F);
        [A, B] = remove_negative_exponents(A, B, X);
        if (is_1.isone(B) || is_1.isone(A)) {
          if (!is_1.ispolyexpandedform(A, X) || is_1.isone(A)) {
            return F;
          }
        }
        const Q = quotient_1.divpoly(B, A, X);
        B = add_1.subtract(B, multiply_1.multiply(A, Q));
        if (is_1.isZeroAtomOrTensor(B)) {
          return Q;
        }
        A = factorpoly_1.factorpoly(A, X);
        let C = expand_get_C(A, X);
        B = expand_get_B(B, C, X);
        A = expand_get_A(A, C, X);
        let result;
        if (defs_1.istensor(C)) {
          const inverse = defs_1.doexpand(inv_1.inv, C);
          result = inner_1.inner(inner_1.inner(inverse, B), A);
        } else {
          const arg1 = defs_1.doexpand(multiply_1.divide, B, C);
          result = multiply_1.multiply(arg1, A);
        }
        return add_1.add(result, Q);
      }
      function expand_tensor(p5, p9) {
        p5 = tensor_1.copy_tensor(p5);
        p5.tensor.elem = p5.tensor.elem.map((el) => {
          return expand(el, p9);
        });
        return p5;
      }
      function remove_negative_exponents(p2, p3, p9) {
        const arr = [...factors_1.factors(p2), ...factors_1.factors(p3)];
        let j = 0;
        for (let i = 0; i < arr.length; i++) {
          const p1 = arr[i];
          if (!defs_1.ispower(p1)) {
            continue;
          }
          if (defs_1.cadr(p1) !== p9) {
            continue;
          }
          const k = bignum_1.nativeInt(defs_1.caddr(p1));
          if (isNaN(k)) {
            continue;
          }
          if (k < j) {
            j = k;
          }
        }
        if (j === 0) {
          return [p2, p3];
        }
        p2 = multiply_1.multiply(p2, power_1.power(p9, bignum_1.integer(-j)));
        p3 = multiply_1.multiply(p3, power_1.power(p9, bignum_1.integer(-j)));
        return [p2, p3];
      }
      function expand_get_C(p2, p9) {
        const stack = [];
        if (defs_1.ismultiply(p2)) {
          p2.tail().forEach((p5) => stack.push(...expand_get_CF(p2, p5, p9)));
        } else {
          stack.push(...expand_get_CF(p2, p2, p9));
        }
        const n = stack.length;
        if (n === 1) {
          return stack[0];
        }
        const p4 = alloc_1.alloc_tensor(n * n);
        p4.tensor.ndim = 2;
        p4.tensor.dim[0] = n;
        p4.tensor.dim[1] = n;
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            const arg2 = power_1.power(p9, bignum_1.integer(i));
            const divided = defs_1.doexpand(multiply_1.divide, stack[j], arg2);
            p4.tensor.elem[n * i + j] = filter_1.filter(divided, p9);
          }
        }
        return p4;
      }
      function expand_get_CF(p2, p5, p9) {
        let p6;
        let n = 0;
        if (!find_1.Find(p5, p9)) {
          return [];
        }
        const p8 = defs_1.doexpand(trivial_divide, p2, p5);
        if (defs_1.ispower(p5)) {
          n = bignum_1.nativeInt(defs_1.caddr(p5));
          p6 = defs_1.cadr(p5);
        } else {
          n = 1;
          p6 = p5;
        }
        const stack = [];
        const d = bignum_1.nativeInt(degree_1.degree(p6, p9));
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < d; j++) {
            let arg2 = power_1.power(p6, bignum_1.integer(i));
            let arg1 = defs_1.doexpand(multiply_1.multiply, p8, arg2);
            arg2 = power_1.power(p9, bignum_1.integer(j));
            const multiplied = defs_1.doexpand(multiply_1.multiply, arg1, arg2);
            stack.push(multiplied);
          }
        }
        return stack;
      }
      function trivial_divide(p2, p5) {
        let result = defs_1.Constants.one;
        if (defs_1.ismultiply(p2)) {
          const arr = [];
          p2.tail().forEach((p0) => {
            if (!misc_1.equal(p0, p5)) {
              arr.push(eval_1.Eval(p0));
            }
          });
          result = multiply_1.multiply_all(arr);
        }
        return result;
      }
      function expand_get_B(p3, p4, p9) {
        if (!defs_1.istensor(p4)) {
          return p3;
        }
        const n = p4.tensor.dim[0];
        const p8 = alloc_1.alloc_tensor(n);
        p8.tensor.ndim = 1;
        p8.tensor.dim[0] = n;
        for (let i = 0; i < n; i++) {
          const arg2 = power_1.power(p9, bignum_1.integer(i));
          const divided = defs_1.doexpand(multiply_1.divide, p3, arg2);
          p8.tensor.elem[i] = filter_1.filter(divided, p9);
        }
        return p8;
      }
      function expand_get_A(p2, p4, p9) {
        if (!defs_1.istensor(p4)) {
          return multiply_1.reciprocate(p2);
        }
        let elements = [];
        if (defs_1.ismultiply(p2)) {
          p2.tail().forEach((p5) => {
            elements.push(...expand_get_AF(p5, p9));
          });
        } else {
          elements = expand_get_AF(p2, p9);
        }
        const n = elements.length;
        const p8 = alloc_1.alloc_tensor(n);
        p8.tensor.ndim = 1;
        p8.tensor.dim[0] = n;
        p8.tensor.elem = elements;
        return p8;
      }
      function expand_get_AF(p5, p9) {
        let n = 1;
        if (!find_1.Find(p5, p9)) {
          return [];
        }
        if (defs_1.ispower(p5)) {
          n = bignum_1.nativeInt(defs_1.caddr(p5));
          p5 = defs_1.cadr(p5);
        }
        const results = [];
        const d = bignum_1.nativeInt(degree_1.degree(p5, p9));
        for (let i = n; i > 0; i--) {
          for (let j = 0; j < d; j++) {
            results.push(multiply_1.multiply(multiply_1.reciprocate(power_1.power(p5, bignum_1.integer(i))), power_1.power(p9, bignum_1.integer(j))));
          }
        }
        return results;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/floor.js
  var require_floor = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/floor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_floor = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var mmul_1 = require_mmul();
      function Eval_floor(p1) {
        const result = yfloor(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_floor = Eval_floor;
      function yfloor(p1) {
        return yyfloor(p1);
      }
      function yyfloor(p1) {
        if (!defs_1.isNumericAtom(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.FLOOR), p1);
        }
        if (defs_1.isdouble(p1)) {
          return bignum_1.double(Math.floor(p1.d));
        }
        if (is_1.isinteger(p1)) {
          return p1;
        }
        let p3 = new defs_1.Num(mmul_1.mdiv(p1.q.a, p1.q.b));
        if (is_1.isnegativenumber(p1)) {
          p3 = add_1.add(p3, defs_1.Constants.negOne);
        }
        return p3;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/for.js
  var require_for = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/for.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_for = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      function Eval_for(p1) {
        const loopingVariable = defs_1.caddr(p1);
        if (!defs_1.issymbol(loopingVariable)) {
          run_1.stop("for: 2nd arg should be the variable to loop over");
        }
        const j = eval_1.evaluate_integer(defs_1.cadddr(p1));
        if (isNaN(j)) {
          stack_1.push(p1);
          return;
        }
        const k = eval_1.evaluate_integer(defs_1.caddddr(p1));
        if (isNaN(k)) {
          stack_1.push(p1);
          return;
        }
        const p4 = symbol_1.get_binding(loopingVariable);
        for (let i = j; i <= k; i++) {
          symbol_1.set_binding(loopingVariable, bignum_1.integer(i));
          eval_1.Eval(defs_1.cadr(p1));
        }
        symbol_1.set_binding(loopingVariable, p4);
        symbol_1.push_symbol(defs_1.NIL);
      }
      exports.Eval_for = Eval_for;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/gamma.js
  var require_gamma = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/gamma.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_gamma = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var sin_1 = require_sin();
      function Eval_gamma(p1) {
        const result = gamma(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_gamma = Eval_gamma;
      function gamma(p1) {
        return gammaf(p1);
      }
      function gammaf(p1) {
        if (defs_1.isrational(p1) && defs_1.MEQUAL(p1.q.a, 1) && defs_1.MEQUAL(p1.q.b, 2)) {
          return power_1.power(defs_1.Constants.Pi(), bignum_1.rational(1, 2));
        }
        if (defs_1.isrational(p1) && defs_1.MEQUAL(p1.q.a, 3) && defs_1.MEQUAL(p1.q.b, 2)) {
          return multiply_1.multiply(power_1.power(defs_1.Constants.Pi(), bignum_1.rational(1, 2)), bignum_1.rational(1, 2));
        }
        if (is_1.isnegativeterm(p1)) {
          return multiply_1.divide(multiply_1.multiply(defs_1.Constants.Pi(), defs_1.Constants.negOne), multiply_1.multiply(multiply_1.multiply(sin_1.sine(multiply_1.multiply(defs_1.Constants.Pi(), p1)), p1), gamma(multiply_1.negate(p1))));
        }
        if (defs_1.isadd(p1)) {
          return gamma_of_sum(p1);
        }
        return list_1.makeList(defs_1.symbol(defs_1.GAMMA), p1);
      }
      function gamma_of_sum(p1) {
        const p3 = defs_1.cdr(p1);
        if (defs_1.isrational(defs_1.car(p3)) && defs_1.MEQUAL(defs_1.car(p3).q.a, 1) && defs_1.MEQUAL(defs_1.car(p3).q.b, 1)) {
          return multiply_1.multiply(defs_1.cadr(p3), gamma(defs_1.cadr(p3)));
        }
        if (defs_1.isrational(defs_1.car(p3)) && defs_1.MEQUAL(defs_1.car(p3).q.a, -1) && defs_1.MEQUAL(defs_1.car(p3).q.b, 1)) {
          return multiply_1.divide(gamma(defs_1.cadr(p3)), add_1.add(defs_1.cadr(p3), defs_1.Constants.negOne));
        }
        return list_1.makeList(defs_1.symbol(defs_1.GAMMA), p1);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/hilbert.js
  var require_hilbert = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/hilbert.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.hilbert = void 0;
      var defs_1 = require_defs();
      var misc_1 = require_misc();
      var bignum_1 = require_bignum();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function hilbert(N) {
        const n = bignum_1.nativeInt(N);
        if (n < 2) {
          return list_1.makeList(defs_1.symbol(defs_1.HILBERT), N);
        }
        const A = misc_1.zero_matrix(n, n);
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            A.tensor.elem[i * n + j] = multiply_1.inverse(bignum_1.integer(i + j + 1));
          }
        }
        return A;
      }
      exports.hilbert = hilbert;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/isprime.js
  var require_isprime = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/isprime.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_isprime = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var mprime_1 = require_mprime();
      function Eval_isprime(p1) {
        const result = isprime(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_isprime = Eval_isprime;
      function isprime(p1) {
        if (is_1.isnonnegativeinteger(p1) && mprime_1.mprime(p1.q.a)) {
          return defs_1.Constants.one;
        }
        return defs_1.Constants.zero;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/laguerre.js
  var require_laguerre = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/laguerre.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_laguerre = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var subst_1 = require_subst();
      function Eval_laguerre(p1) {
        const X = eval_1.Eval(defs_1.cadr(p1));
        const N = eval_1.Eval(defs_1.caddr(p1));
        const p2 = eval_1.Eval(defs_1.cadddr(p1));
        const K = p2 === defs_1.symbol(defs_1.NIL) ? defs_1.Constants.zero : p2;
        stack_1.push(laguerre(X, N, K));
      }
      exports.Eval_laguerre = Eval_laguerre;
      function laguerre(X, N, K) {
        let n = bignum_1.nativeInt(N);
        if (n < 0 || isNaN(n)) {
          return list_1.makeList(defs_1.symbol(defs_1.LAGUERRE), X, N, K);
        }
        if (defs_1.issymbol(X)) {
          return laguerre2(n, X, K);
        }
        return eval_1.Eval(subst_1.subst(laguerre2(n, defs_1.symbol(defs_1.SECRETX), K), defs_1.symbol(defs_1.SECRETX), X));
      }
      function laguerre2(n, p1, p3) {
        let Y0 = defs_1.Constants.zero;
        let Y1 = defs_1.Constants.one;
        for (let i = 0; i < n; i++) {
          const result = multiply_1.divide(add_1.subtract(multiply_1.multiply(add_1.add(add_1.subtract(bignum_1.integer(2 * i + 1), p1), p3), Y1), multiply_1.multiply(add_1.add(bignum_1.integer(i), p3), Y0)), bignum_1.integer(i + 1));
          Y0 = Y1;
          Y1 = result;
        }
        return Y1;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/leading.js
  var require_leading = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/leading.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_leading = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var degree_1 = require_degree();
      var eval_1 = require_eval();
      var filter_1 = require_filter();
      var guess_1 = require_guess();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      function Eval_leading(p1) {
        const P = eval_1.Eval(defs_1.cadr(p1));
        p1 = eval_1.Eval(defs_1.caddr(p1));
        const X = p1 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(P) : p1;
        stack_1.push(leading(P, X));
      }
      exports.Eval_leading = Eval_leading;
      function leading(P, X) {
        const N = degree_1.degree(P, X);
        return filter_1.filter(multiply_1.divide(P, power_1.power(X, N)), X);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/legendre.js
  var require_legendre = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/legendre.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_legendre = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var cos_1 = require_cos();
      var derivative_1 = require_derivative();
      var eval_1 = require_eval();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      var sin_1 = require_sin();
      var subst_1 = require_subst();
      function Eval_legendre(p1) {
        const X = eval_1.Eval(defs_1.cadr(p1));
        const N = eval_1.Eval(defs_1.caddr(p1));
        const p2 = eval_1.Eval(defs_1.cadddr(p1));
        const M = p2 === defs_1.symbol(defs_1.NIL) ? defs_1.Constants.zero : p2;
        stack_1.push(legendre(X, N, M));
      }
      exports.Eval_legendre = Eval_legendre;
      function legendre(X, N, M) {
        return __legendre(X, N, M);
      }
      function __legendre(X, N, M) {
        let n = bignum_1.nativeInt(N);
        let m = bignum_1.nativeInt(M);
        if (n < 0 || isNaN(n) || m < 0 || isNaN(m)) {
          return list_1.makeList(defs_1.symbol(defs_1.LEGENDRE), X, N, M);
        }
        let result;
        if (defs_1.issymbol(X)) {
          result = __legendre2(n, m, X);
        } else {
          const expr = __legendre2(n, m, defs_1.symbol(defs_1.SECRETX));
          result = eval_1.Eval(subst_1.subst(expr, defs_1.symbol(defs_1.SECRETX), X));
        }
        result = __legendre3(result, m, X) || result;
        return result;
      }
      function __legendre2(n, m, X) {
        let Y0 = defs_1.Constants.zero;
        let Y1 = defs_1.Constants.one;
        for (let i = 0; i < n; i++) {
          const divided = multiply_1.divide(add_1.subtract(multiply_1.multiply(multiply_1.multiply(bignum_1.integer(2 * i + 1), X), Y1), multiply_1.multiply(bignum_1.integer(i), Y0)), bignum_1.integer(i + 1));
          Y0 = Y1;
          Y1 = divided;
        }
        for (let i = 0; i < m; i++) {
          Y1 = derivative_1.derivative(Y1, X);
        }
        return Y1;
      }
      function __legendre3(p1, m, X) {
        if (m === 0) {
          return;
        }
        let base = add_1.subtract(defs_1.Constants.one, misc_1.square(X));
        if (defs_1.car(X) === defs_1.symbol(defs_1.COS)) {
          base = misc_1.square(sin_1.sine(defs_1.cadr(X)));
        } else if (defs_1.car(X) === defs_1.symbol(defs_1.SIN)) {
          base = misc_1.square(cos_1.cosine(defs_1.cadr(X)));
        }
        let result = multiply_1.multiply(p1, power_1.power(base, multiply_1.multiply(bignum_1.integer(m), bignum_1.rational(1, 2))));
        if (m % 2) {
          result = multiply_1.negate(result);
        }
        return result;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/lookup.js
  var require_lookup = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/lookup.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_lookup = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      function Eval_lookup(p1) {
        p1 = defs_1.cadr(p1);
        if (!defs_1.iscons(p1) && defs_1.cadr(p1).k === defs_1.SYM) {
          p1 = symbol_1.get_binding(p1);
        }
        stack_1.push(p1);
      }
      exports.Eval_lookup = Eval_lookup;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/mod.js
  var require_mod = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/mod.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_mod = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var mmul_1 = require_mmul();
      function Eval_mod(p1) {
        const arg2 = eval_1.Eval(defs_1.caddr(p1));
        const arg1 = eval_1.Eval(defs_1.cadr(p1));
        stack_1.push(mod(arg1, arg2));
      }
      exports.Eval_mod = Eval_mod;
      function mod(p1, p2) {
        if (is_1.isZeroAtomOrTensor(p2)) {
          run_1.stop("mod function: divide by zero");
        }
        if (!defs_1.isNumericAtom(p1) || !defs_1.isNumericAtom(p2)) {
          return list_1.makeList(defs_1.symbol(defs_1.MOD), p1, p2);
        }
        if (defs_1.isdouble(p1)) {
          const n = bignum_1.nativeInt(p1);
          if (isNaN(n)) {
            run_1.stop("mod function: cannot convert float value to integer");
          }
          p1 = bignum_1.integer(n);
        }
        if (defs_1.isdouble(p2)) {
          const n = bignum_1.nativeInt(p2);
          if (isNaN(n)) {
            run_1.stop("mod function: cannot convert float value to integer");
          }
          p2 = bignum_1.integer(n);
        }
        if (!is_1.isinteger(p1) || !is_1.isinteger(p2)) {
          run_1.stop("mod function: integer arguments expected");
        }
        return new defs_1.Num(mmul_1.mmod(p1.q.a, p2.q.a));
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/nroots.js
  var require_nroots = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/nroots.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_nroots = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var coeff_1 = require_coeff();
      var eval_1 = require_eval();
      var float_1 = require_float();
      var guess_1 = require_guess();
      var imag_1 = require_imag();
      var is_1 = require_is();
      var multiply_1 = require_multiply();
      var real_1 = require_real();
      var NROOTS_YMAX = 101;
      var NROOTS_DELTA = 1e-6;
      var NROOTS_EPSILON = 1e-9;
      function NROOTS_ABS(z) {
        return Math.sqrt(z.r * z.r + z.i * z.i);
      }
      function NROOTS_RANDOM() {
        return 4 * Math.random() - 2;
      }
      var numericRootOfPolynomial = class {
        constructor() {
          this.r = 0;
          this.i = 0;
        }
      };
      var nroots_a = new numericRootOfPolynomial();
      var nroots_b = new numericRootOfPolynomial();
      var nroots_x = new numericRootOfPolynomial();
      var nroots_y = new numericRootOfPolynomial();
      var nroots_fa = new numericRootOfPolynomial();
      var nroots_fb = new numericRootOfPolynomial();
      var nroots_dx = new numericRootOfPolynomial();
      var nroots_df = new numericRootOfPolynomial();
      var nroots_c = [];
      for (let initNRoots = 0; initNRoots < NROOTS_YMAX; initNRoots++) {
        nroots_c[initNRoots] = new numericRootOfPolynomial();
      }
      function Eval_nroots(p1) {
        let p2 = eval_1.Eval(defs_1.caddr(p1));
        p1 = eval_1.Eval(defs_1.cadr(p1));
        p2 = p2 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(p1) : p2;
        if (!is_1.ispolyexpandedform(p1, p2)) {
          run_1.stop("nroots: polynomial?");
        }
        const h = defs_1.defs.tos;
        const cs = coeff_1.coeff(p1, p2);
        let n = cs.length;
        if (n > NROOTS_YMAX) {
          run_1.stop("nroots: degree?");
        }
        for (let i = 0; i < n; i++) {
          p1 = eval_1.Eval(float_1.yyfloat(real_1.real(cs[i])));
          p2 = eval_1.Eval(float_1.yyfloat(imag_1.imag(cs[i])));
          if (!defs_1.isdouble(p1) || !defs_1.isdouble(p2)) {
            run_1.stop("nroots: coefficients?");
          }
          nroots_c[i].r = p1.d;
          nroots_c[i].i = p2.d;
        }
        monic(n);
        for (let k = n; k > 1; k--) {
          findroot(k);
          if (Math.abs(nroots_a.r) < NROOTS_DELTA) {
            nroots_a.r = 0;
          }
          if (Math.abs(nroots_a.i) < NROOTS_DELTA) {
            nroots_a.i = 0;
          }
          stack_1.push(add_1.add(bignum_1.double(nroots_a.r), multiply_1.multiply(bignum_1.double(nroots_a.i), defs_1.Constants.imaginaryunit)));
          NROOTS_divpoly(k);
        }
        n = defs_1.defs.tos - h;
        if (n > 1) {
          misc_1.sort_stack(n);
          p1 = alloc_1.alloc_tensor(n);
          p1.tensor.ndim = 1;
          p1.tensor.dim[0] = n;
          p1.tensor.elem = defs_1.defs.stack.slice(h, h + n);
          stack_1.moveTos(h);
          stack_1.push(p1);
        }
      }
      exports.Eval_nroots = Eval_nroots;
      function monic(n) {
        nroots_y.r = nroots_c[n - 1].r;
        nroots_y.i = nroots_c[n - 1].i;
        const t = nroots_y.r * nroots_y.r + nroots_y.i * nroots_y.i;
        for (let k = 0; k < n - 1; k++) {
          nroots_c[k].r = (nroots_c[k].r * nroots_y.r + nroots_c[k].i * nroots_y.i) / t;
          nroots_c[k].i = (nroots_c[k].i * nroots_y.r - nroots_c[k].r * nroots_y.i) / t;
        }
        nroots_c[n - 1].r = 1;
        nroots_c[n - 1].i = 0;
      }
      function findroot(n) {
        if (NROOTS_ABS(nroots_c[0]) < NROOTS_DELTA) {
          nroots_a.r = 0;
          nroots_a.i = 0;
          return;
        }
        for (let j = 0; j < 100; j++) {
          nroots_a.r = NROOTS_RANDOM();
          nroots_a.i = NROOTS_RANDOM();
          compute_fa(n);
          nroots_b.r = nroots_a.r;
          nroots_b.i = nroots_a.i;
          nroots_fb.r = nroots_fa.r;
          nroots_fb.i = nroots_fa.i;
          nroots_a.r = NROOTS_RANDOM();
          nroots_a.i = NROOTS_RANDOM();
          for (let k = 0; k < 1e3; k++) {
            compute_fa(n);
            const nrabs = NROOTS_ABS(nroots_fa);
            if (defs_1.DEBUG) {
              console.log(`nrabs: ${nrabs}`);
            }
            if (nrabs < NROOTS_EPSILON) {
              return;
            }
            if (NROOTS_ABS(nroots_fa) < NROOTS_ABS(nroots_fb)) {
              nroots_x.r = nroots_a.r;
              nroots_x.i = nroots_a.i;
              nroots_a.r = nroots_b.r;
              nroots_a.i = nroots_b.i;
              nroots_b.r = nroots_x.r;
              nroots_b.i = nroots_x.i;
              nroots_x.r = nroots_fa.r;
              nroots_x.i = nroots_fa.i;
              nroots_fa.r = nroots_fb.r;
              nroots_fa.i = nroots_fb.i;
              nroots_fb.r = nroots_x.r;
              nroots_fb.i = nroots_x.i;
            }
            nroots_dx.r = nroots_b.r - nroots_a.r;
            nroots_dx.i = nroots_b.i - nroots_a.i;
            nroots_df.r = nroots_fb.r - nroots_fa.r;
            nroots_df.i = nroots_fb.i - nroots_fa.i;
            const t = nroots_df.r * nroots_df.r + nroots_df.i * nroots_df.i;
            if (t === 0) {
              break;
            }
            nroots_y.r = (nroots_dx.r * nroots_df.r + nroots_dx.i * nroots_df.i) / t;
            nroots_y.i = (nroots_dx.i * nroots_df.r - nroots_dx.r * nroots_df.i) / t;
            nroots_a.r = nroots_b.r - (nroots_y.r * nroots_fb.r - nroots_y.i * nroots_fb.i);
            nroots_a.i = nroots_b.i - (nroots_y.r * nroots_fb.i + nroots_y.i * nroots_fb.r);
          }
        }
        run_1.stop("nroots: convergence error");
      }
      function compute_fa(n) {
        nroots_x.r = nroots_a.r;
        nroots_x.i = nroots_a.i;
        nroots_fa.r = nroots_c[0].r + nroots_c[1].r * nroots_x.r - nroots_c[1].i * nroots_x.i;
        nroots_fa.i = nroots_c[0].i + nroots_c[1].r * nroots_x.i + nroots_c[1].i * nroots_x.r;
        for (let k = 2; k < n; k++) {
          const t = nroots_a.r * nroots_x.r - nroots_a.i * nroots_x.i;
          nroots_x.i = nroots_a.r * nroots_x.i + nroots_a.i * nroots_x.r;
          nroots_x.r = t;
          nroots_fa.r += nroots_c[k].r * nroots_x.r - nroots_c[k].i * nroots_x.i;
          nroots_fa.i += nroots_c[k].r * nroots_x.i + nroots_c[k].i * nroots_x.r;
        }
      }
      function NROOTS_divpoly(n) {
        for (let k = n - 1; k > 0; k--) {
          nroots_c[k - 1].r += nroots_c[k].r * nroots_a.r - nroots_c[k].i * nroots_a.i;
          nroots_c[k - 1].i += nroots_c[k].i * nroots_a.r + nroots_c[k].r * nroots_a.i;
        }
        if (NROOTS_ABS(nroots_c[0]) > NROOTS_DELTA) {
          run_1.stop("nroots: residual error");
        }
        for (let k = 0; k < n - 1; k++) {
          nroots_c[k].r = nroots_c[k + 1].r;
          nroots_c[k].i = nroots_c[k + 1].i;
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/outer.js
  var require_outer = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/outer.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_outer = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      var tensor_1 = require_tensor();
      function Eval_outer(p1) {
        p1 = defs_1.cdr(p1);
        let temp = eval_1.Eval(defs_1.car(p1));
        const result = defs_1.iscons(p1) ? p1.tail().reduce((acc, p) => outer(acc, eval_1.Eval(p)), temp) : temp;
        stack_1.push(result);
      }
      exports.Eval_outer = Eval_outer;
      function outer(p1, p2) {
        if (defs_1.istensor(p1) && defs_1.istensor(p2)) {
          return yyouter(p1, p2);
        }
        if (defs_1.istensor(p1)) {
          return tensor_1.tensor_times_scalar(p1, p2);
        }
        if (defs_1.istensor(p2)) {
          return tensor_1.scalar_times_tensor(p1, p2);
        }
        return multiply_1.multiply(p1, p2);
      }
      function yyouter(p1, p2) {
        const ndim = p1.tensor.ndim + p2.tensor.ndim;
        if (ndim > defs_1.MAXDIM) {
          run_1.stop("outer: rank of result exceeds maximum");
        }
        const nelem = p1.tensor.nelem * p2.tensor.nelem;
        const p3 = alloc_1.alloc_tensor(nelem);
        p3.tensor.ndim = ndim;
        p3.tensor.dim = [...p1.tensor.dim, ...p2.tensor.dim];
        let k = 0;
        for (let i = 0; i < p1.tensor.nelem; i++) {
          for (let j = 0; j < p2.tensor.nelem; j++) {
            p3.tensor.elem[k++] = multiply_1.multiply(p1.tensor.elem[i], p2.tensor.elem[j]);
          }
        }
        return p3;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/prime.js
  var require_prime = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/prime.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_prime = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      function Eval_prime(p1) {
        const result = prime(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_prime = Eval_prime;
      function prime(p1) {
        let n = bignum_1.nativeInt(p1);
        if (n < 1 || n > defs_1.MAXPRIMETAB) {
          run_1.stop("prime: Argument out of range.");
        }
        n = defs_1.primetab[n - 1];
        return bignum_1.integer(n);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/product.js
  var require_product = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/product.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_product = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var multiply_1 = require_multiply();
      function Eval_product(p1) {
        const body = defs_1.cadr(p1);
        const indexVariable = defs_1.caddr(p1);
        if (!defs_1.issymbol(indexVariable)) {
          run_1.stop("sum: 2nd arg?");
        }
        const j = eval_1.evaluate_integer(defs_1.cadddr(p1));
        if (isNaN(j)) {
          stack_1.push(p1);
          return;
        }
        const k = eval_1.evaluate_integer(defs_1.caddddr(p1));
        if (isNaN(k)) {
          stack_1.push(p1);
          return;
        }
        const oldIndexVariableValue = symbol_1.get_binding(indexVariable);
        let temp = defs_1.Constants.one;
        for (let i = j; i <= k; i++) {
          symbol_1.set_binding(indexVariable, bignum_1.integer(i));
          const arg2 = eval_1.Eval(body);
          temp = multiply_1.multiply(temp, arg2);
          if (defs_1.DEBUG) {
            console.log(`product - factor 1: ${arg2}`);
            console.log(`product - factor 2: ${temp}`);
            console.log(`product - result: ${stack_1.top()}`);
          }
        }
        stack_1.push(temp);
        symbol_1.set_binding(indexVariable, oldIndexVariableValue);
      }
      exports.Eval_product = Eval_product;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/round.js
  var require_round = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/round.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_round = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var float_1 = require_float();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_round(p1) {
        const result = yround(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_round = Eval_round;
      function yround(p1) {
        if (!defs_1.isNumericAtom(p1)) {
          return list_1.makeList(defs_1.symbol(defs_1.ROUND), p1);
        }
        if (defs_1.isdouble(p1)) {
          return bignum_1.double(Math.round(p1.d));
        }
        if (is_1.isinteger(p1)) {
          return p1;
        }
        p1 = float_1.yyfloat(p1);
        return bignum_1.integer(Math.round(p1.d));
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/shape.js
  var require_shape = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/shape.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_shape = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      function Eval_shape(p1) {
        const result = shape(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_shape = Eval_shape;
      function shape(p1) {
        if (!defs_1.istensor(p1)) {
          if (!is_1.isZeroAtomOrTensor(p1)) {
            run_1.stop("transpose: tensor expected, 1st arg is not a tensor");
          }
          return defs_1.Constants.zero;
        }
        let { ndim } = p1.tensor;
        const p2 = alloc_1.alloc_tensor(ndim);
        p2.tensor.ndim = 1;
        p2.tensor.dim[0] = ndim;
        for (let i = 0; i < ndim; i++) {
          p2.tensor.elem[i] = bignum_1.integer(p1.tensor.dim[i]);
        }
        return p2;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/sum.js
  var require_sum = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/sum.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_sum = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      function Eval_sum(p1) {
        const result = _sum(p1);
        stack_1.push(result);
      }
      exports.Eval_sum = Eval_sum;
      function _sum(p1) {
        const body = defs_1.cadr(p1);
        const indexVariable = defs_1.caddr(p1);
        if (!defs_1.issymbol(indexVariable)) {
          run_1.stop("sum: 2nd arg?");
        }
        const j = eval_1.evaluate_integer(defs_1.cadddr(p1));
        if (isNaN(j)) {
          return p1;
        }
        const k = eval_1.evaluate_integer(defs_1.caddddr(p1));
        if (isNaN(k)) {
          return p1;
        }
        const p4 = symbol_1.get_binding(indexVariable);
        let temp = defs_1.Constants.zero;
        for (let i = j; i <= k; i++) {
          symbol_1.set_binding(indexVariable, bignum_1.integer(i));
          temp = add_1.add(temp, eval_1.Eval(body));
        }
        symbol_1.set_binding(indexVariable, p4);
        return temp;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/tan.js
  var require_tan = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/tan.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_tan = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var power_1 = require_power();
      function Eval_tan(p1) {
        const result = tangent(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_tan = Eval_tan;
      function tangent(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCTAN)) {
          return defs_1.cadr(p1);
        }
        if (defs_1.isdouble(p1)) {
          let d = Math.tan(p1.d);
          if (Math.abs(d) < 1e-10) {
            d = 0;
          }
          return bignum_1.double(d);
        }
        if (is_1.isnegative(p1)) {
          return multiply_1.negate(tangent(multiply_1.negate(p1)));
        }
        const n = bignum_1.nativeInt(multiply_1.divide(multiply_1.multiply(p1, bignum_1.integer(180)), defs_1.Constants.Pi()));
        if (n < 0 || isNaN(n)) {
          return list_1.makeList(defs_1.symbol(defs_1.TAN), p1);
        }
        switch (n % 360) {
          case 0:
          case 180:
            return defs_1.Constants.zero;
          case 30:
          case 210:
            return multiply_1.multiply(bignum_1.rational(1, 3), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
          case 150:
          case 330:
            return multiply_1.multiply(bignum_1.rational(-1, 3), power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
          case 45:
          case 225:
            return defs_1.Constants.one;
          case 135:
          case 315:
            return defs_1.Constants.negOne;
          case 60:
          case 240:
            return power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2));
          case 120:
          case 300:
            return multiply_1.negate(power_1.power(bignum_1.integer(3), bignum_1.rational(1, 2)));
          default:
            return list_1.makeList(defs_1.symbol(defs_1.TAN), p1);
        }
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/tanh.js
  var require_tanh = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/tanh.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_tanh = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      function Eval_tanh(p1) {
        const result = tanh(eval_1.Eval(defs_1.cadr(p1)));
        stack_1.push(result);
      }
      exports.Eval_tanh = Eval_tanh;
      function tanh(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.ARCTANH)) {
          return defs_1.cadr(p1);
        }
        if (defs_1.isdouble(p1)) {
          let d = Math.tanh(p1.d);
          if (Math.abs(d) < 1e-10) {
            d = 0;
          }
          return bignum_1.double(d);
        }
        if (is_1.isZeroAtomOrTensor(p1)) {
          return defs_1.Constants.zero;
        }
        return list_1.makeList(defs_1.symbol(defs_1.TANH), p1);
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/taylor.js
  var require_taylor = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/taylor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_taylor = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var derivative_1 = require_derivative();
      var eval_1 = require_eval();
      var factorial_1 = require_factorial();
      var guess_1 = require_guess();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var subst_1 = require_subst();
      function Eval_taylor(p1) {
        p1 = defs_1.cdr(p1);
        const F = eval_1.Eval(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        let p2 = eval_1.Eval(defs_1.car(p1));
        const X = p2 === defs_1.symbol(defs_1.NIL) ? guess_1.guess(stack_1.top()) : p2;
        p1 = defs_1.cdr(p1);
        p2 = eval_1.Eval(defs_1.car(p1));
        const N = p2 === defs_1.symbol(defs_1.NIL) ? bignum_1.integer(24) : p2;
        p1 = defs_1.cdr(p1);
        p2 = eval_1.Eval(defs_1.car(p1));
        const A = p2 === defs_1.symbol(defs_1.NIL) ? defs_1.Constants.zero : p2;
        stack_1.push(taylor(F, X, N, A));
      }
      exports.Eval_taylor = Eval_taylor;
      function taylor(F, X, N, A) {
        const k = bignum_1.nativeInt(N);
        if (isNaN(k)) {
          return list_1.makeList(defs_1.symbol(defs_1.TAYLOR), F, X, N, A);
        }
        let p5 = defs_1.Constants.one;
        let temp = eval_1.Eval(subst_1.subst(F, X, A));
        for (let i = 1; i <= k; i++) {
          F = derivative_1.derivative(F, X);
          if (is_1.isZeroAtomOrTensor(F)) {
            break;
          }
          p5 = multiply_1.multiply(p5, add_1.subtract(X, A));
          const arg1a = eval_1.Eval(subst_1.subst(F, X, A));
          temp = add_1.add(temp, multiply_1.divide(multiply_1.multiply(arg1a, p5), factorial_1.factorial(bignum_1.integer(i))));
        }
        return temp;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/test.js
  var require_test = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/test.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_or = exports.Eval_and = exports.Eval_not = exports.Eval_testlt = exports.Eval_testle = exports.Eval_testgt = exports.Eval_testge = exports.Eval_testeq = exports.Eval_test = void 0;
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var add_1 = require_add();
      var eval_1 = require_eval();
      var float_1 = require_float();
      var is_1 = require_is();
      var simplify_1 = require_simplify();
      function Eval_test(p1) {
        stack_1.push(_test(p1));
      }
      exports.Eval_test = Eval_test;
      function _test(p1) {
        const orig = p1;
        p1 = defs_1.cdr(p1);
        while (defs_1.iscons(p1)) {
          if (defs_1.cdr(p1) === defs_1.symbol(defs_1.NIL)) {
            return eval_1.Eval(defs_1.car(p1));
          }
          const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.car(p1));
          if (checkResult == null) {
            return orig;
          } else if (checkResult) {
            return eval_1.Eval(defs_1.cadr(p1));
          } else {
            p1 = defs_1.cddr(p1);
          }
        }
        return defs_1.Constants.zero;
      }
      function Eval_testeq(p1) {
        const orig = p1;
        let subtractionResult = add_1.subtract(eval_1.Eval(defs_1.cadr(p1)), eval_1.Eval(defs_1.caddr(p1)));
        let checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(subtractionResult);
        if (checkResult) {
          stack_1.push(defs_1.Constants.zero);
          return;
        } else if (checkResult != null && !checkResult) {
          stack_1.push(defs_1.Constants.one);
          return;
        }
        const arg1 = simplify_1.simplify(eval_1.Eval(defs_1.cadr(p1)));
        const arg2 = simplify_1.simplify(eval_1.Eval(defs_1.caddr(p1)));
        subtractionResult = add_1.subtract(arg1, arg2);
        checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(subtractionResult);
        if (checkResult) {
          stack_1.push(defs_1.Constants.zero);
          return;
        } else if (checkResult != null && !checkResult) {
          stack_1.push(defs_1.Constants.one);
          return;
        }
        stack_1.push(orig);
      }
      exports.Eval_testeq = Eval_testeq;
      function Eval_testge(p1) {
        const orig = p1;
        const comparison = cmp_args(p1);
        if (comparison == null) {
          stack_1.push(orig);
          return;
        }
        if (comparison >= 0) {
          stack_1.push(defs_1.Constants.one);
        } else {
          stack_1.push(defs_1.Constants.zero);
        }
      }
      exports.Eval_testge = Eval_testge;
      function Eval_testgt(p1) {
        const orig = p1;
        const comparison = cmp_args(p1);
        if (comparison == null) {
          stack_1.push(orig);
          return;
        }
        if (comparison > 0) {
          stack_1.push(defs_1.Constants.one);
        } else {
          stack_1.push(defs_1.Constants.zero);
        }
      }
      exports.Eval_testgt = Eval_testgt;
      function Eval_testle(p1) {
        const orig = p1;
        const comparison = cmp_args(p1);
        if (comparison == null) {
          stack_1.push(orig);
          return;
        }
        if (comparison <= 0) {
          stack_1.push(defs_1.Constants.one);
        } else {
          stack_1.push(defs_1.Constants.zero);
        }
      }
      exports.Eval_testle = Eval_testle;
      function Eval_testlt(p1) {
        const orig = p1;
        const comparison = cmp_args(p1);
        if (comparison == null) {
          stack_1.push(orig);
          return;
        }
        if (comparison < 0) {
          stack_1.push(defs_1.Constants.one);
        } else {
          stack_1.push(defs_1.Constants.zero);
        }
      }
      exports.Eval_testlt = Eval_testlt;
      function Eval_not(p1) {
        const wholeAndExpression = p1;
        const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.cadr(p1));
        if (checkResult == null) {
          stack_1.push(wholeAndExpression);
        } else if (checkResult) {
          stack_1.push(defs_1.Constants.zero);
        } else {
          stack_1.push(defs_1.Constants.one);
        }
      }
      exports.Eval_not = Eval_not;
      function Eval_and(p1) {
        const wholeAndExpression = p1;
        let andPredicates = defs_1.cdr(wholeAndExpression);
        let somePredicateUnknown = false;
        while (defs_1.iscons(andPredicates)) {
          const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.car(andPredicates));
          if (checkResult == null) {
            somePredicateUnknown = true;
            andPredicates = defs_1.cdr(andPredicates);
          } else if (checkResult) {
            andPredicates = defs_1.cdr(andPredicates);
          } else if (!checkResult) {
            stack_1.push(defs_1.Constants.zero);
            return;
          }
        }
        if (somePredicateUnknown) {
          stack_1.push(wholeAndExpression);
        } else {
          stack_1.push(defs_1.Constants.one);
        }
      }
      exports.Eval_and = Eval_and;
      function Eval_or(p1) {
        const wholeOrExpression = p1;
        let orPredicates = defs_1.cdr(wholeOrExpression);
        let somePredicateUnknown = false;
        while (defs_1.iscons(orPredicates)) {
          const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.car(orPredicates));
          if (checkResult == null) {
            somePredicateUnknown = true;
            orPredicates = defs_1.cdr(orPredicates);
          } else if (checkResult) {
            stack_1.push(defs_1.Constants.one);
            return;
          } else if (!checkResult) {
            orPredicates = defs_1.cdr(orPredicates);
          }
        }
        if (somePredicateUnknown) {
          stack_1.push(wholeOrExpression);
        } else {
          stack_1.push(defs_1.Constants.zero);
        }
      }
      exports.Eval_or = Eval_or;
      function cmp_args(p1) {
        let t = 0;
        const arg1 = simplify_1.simplify(eval_1.Eval(defs_1.cadr(p1)));
        const arg2 = simplify_1.simplify(eval_1.Eval(defs_1.caddr(p1)));
        p1 = add_1.subtract(arg1, arg2);
        if (p1.k !== defs_1.NUM && p1.k !== defs_1.DOUBLE) {
          p1 = eval_1.Eval(float_1.yyfloat(p1));
        }
        if (is_1.isZeroAtomOrTensor(p1)) {
          return 0;
        }
        switch (p1.k) {
          case defs_1.NUM:
            if (defs_1.MSIGN(p1.q.a) === -1) {
              t = -1;
            } else {
              t = 1;
            }
            break;
          case defs_1.DOUBLE:
            if (p1.d < 0) {
              t = -1;
            } else {
              t = 1;
            }
            break;
          default:
            t = null;
        }
        return t;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/userfunc.js
  var require_userfunc = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/userfunc.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_user_function = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var derivative_1 = require_derivative();
      var eval_1 = require_eval();
      var list_1 = require_list();
      var tensor_1 = require_tensor();
      function Eval_user_function(p1) {
        if (defs_1.DEBUG) {
          console.log(`Eval_user_function evaluating: ${defs_1.car(p1)}`);
        }
        if (defs_1.car(p1) === defs_1.symbol(defs_1.SYMBOL_D) && symbol_1.get_binding(defs_1.symbol(defs_1.SYMBOL_D)) === defs_1.symbol(defs_1.SYMBOL_D)) {
          derivative_1.Eval_derivative(p1);
          return;
        }
        const bodyAndFormalArguments = eval_1.Eval(defs_1.car(p1));
        if (defs_1.isNumericAtom(bodyAndFormalArguments)) {
          run_1.stop("expected function invocation, found multiplication instead. Use '*' symbol explicitly for multiplication.");
        } else if (defs_1.istensor(bodyAndFormalArguments)) {
          run_1.stop("expected function invocation, found tensor product instead. Use 'dot/inner' explicitly.");
        } else if (defs_1.isstr(bodyAndFormalArguments)) {
          run_1.stop("expected function, found string instead.");
        }
        let F = defs_1.car(defs_1.cdr(bodyAndFormalArguments));
        let A = defs_1.car(defs_1.cdr(defs_1.cdr(bodyAndFormalArguments)));
        let B = defs_1.cdr(p1);
        if (defs_1.car(bodyAndFormalArguments) !== defs_1.symbol(defs_1.FUNCTION) || bodyAndFormalArguments === defs_1.car(p1)) {
          const h2 = defs_1.defs.tos;
          stack_1.push(bodyAndFormalArguments);
          p1 = B;
          while (defs_1.iscons(p1)) {
            stack_1.push(eval_1.Eval(defs_1.car(p1)));
            p1 = defs_1.cdr(p1);
          }
          list_1.list(defs_1.defs.tos - h2);
          return;
        }
        p1 = A;
        let p2 = B;
        const h = defs_1.defs.tos;
        while (defs_1.iscons(p1) && defs_1.iscons(p2)) {
          stack_1.push(defs_1.car(p1));
          stack_1.push(defs_1.car(p2));
          p1 = defs_1.cdr(p1);
          p2 = defs_1.cdr(p2);
        }
        list_1.list(defs_1.defs.tos - h);
        const S = stack_1.pop();
        stack_1.push(F);
        if (defs_1.iscons(S)) {
          stack_1.push(S);
          rewrite_args();
        }
        stack_1.push(eval_1.Eval(stack_1.pop()));
      }
      exports.Eval_user_function = Eval_user_function;
      function rewrite_args() {
        let n = 0;
        const p2 = stack_1.pop();
        let p1 = stack_1.pop();
        if (defs_1.istensor(p1)) {
          n = rewrite_args_tensor(p1, p2);
          return n;
        }
        if (defs_1.iscons(p1)) {
          const h = defs_1.defs.tos;
          if (defs_1.car(p1) === defs_1.car(p2)) {
            stack_1.push(list_1.makeList(defs_1.symbol(defs_1.EVAL), defs_1.car(defs_1.cdr(p2))));
          } else {
            stack_1.push(defs_1.car(p1));
          }
          p1 = defs_1.cdr(p1);
          while (defs_1.iscons(p1)) {
            stack_1.push(defs_1.car(p1));
            stack_1.push(p2);
            n += rewrite_args();
            p1 = defs_1.cdr(p1);
          }
          list_1.list(defs_1.defs.tos - h);
          return n;
        }
        if (!defs_1.issymbol(p1)) {
          stack_1.push(p1);
          return 0;
        }
        let p3 = p2;
        while (defs_1.iscons(p3)) {
          if (p1 === defs_1.car(p3)) {
            stack_1.push(defs_1.cadr(p3));
            return 1;
          }
          p3 = defs_1.cddr(p3);
        }
        p3 = symbol_1.get_binding(p1);
        stack_1.push(p3);
        if (p1 !== p3) {
          stack_1.push(p2);
          n = rewrite_args();
          if (n === 0) {
            stack_1.pop();
            stack_1.push(p1);
          }
        }
        return n;
      }
      function rewrite_args_tensor(p1, p2) {
        let n = 0;
        p1 = tensor_1.copy_tensor(p1);
        p1.tensor.elem = p1.tensor.elem.map((el) => {
          stack_1.push(el);
          stack_1.push(p2);
          n += rewrite_args();
          return stack_1.pop();
        });
        tensor_1.check_tensor_dimensions(p1);
        stack_1.push(p1);
        return n;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/zero.js
  var require_zero = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/zero.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_zero = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var stack_1 = require_stack();
      var eval_1 = require_eval();
      function Eval_zero(p1) {
        stack_1.push(_zero(p1));
      }
      exports.Eval_zero = Eval_zero;
      function _zero(p1) {
        const k = Array(defs_1.MAXDIM).fill(0);
        let m = 1;
        let n = 0;
        if (defs_1.iscons(p1)) {
          for (const el of p1.tail()) {
            const i = eval_1.evaluate_integer(el);
            if (i < 1 || isNaN(i)) {
              return defs_1.Constants.zero;
            }
            m *= i;
            k[n++] = i;
          }
        }
        if (n === 0) {
          return defs_1.Constants.zero;
        }
        p1 = alloc_1.alloc_tensor(m);
        p1.tensor.ndim = n;
        for (let i = 0; i < n; i++) {
          p1.tensor.dim[i] = k[i];
        }
        return p1;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/eval.js
  var require_eval = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/eval.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Eval_predicate = exports.Eval = exports.evaluate_integer = void 0;
      var _1 = require_sources();
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var misc_1 = require_misc();
      var abs_1 = require_abs();
      var add_1 = require_add();
      var adj_1 = require_adj();
      var approxratio_1 = require_approxratio();
      var arccos_1 = require_arccos();
      var arccosh_1 = require_arccosh();
      var arcsin_1 = require_arcsin();
      var arcsinh_1 = require_arcsinh();
      var arctan_1 = require_arctan();
      var arctanh_1 = require_arctanh();
      var arg_1 = require_arg();
      var besselj_1 = require_besselj();
      var bessely_1 = require_bessely();
      var bignum_1 = require_bignum();
      var binomial_1 = require_binomial();
      var ceiling_1 = require_ceiling();
      var choose_1 = require_choose();
      var circexp_1 = require_circexp();
      var clear_1 = require_clear();
      var clock_1 = require_clock();
      var coeff_1 = require_coeff();
      var cofactor_1 = require_cofactor();
      var condense_1 = require_condense();
      var conj_1 = require_conj();
      var contract_1 = require_contract();
      var cos_1 = require_cos();
      var cosh_1 = require_cosh();
      var decomp_1 = require_decomp();
      var define_1 = require_define();
      var defint_1 = require_defint();
      var degree_1 = require_degree();
      var denominator_1 = require_denominator();
      var derivative_1 = require_derivative();
      var det_1 = require_det();
      var dirac_1 = require_dirac();
      var divisors_1 = require_divisors();
      var eigen_1 = require_eigen();
      var erf_1 = require_erf();
      var erfc_1 = require_erfc();
      var expand_1 = require_expand();
      var expcos_1 = require_expcos();
      var expsin_1 = require_expsin();
      var factor_1 = require_factor();
      var factorial_1 = require_factorial();
      var factorpoly_1 = require_factorpoly();
      var filter_1 = require_filter();
      var float_1 = require_float();
      var floor_1 = require_floor();
      var for_1 = require_for();
      var gamma_1 = require_gamma();
      var gcd_1 = require_gcd();
      var hermite_1 = require_hermite();
      var hilbert_1 = require_hilbert();
      var imag_1 = require_imag();
      var inner_1 = require_inner();
      var integral_1 = require_integral();
      var inv_1 = require_inv();
      var is_1 = require_is();
      var isprime_1 = require_isprime();
      var laguerre_1 = require_laguerre();
      var lcm_1 = require_lcm();
      var leading_1 = require_leading();
      var legendre_1 = require_legendre();
      var list_1 = require_list();
      var log_1 = require_log();
      var lookup_1 = require_lookup();
      var mod_1 = require_mod();
      var multiply_1 = require_multiply();
      var nroots_1 = require_nroots();
      var numerator_1 = require_numerator();
      var outer_1 = require_outer();
      var pattern_1 = require_pattern();
      var polar_1 = require_polar();
      var power_1 = require_power();
      var prime_1 = require_prime();
      var print_1 = require_print();
      var product_1 = require_product();
      var quotient_1 = require_quotient();
      var rationalize_1 = require_rationalize();
      var real_1 = require_real();
      var rect_1 = require_rect();
      var roots_1 = require_roots();
      var round_1 = require_round();
      var sgn_1 = require_sgn();
      var shape_1 = require_shape();
      var simplify_1 = require_simplify();
      var sin_1 = require_sin();
      var sinh_1 = require_sinh();
      var subst_1 = require_subst();
      var sum_1 = require_sum();
      var tan_1 = require_tan();
      var tanh_1 = require_tanh();
      var taylor_1 = require_taylor();
      var tensor_1 = require_tensor();
      var test_1 = require_test();
      var transpose_1 = require_transpose();
      var userfunc_1 = require_userfunc();
      var zero_1 = require_zero();
      function evaluate_integer(p) {
        return bignum_1.nativeInt(Eval(p));
      }
      exports.evaluate_integer = evaluate_integer;
      function Eval(p1) {
        let willEvaluateAsFloats;
        run_1.check_esc_flag();
        if (p1 == null) {
          defs_1.breakpoint;
        }
        if (!defs_1.defs.evaluatingAsFloats && is_1.isfloating(p1)) {
          willEvaluateAsFloats = true;
          defs_1.defs.evaluatingAsFloats = true;
        }
        let result;
        switch (p1.k) {
          case defs_1.CONS:
            Eval_cons(p1);
            result = stack_1.pop();
            break;
          case defs_1.NUM:
            result = defs_1.defs.evaluatingAsFloats ? bignum_1.double(bignum_1.convert_rational_to_double(p1)) : p1;
            break;
          case defs_1.DOUBLE:
          case defs_1.STR:
            result = p1;
            break;
          case defs_1.TENSOR:
            tensor_1.Eval_tensor(p1);
            result = stack_1.pop();
            break;
          case defs_1.SYM:
            Eval_sym(p1);
            result = stack_1.pop();
            break;
          default:
            run_1.stop("atom?");
        }
        if (willEvaluateAsFloats) {
          defs_1.defs.evaluatingAsFloats = false;
        }
        return result;
      }
      exports.Eval = Eval;
      function Eval_sym(p1) {
        if (defs_1.iskeyword(p1)) {
          stack_1.push(Eval(list_1.makeList(p1, defs_1.symbol(defs_1.LAST))));
          return;
        } else if (p1 === defs_1.symbol(defs_1.PI) && defs_1.defs.evaluatingAsFloats) {
          stack_1.push(defs_1.Constants.piAsDouble);
          return;
        }
        const p2 = symbol_1.get_binding(p1);
        if (defs_1.DEBUG) {
          console.log(`looked up: ${p1} which contains: ${p2}`);
        }
        stack_1.push(p2);
        if (p1 !== p2) {
          const positionIfSymbolAlreadyBeingEvaluated = defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.indexOf(p1);
          if (positionIfSymbolAlreadyBeingEvaluated !== -1) {
            let cycleString = "";
            for (let i = positionIfSymbolAlreadyBeingEvaluated; i < defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.length; i++) {
              cycleString += defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated[i].printname + " -> ";
            }
            cycleString += p1.printname;
            run_1.stop("recursive evaluation of symbols: " + cycleString);
            return;
          }
          defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.push(p1);
          stack_1.push(Eval(stack_1.pop()));
          defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.pop();
        }
      }
      function Eval_cons(p1) {
        const cons_head = defs_1.car(p1);
        if (defs_1.car(cons_head) === defs_1.symbol(defs_1.EVAL)) {
          userfunc_1.Eval_user_function(p1);
          return;
        }
        if (!defs_1.issymbol(cons_head)) {
          run_1.stop("cons?");
        }
        switch (symbol_1.symnum(cons_head)) {
          case defs_1.ABS:
            return abs_1.Eval_abs(p1);
          case defs_1.ADD:
            return add_1.Eval_add(p1);
          case defs_1.ADJ:
            return adj_1.Eval_adj(p1);
          case defs_1.AND:
            return test_1.Eval_and(p1);
          case defs_1.ARCCOS:
            return arccos_1.Eval_arccos(p1);
          case defs_1.ARCCOSH:
            return arccosh_1.Eval_arccosh(p1);
          case defs_1.ARCSIN:
            return arcsin_1.Eval_arcsin(p1);
          case defs_1.ARCSINH:
            return arcsinh_1.Eval_arcsinh(p1);
          case defs_1.ARCTAN:
            return arctan_1.Eval_arctan(p1);
          case defs_1.ARCTANH:
            return arctanh_1.Eval_arctanh(p1);
          case defs_1.ARG:
            return arg_1.Eval_arg(p1);
          case defs_1.BESSELJ:
            return besselj_1.Eval_besselj(p1);
          case defs_1.BESSELY:
            return bessely_1.Eval_bessely(p1);
          case defs_1.BINDING:
            return Eval_binding(p1);
          case defs_1.BINOMIAL:
            return binomial_1.Eval_binomial(p1);
          case defs_1.CEILING:
            return ceiling_1.Eval_ceiling(p1);
          case defs_1.CHECK:
            return Eval_check(p1);
          case defs_1.CHOOSE:
            return choose_1.Eval_choose(p1);
          case defs_1.CIRCEXP:
            return circexp_1.Eval_circexp(p1);
          case defs_1.CLEAR:
            return clear_1.Eval_clear(p1);
          case defs_1.CLEARALL:
            return clear_1.Eval_clearall();
          case defs_1.CLEARPATTERNS:
            return pattern_1.Eval_clearpatterns();
          case defs_1.CLOCK:
            return clock_1.Eval_clock(p1);
          case defs_1.COEFF:
            return coeff_1.Eval_coeff(p1);
          case defs_1.COFACTOR:
            return cofactor_1.Eval_cofactor(p1);
          case defs_1.CONDENSE:
            return condense_1.Eval_condense(p1);
          case defs_1.CONJ:
            return conj_1.Eval_conj(p1);
          case defs_1.CONTRACT:
            return contract_1.Eval_contract(p1);
          case defs_1.COS:
            return cos_1.Eval_cos(p1);
          case defs_1.COSH:
            return cosh_1.Eval_cosh(p1);
          case defs_1.DECOMP:
            return decomp_1.Eval_decomp(p1);
          case defs_1.DEGREE:
            return degree_1.Eval_degree(p1);
          case defs_1.DEFINT:
            return defint_1.Eval_defint(p1);
          case defs_1.DENOMINATOR:
            return denominator_1.Eval_denominator(p1);
          case defs_1.DERIVATIVE:
            return derivative_1.Eval_derivative(p1);
          case defs_1.DET:
            return Eval_det(p1);
          case defs_1.DIM:
            return Eval_dim(p1);
          case defs_1.DIRAC:
            return dirac_1.Eval_dirac(p1);
          case defs_1.DIVISORS:
            return Eval_divisors(p1);
          case defs_1.DO:
            return Eval_do(p1);
          case defs_1.DOT:
            return inner_1.Eval_inner(p1);
          case defs_1.EIGEN:
            return eigen_1.Eval_eigen(p1);
          case defs_1.EIGENVAL:
            return eigen_1.Eval_eigenval(p1);
          case defs_1.EIGENVEC:
            return eigen_1.Eval_eigenvec(p1);
          case defs_1.ERF:
            return erf_1.Eval_erf(p1);
          case defs_1.ERFC:
            return erfc_1.Eval_erfc(p1);
          case defs_1.EVAL:
            return Eval_Eval(p1);
          case defs_1.EXP:
            return Eval_exp(p1);
          case defs_1.EXPAND:
            return expand_1.Eval_expand(p1);
          case defs_1.EXPCOS:
            return expcos_1.Eval_expcos(p1);
          case defs_1.EXPSIN:
            return expsin_1.Eval_expsin(p1);
          case defs_1.FACTOR:
            return factor_1.Eval_factor(p1);
          case defs_1.FACTORIAL:
            return Eval_factorial(p1);
          case defs_1.FACTORPOLY:
            return Eval_factorpoly(p1);
          case defs_1.FILTER:
            return filter_1.Eval_filter(p1);
          case defs_1.FLOATF:
            return float_1.Eval_float(p1);
          case defs_1.APPROXRATIO:
            return approxratio_1.Eval_approxratio(p1);
          case defs_1.FLOOR:
            return floor_1.Eval_floor(p1);
          case defs_1.FOR:
            return for_1.Eval_for(p1);
          case defs_1.FUNCTION:
            return define_1.Eval_function_reference(p1);
          case defs_1.GAMMA:
            return gamma_1.Eval_gamma(p1);
          case defs_1.GCD:
            return gcd_1.Eval_gcd(p1);
          case defs_1.HERMITE:
            return Eval_hermite(p1);
          case defs_1.HILBERT:
            return Eval_hilbert(p1);
          case defs_1.IMAG:
            return imag_1.Eval_imag(p1);
          case defs_1.INDEX:
            return Eval_index(p1);
          case defs_1.INNER:
            return inner_1.Eval_inner(p1);
          case defs_1.INTEGRAL:
            return integral_1.Eval_integral(p1);
          case defs_1.INV:
            return Eval_inv(p1);
          case defs_1.INVG:
            return Eval_invg(p1);
          case defs_1.ISINTEGER:
            return Eval_isinteger(p1);
          case defs_1.ISPRIME:
            return isprime_1.Eval_isprime(p1);
          case defs_1.LAGUERRE:
            return laguerre_1.Eval_laguerre(p1);
          case defs_1.LCM:
            return lcm_1.Eval_lcm(p1);
          case defs_1.LEADING:
            return leading_1.Eval_leading(p1);
          case defs_1.LEGENDRE:
            return legendre_1.Eval_legendre(p1);
          case defs_1.LOG:
            return log_1.Eval_log(p1);
          case defs_1.LOOKUP:
            return lookup_1.Eval_lookup(p1);
          case defs_1.MOD:
            return mod_1.Eval_mod(p1);
          case defs_1.MULTIPLY:
            return multiply_1.Eval_multiply(p1);
          case defs_1.NOT:
            return test_1.Eval_not(p1);
          case defs_1.NROOTS:
            return nroots_1.Eval_nroots(p1);
          case defs_1.NUMBER:
            return Eval_number(p1);
          case defs_1.NUMERATOR:
            return numerator_1.Eval_numerator(p1);
          case defs_1.OPERATOR:
            return Eval_operator(p1);
          case defs_1.OR:
            return test_1.Eval_or(p1);
          case defs_1.OUTER:
            return outer_1.Eval_outer(p1);
          case defs_1.PATTERN:
            return pattern_1.Eval_pattern(p1);
          case defs_1.PATTERNSINFO:
            return pattern_1.Eval_patternsinfo();
          case defs_1.POLAR:
            return polar_1.Eval_polar(p1);
          case defs_1.POWER:
            return power_1.Eval_power(p1);
          case defs_1.PRIME:
            return prime_1.Eval_prime(p1);
          case defs_1.PRINT:
            return print_1.Eval_print(p1);
          case defs_1.PRINT2DASCII:
            return print_1.Eval_print2dascii(p1);
          case defs_1.PRINTFULL:
            return print_1.Eval_printcomputer(p1);
          case defs_1.PRINTLATEX:
            return print_1.Eval_printlatex(p1);
          case defs_1.PRINTLIST:
            return print_1.Eval_printlist(p1);
          case defs_1.PRINTPLAIN:
            return print_1.Eval_printhuman(p1);
          case defs_1.PRODUCT:
            return product_1.Eval_product(p1);
          case defs_1.QUOTE:
            return Eval_quote(p1);
          case defs_1.QUOTIENT:
            return quotient_1.Eval_quotient(p1);
          case defs_1.RANK:
            return Eval_rank(p1);
          case defs_1.RATIONALIZE:
            return rationalize_1.Eval_rationalize(p1);
          case defs_1.REAL:
            return real_1.Eval_real(p1);
          case defs_1.ROUND:
            return round_1.Eval_round(p1);
          case defs_1.YYRECT:
            return rect_1.Eval_rect(p1);
          case defs_1.ROOTS:
            return roots_1.Eval_roots(p1);
          case defs_1.SETQ:
            return Eval_setq(p1);
          case defs_1.SGN:
            return sgn_1.Eval_sgn(p1);
          case defs_1.SILENTPATTERN:
            return pattern_1.Eval_silentpattern(p1);
          case defs_1.SIMPLIFY:
            return simplify_1.Eval_simplify(p1);
          case defs_1.SIN:
            return sin_1.Eval_sin(p1);
          case defs_1.SINH:
            return sinh_1.Eval_sinh(p1);
          case defs_1.SHAPE:
            return shape_1.Eval_shape(p1);
          case defs_1.SQRT:
            return Eval_sqrt(p1);
          case defs_1.STOP:
            return Eval_stop();
          case defs_1.SUBST:
            return Eval_subst(p1);
          case defs_1.SUM:
            return sum_1.Eval_sum(p1);
          case defs_1.SYMBOLSINFO:
            return symbol_1.Eval_symbolsinfo();
          case defs_1.TAN:
            return tan_1.Eval_tan(p1);
          case defs_1.TANH:
            return tanh_1.Eval_tanh(p1);
          case defs_1.TAYLOR:
            return taylor_1.Eval_taylor(p1);
          case defs_1.TEST:
            return test_1.Eval_test(p1);
          case defs_1.TESTEQ:
            return test_1.Eval_testeq(p1);
          case defs_1.TESTGE:
            return test_1.Eval_testge(p1);
          case defs_1.TESTGT:
            return test_1.Eval_testgt(p1);
          case defs_1.TESTLE:
            return test_1.Eval_testle(p1);
          case defs_1.TESTLT:
            return test_1.Eval_testlt(p1);
          case defs_1.TRANSPOSE:
            return transpose_1.Eval_transpose(p1);
          case defs_1.UNIT:
            return Eval_unit(p1);
          case defs_1.ZERO:
            return zero_1.Eval_zero(p1);
          default:
            return userfunc_1.Eval_user_function(p1);
        }
      }
      function Eval_binding(p1) {
        stack_1.push(symbol_1.get_binding(defs_1.cadr(p1)));
      }
      function Eval_check(p1) {
        const checkResult = is_1.isZeroLikeOrNonZeroLikeOrUndetermined(defs_1.cadr(p1));
        if (checkResult == null) {
          stack_1.push(p1);
        } else {
          bignum_1.push_integer(Number(checkResult));
        }
      }
      function Eval_det(p1) {
        const arg = Eval(defs_1.cadr(p1));
        stack_1.push(det_1.det(arg));
      }
      function Eval_dim(p1) {
        const p2 = Eval(defs_1.cadr(p1));
        const n = defs_1.iscons(defs_1.cddr(p1)) ? evaluate_integer(defs_1.caddr(p1)) : 1;
        if (!defs_1.istensor(p2)) {
          stack_1.push(defs_1.Constants.one);
        } else if (n < 1 || n > p2.tensor.ndim) {
          stack_1.push(p1);
        } else {
          bignum_1.push_integer(p2.tensor.dim[n - 1]);
        }
      }
      function Eval_divisors(p1) {
        stack_1.push(divisors_1.divisors(Eval(defs_1.cadr(p1))));
      }
      function Eval_do(p1) {
        stack_1.push(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        while (defs_1.iscons(p1)) {
          stack_1.pop();
          stack_1.push(Eval(defs_1.car(p1)));
          p1 = defs_1.cdr(p1);
        }
      }
      function Eval_Eval(p1) {
        let tmp = Eval(defs_1.cadr(p1));
        p1 = defs_1.cddr(p1);
        while (defs_1.iscons(p1)) {
          tmp = subst_1.subst(tmp, Eval(defs_1.car(p1)), Eval(defs_1.cadr(p1)));
          p1 = defs_1.cddr(p1);
        }
        stack_1.push(Eval(tmp));
      }
      function Eval_exp(p1) {
        stack_1.push(misc_1.exponential(Eval(defs_1.cadr(p1))));
      }
      function Eval_factorial(p1) {
        stack_1.push(factorial_1.factorial(Eval(defs_1.cadr(p1))));
      }
      function Eval_factorpoly(p1) {
        p1 = defs_1.cdr(p1);
        const arg1 = Eval(defs_1.car(p1));
        p1 = defs_1.cdr(p1);
        const arg2 = Eval(defs_1.car(p1));
        let temp = factorpoly_1.factorpoly(arg1, arg2);
        if (defs_1.iscons(p1)) {
          temp = p1.tail().reduce((a, b) => factorpoly_1.factorpoly(a, Eval(b)), temp);
        }
        stack_1.push(temp);
      }
      function Eval_hermite(p1) {
        const arg2 = Eval(defs_1.caddr(p1));
        const arg1 = Eval(defs_1.cadr(p1));
        stack_1.push(hermite_1.hermite(arg1, arg2));
      }
      function Eval_hilbert(p1) {
        stack_1.push(hilbert_1.hilbert(Eval(defs_1.cadr(p1))));
      }
      function Eval_index(p1) {
        const result = _index(p1);
        stack_1.push(result);
      }
      function _index(p1) {
        const orig = p1;
        p1 = defs_1.cdr(p1);
        const theTensor = Eval(defs_1.car(p1));
        if (defs_1.isNumericAtom(theTensor)) {
          run_1.stop("trying to access a scalar as a tensor");
        }
        if (!defs_1.istensor(theTensor)) {
          return orig;
        }
        const stack = [theTensor];
        p1 = defs_1.cdr(p1);
        while (defs_1.iscons(p1)) {
          stack.push(Eval(defs_1.car(p1)));
          if (!is_1.isintegerorintegerfloat(stack[stack.length - 1])) {
            return orig;
          }
          p1 = defs_1.cdr(p1);
        }
        return _1.index_function(stack);
      }
      function Eval_inv(p1) {
        const arg = Eval(defs_1.cadr(p1));
        stack_1.push(inv_1.inv(arg));
      }
      function Eval_invg(p1) {
        const arg = Eval(defs_1.cadr(p1));
        stack_1.push(inv_1.invg(arg));
      }
      function Eval_isinteger(p1) {
        p1 = Eval(defs_1.cadr(p1));
        const result = _isinteger(p1);
        stack_1.push(result);
      }
      function _isinteger(p1) {
        if (defs_1.isrational(p1)) {
          return is_1.isinteger(p1) ? defs_1.Constants.one : defs_1.Constants.zero;
        }
        if (defs_1.isdouble(p1)) {
          const n = Math.floor(p1.d);
          return n === p1.d ? defs_1.Constants.one : defs_1.Constants.zero;
        }
        return list_1.makeList(defs_1.symbol(defs_1.ISINTEGER), p1);
      }
      function Eval_number(p1) {
        p1 = Eval(defs_1.cadr(p1));
        const result = p1.k === defs_1.NUM || p1.k === defs_1.DOUBLE ? defs_1.Constants.one : defs_1.Constants.zero;
        stack_1.push(result);
      }
      function Eval_operator(p1) {
        const mapped = defs_1.iscons(p1) ? p1.tail().map(Eval) : [];
        const result = list_1.makeList(defs_1.symbol(defs_1.OPERATOR), ...mapped);
        stack_1.push(result);
      }
      function Eval_quote(p1) {
        stack_1.push(defs_1.cadr(p1));
      }
      function Eval_rank(p1) {
        p1 = Eval(defs_1.cadr(p1));
        const rank = defs_1.istensor(p1) ? bignum_1.integer(p1.tensor.ndim) : defs_1.Constants.zero;
        stack_1.push(rank);
      }
      function Eval_setq(p1) {
        if (defs_1.caadr(p1) === defs_1.symbol(defs_1.INDEX)) {
          setq_indexed(p1);
          return;
        }
        if (defs_1.iscons(defs_1.cadr(p1))) {
          define_1.define_user_function(p1);
          return;
        }
        if (!defs_1.issymbol(defs_1.cadr(p1))) {
          run_1.stop("symbol assignment: error in symbol");
        }
        const p2 = Eval(defs_1.caddr(p1));
        symbol_1.set_binding(defs_1.cadr(p1), p2);
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      function setq_indexed(p1) {
        const p4 = defs_1.cadadr(p1);
        console.log(`p4: ${p4}`);
        if (!defs_1.issymbol(p4)) {
          run_1.stop("indexed assignment: expected a symbol name");
        }
        const h = defs_1.defs.tos;
        stack_1.push(Eval(defs_1.caddr(p1)));
        let p2 = defs_1.cdadr(p1);
        if (defs_1.iscons(p2)) {
          stack_1.push_all([...p2].map(Eval));
        }
        _1.set_component(defs_1.defs.tos - h);
        const p3 = stack_1.pop();
        symbol_1.set_binding(p4, p3);
        stack_1.push(defs_1.symbol(defs_1.NIL));
      }
      function Eval_sqrt(p1) {
        const base = Eval(defs_1.cadr(p1));
        stack_1.push(power_1.power(base, bignum_1.rational(1, 2)));
      }
      function Eval_stop() {
        run_1.stop("user stop");
      }
      function Eval_subst(p1) {
        const newExpr = Eval(defs_1.cadr(p1));
        const oldExpr = Eval(defs_1.caddr(p1));
        const expr = Eval(defs_1.cadddr(p1));
        stack_1.push(Eval(subst_1.subst(expr, oldExpr, newExpr)));
      }
      function Eval_unit(p1) {
        const n = evaluate_integer(defs_1.cadr(p1));
        if (isNaN(n)) {
          stack_1.push(p1);
          return;
        }
        if (n < 1) {
          stack_1.push(p1);
          return;
        }
        p1 = alloc_1.alloc_tensor(n * n);
        p1.tensor.ndim = 2;
        p1.tensor.dim[0] = n;
        p1.tensor.dim[1] = n;
        for (let i = 0; i < n; i++) {
          p1.tensor.elem[n * i + i] = defs_1.Constants.one;
        }
        tensor_1.check_tensor_dimensions(p1);
        stack_1.push(p1);
      }
      function Eval_predicate(p1) {
        if (defs_1.car(p1) === defs_1.symbol(defs_1.SETQ)) {
          p1 = list_1.makeList(defs_1.symbol(defs_1.TESTEQ), defs_1.cadr(p1), defs_1.caddr(p1));
        }
        return Eval(p1);
      }
      exports.Eval_predicate = Eval_predicate;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/add.js
  var require_add = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/add.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.subtract = exports.add_all = exports.add = exports.Eval_add = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      var print_1 = require_print();
      var tensor_1 = require_tensor();
      var flag = 0;
      function Eval_add(p1) {
        const terms = [];
        p1 = defs_1.cdr(p1);
        for (const t of p1) {
          const p2 = eval_1.Eval(t);
          push_terms(terms, p2);
        }
        stack_1.push(add_terms(terms));
      }
      exports.Eval_add = Eval_add;
      function add_terms(terms) {
        if (defs_1.DEBUG) {
          for (const term of terms) {
            console.log(print_1.print_list(term));
          }
        }
        for (let i = 0; i < 10; i++) {
          if (terms.length < 2) {
            break;
          }
          flag = 0;
          terms.sort(cmp_terms);
          if (flag === 0) {
            break;
          }
          combine_terms(terms);
        }
        switch (terms.length) {
          case 0:
            return defs_1.Constants.Zero();
          case 1:
            return terms[0];
          default:
            terms.unshift(defs_1.symbol(defs_1.ADD));
            return list_1.makeList(...terms);
        }
      }
      var cmp_terms_count = 0;
      function cmp_terms(p1, p2) {
        cmp_terms_count++;
        if (defs_1.isNumericAtom(p1) && defs_1.isNumericAtom(p2)) {
          flag = 1;
          return 0;
        }
        if (defs_1.istensor(p1) && defs_1.istensor(p2)) {
          if (p1.tensor.ndim < p2.tensor.ndim) {
            return -1;
          }
          if (p1.tensor.ndim > p2.tensor.ndim) {
            return 1;
          }
          for (let i = 0; i < p1.tensor.ndim; i++) {
            if (p1.tensor.dim[i] < p2.tensor.dim[i]) {
              return -1;
            }
            if (p1.tensor.dim[i] > p2.tensor.dim[i]) {
              return 1;
            }
          }
          flag = 1;
          return 0;
        }
        if (defs_1.ismultiply(p1)) {
          p1 = defs_1.cdr(p1);
          if (defs_1.isNumericAtom(defs_1.car(p1))) {
            p1 = defs_1.cdr(p1);
            if (defs_1.cdr(p1) === defs_1.symbol(defs_1.NIL)) {
              p1 = defs_1.car(p1);
            }
          }
        }
        if (defs_1.ismultiply(p2)) {
          p2 = defs_1.cdr(p2);
          if (defs_1.isNumericAtom(defs_1.car(p2))) {
            p2 = defs_1.cdr(p2);
            if (defs_1.cdr(p2) === defs_1.symbol(defs_1.NIL)) {
              p2 = defs_1.car(p2);
            }
          }
        }
        const t = misc_1.cmp_expr(p1, p2);
        if (t === 0) {
          flag = 1;
        }
        return t;
      }
      function combine_terms(terms) {
        let i = 0;
        while (i < terms.length - 1) {
          run_1.check_esc_flag();
          let p1, p2;
          let p3 = terms[i];
          let p4 = terms[i + 1];
          if (defs_1.istensor(p3) && defs_1.istensor(p4)) {
            p1 = tensor_1.tensor_plus_tensor(p3, p4);
            if (p1 !== defs_1.symbol(defs_1.NIL)) {
              terms.splice(i, 2, p1);
              i--;
            }
            i++;
            continue;
          }
          if (defs_1.istensor(p3) || defs_1.istensor(p4)) {
            i++;
            continue;
          }
          if (defs_1.isNumericAtom(p3) && defs_1.isNumericAtom(p4)) {
            p1 = bignum_1.add_numbers(p3, p4);
            if (is_1.isZeroAtomOrTensor(p1)) {
              terms.splice(i, 2);
            } else {
              terms.splice(i, 2, p1);
            }
            i--;
            i++;
            continue;
          }
          if (defs_1.isNumericAtom(p3) || defs_1.isNumericAtom(p4)) {
            i++;
            continue;
          }
          p1 = defs_1.Constants.One();
          p2 = defs_1.Constants.One();
          let t = 0;
          if (defs_1.ismultiply(p3)) {
            p3 = defs_1.cdr(p3);
            t = 1;
            if (defs_1.isNumericAtom(defs_1.car(p3))) {
              p1 = defs_1.car(p3);
              p3 = defs_1.cdr(p3);
              if (defs_1.cdr(p3) === defs_1.symbol(defs_1.NIL)) {
                p3 = defs_1.car(p3);
                t = 0;
              }
            }
          }
          if (defs_1.ismultiply(p4)) {
            p4 = defs_1.cdr(p4);
            if (defs_1.isNumericAtom(defs_1.car(p4))) {
              p2 = defs_1.car(p4);
              p4 = defs_1.cdr(p4);
              if (defs_1.cdr(p4) === defs_1.symbol(defs_1.NIL)) {
                p4 = defs_1.car(p4);
              }
            }
          }
          if (!misc_1.equal(p3, p4)) {
            i++;
            continue;
          }
          p1 = bignum_1.add_numbers(p1, p2);
          if (is_1.isZeroAtomOrTensor(p1)) {
            terms.splice(i, 2);
            i--;
            i++;
            continue;
          }
          const arg2 = t ? new defs_1.Cons(defs_1.symbol(defs_1.MULTIPLY), p3) : p3;
          terms.splice(i, 2, multiply_1.multiply(p1, arg2));
          i--;
          i++;
        }
      }
      function push_terms(array, p) {
        if (defs_1.isadd(p)) {
          array.push(...p.tail());
        } else if (!is_1.isZeroAtom(p)) {
          array.push(p);
        }
      }
      function add(p1, p2) {
        const terms = [];
        push_terms(terms, p1);
        push_terms(terms, p2);
        return add_terms(terms);
      }
      exports.add = add;
      function add_all(terms) {
        const flattened = [];
        for (const t of terms) {
          push_terms(flattened, t);
        }
        return add_terms(flattened);
      }
      exports.add_all = add_all;
      function subtract(p1, p2) {
        return add(p1, multiply_1.negate(p2));
      }
      exports.subtract = subtract;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/tensor.js
  var require_tensor = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/tensor.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.copy_tensor = exports.power_tensor = exports.compare_tensors = exports.d_tensor_scalar = exports.d_scalar_tensor = exports.d_tensor_tensor = exports.is_square_matrix = exports.check_tensor_dimensions = exports.scalar_times_tensor = exports.tensor_times_scalar = exports.tensor_plus_tensor = exports.Eval_tensor = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var misc_1 = require_misc();
      var add_1 = require_add();
      var bignum_1 = require_bignum();
      var derivative_1 = require_derivative();
      var eval_1 = require_eval();
      var inner_1 = require_inner();
      var inv_1 = require_inv();
      var is_1 = require_is();
      var list_1 = require_list();
      var multiply_1 = require_multiply();
      function Eval_tensor(a) {
        check_tensor_dimensions(a);
        const { nelem, ndim } = a.tensor;
        const b = alloc_1.alloc_tensor(nelem);
        b.tensor.ndim = ndim;
        b.tensor.dim = Array.from(a.tensor.dim);
        check_tensor_dimensions(b);
        b.tensor.elem = a.tensor.elem.map((el) => eval_1.Eval(el));
        check_tensor_dimensions(a);
        check_tensor_dimensions(b);
        stack_1.push(promote_tensor(b));
      }
      exports.Eval_tensor = Eval_tensor;
      function tensor_plus_tensor(p1, p2) {
        if (p1.tensor.ndim !== p2.tensor.ndim) {
          return defs_1.symbol(defs_1.NIL);
        }
        if (p1.tensor.dim.some((n, i) => n !== p2.tensor.dim[i])) {
          return defs_1.symbol(defs_1.NIL);
        }
        const { nelem, ndim } = p1.tensor;
        const p3 = alloc_1.alloc_tensor(nelem);
        p3.tensor.ndim = ndim;
        p3.tensor.dim = Array.from(p1.tensor.dim);
        const a = p1.tensor.elem;
        const b = p2.tensor.elem;
        const c = p3.tensor.elem;
        for (let i = 0; i < nelem; i++) {
          c[i] = add_1.add(a[i], b[i]);
        }
        return p3;
      }
      exports.tensor_plus_tensor = tensor_plus_tensor;
      function tensor_times_scalar(a, p2) {
        const { ndim, nelem } = a.tensor;
        const b = alloc_1.alloc_tensor(nelem);
        b.tensor.ndim = ndim;
        b.tensor.dim = Array.from(a.tensor.dim);
        b.tensor.elem = a.tensor.elem.map((a_i) => multiply_1.multiply(a_i, p2));
        return b;
      }
      exports.tensor_times_scalar = tensor_times_scalar;
      function scalar_times_tensor(p1, a) {
        const { ndim, nelem } = a.tensor;
        const b = alloc_1.alloc_tensor(nelem);
        b.tensor.ndim = ndim;
        b.tensor.dim = Array.from(a.tensor.dim);
        b.tensor.elem = a.tensor.elem.map((a_i) => multiply_1.multiply(p1, a_i));
        return b;
      }
      exports.scalar_times_tensor = scalar_times_tensor;
      function check_tensor_dimensions(p) {
        if (p.tensor.nelem !== p.tensor.elem.length) {
          console.log("something wrong in tensor dimensions");
          return defs_1.breakpoint;
        }
      }
      exports.check_tensor_dimensions = check_tensor_dimensions;
      function is_square_matrix(p) {
        return defs_1.istensor(p) && p.tensor.ndim === 2 && p.tensor.dim[0] === p.tensor.dim[1];
      }
      exports.is_square_matrix = is_square_matrix;
      function d_tensor_tensor(p1, p2) {
        const { ndim, nelem } = p1.tensor;
        if (ndim + 1 >= defs_1.MAXDIM) {
          return list_1.makeList(defs_1.symbol(defs_1.DERIVATIVE), p1, p2);
        }
        const p3 = alloc_1.alloc_tensor(nelem * p2.tensor.nelem);
        p3.tensor.ndim = ndim + 1;
        p3.tensor.dim = [...p1.tensor.dim, p2.tensor.dim[0]];
        const a = p1.tensor.elem;
        const b = p2.tensor.elem;
        const c = p3.tensor.elem;
        for (let i = 0; i < nelem; i++) {
          for (let j = 0; j < p2.tensor.nelem; j++) {
            c[i * p2.tensor.nelem + j] = derivative_1.derivative(a[i], b[j]);
          }
        }
        return p3;
      }
      exports.d_tensor_tensor = d_tensor_tensor;
      function d_scalar_tensor(p1, p2) {
        const p3 = alloc_1.alloc_tensor(p2.tensor.nelem);
        p3.tensor.ndim = 1;
        p3.tensor.dim[0] = p2.tensor.dim[0];
        p3.tensor.elem = p2.tensor.elem.map((a_i) => derivative_1.derivative(p1, a_i));
        return p3;
      }
      exports.d_scalar_tensor = d_scalar_tensor;
      function d_tensor_scalar(p1, p2) {
        const p3 = alloc_1.alloc_tensor(p1.tensor.nelem);
        p3.tensor.ndim = p1.tensor.ndim;
        p3.tensor.dim = [...p1.tensor.dim];
        p3.tensor.elem = p1.tensor.elem.map((a_i) => derivative_1.derivative(a_i, p2));
        return p3;
      }
      exports.d_tensor_scalar = d_tensor_scalar;
      function compare_tensors(p1, p2) {
        if (p1.tensor.ndim < p2.tensor.ndim) {
          return -1;
        }
        if (p1.tensor.ndim > p2.tensor.ndim) {
          return 1;
        }
        for (let i = 0; i < p1.tensor.ndim; i++) {
          if (p1.tensor.dim[i] < p2.tensor.dim[i]) {
            return -1;
          }
          if (p1.tensor.dim[i] > p2.tensor.dim[i]) {
            return 1;
          }
        }
        for (let i = 0; i < p1.tensor.nelem; i++) {
          if (misc_1.equal(p1.tensor.elem[i], p2.tensor.elem[i])) {
            continue;
          }
          if (misc_1.lessp(p1.tensor.elem[i], p2.tensor.elem[i])) {
            return -1;
          } else {
            return 1;
          }
        }
        return 0;
      }
      exports.compare_tensors = compare_tensors;
      function power_tensor(p1, p2) {
        let k = p1.tensor.ndim - 1;
        if (p1.tensor.dim[0] !== p1.tensor.dim[k]) {
          return list_1.makeList(defs_1.symbol(defs_1.POWER), p1, p2);
        }
        let n = bignum_1.nativeInt(p2);
        if (isNaN(n)) {
          return list_1.makeList(defs_1.symbol(defs_1.POWER), p1, p2);
        }
        if (n === 0) {
          if (p1.tensor.ndim !== 2) {
            run_1.stop("power(tensor,0) with tensor rank not equal to 2");
          }
          n = p1.tensor.dim[0];
          p1 = alloc_1.alloc_tensor(n * n);
          p1.tensor.ndim = 2;
          p1.tensor.dim[0] = n;
          p1.tensor.dim[1] = n;
          for (let i = 0; i < n; i++) {
            p1.tensor.elem[n * i + i] = defs_1.Constants.one;
          }
          check_tensor_dimensions(p1);
          return p1;
        }
        let p3 = p1;
        if (n < 0) {
          n = -n;
          p3 = inv_1.inv(p3);
        }
        let prev = p3;
        for (let i = 1; i < n; i++) {
          prev = inner_1.inner(prev, p3);
          if (is_1.isZeroAtomOrTensor(prev)) {
            break;
          }
        }
        return prev;
      }
      exports.power_tensor = power_tensor;
      function copy_tensor(p1) {
        let p2 = alloc_1.alloc_tensor(p1.tensor.nelem);
        p2.tensor.ndim = p1.tensor.ndim;
        p2.tensor.dim = [...p1.tensor.dim];
        p2.tensor.elem = [...p1.tensor.elem];
        check_tensor_dimensions(p1);
        check_tensor_dimensions(p2);
        return p2;
      }
      exports.copy_tensor = copy_tensor;
      function promote_tensor(p1) {
        if (!defs_1.istensor(p1)) {
          return p1;
        }
        let p2 = p1.tensor.elem[0];
        if (p1.tensor.elem.some((elem) => !compatible(p2, elem))) {
          run_1.stop("Cannot promote tensor due to inconsistent tensor components.");
        }
        if (!defs_1.istensor(p2)) {
          return p1;
        }
        const ndim = p1.tensor.ndim + p2.tensor.ndim;
        if (ndim > defs_1.MAXDIM) {
          run_1.stop("tensor rank > " + defs_1.MAXDIM);
        }
        const nelem = p1.tensor.nelem * p2.tensor.nelem;
        const p3 = alloc_1.alloc_tensor(nelem);
        p3.tensor.ndim = ndim;
        p3.tensor.dim = [...p1.tensor.dim, ...p2.tensor.dim];
        p3.tensor.elem = [].concat(...p1.tensor.elem.map((el) => el.tensor.elem));
        check_tensor_dimensions(p2);
        check_tensor_dimensions(p3);
        return p3;
      }
      function compatible(p, q) {
        if (!defs_1.istensor(p) && !defs_1.istensor(q)) {
          return true;
        }
        if (!defs_1.istensor(p) || !defs_1.istensor(q)) {
          return false;
        }
        if (p.tensor.ndim !== q.tensor.ndim) {
          return false;
        }
        for (let i = 0; i < p.tensor.ndim; i++) {
          if (p.tensor.dim[i] !== q.tensor.dim[i]) {
            return false;
          }
        }
        return true;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/alloc.js
  var require_alloc = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/alloc.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.alloc_tensor = void 0;
      var tensor_1 = require_tensor();
      var defs_1 = require_defs();
      function alloc_tensor(nelem) {
        const p = new defs_1.Tensor();
        for (let i = 0; i < nelem; i++) {
          p.tensor.elem[i] = defs_1.Constants.zero;
        }
        tensor_1.check_tensor_dimensions(p);
        return p;
      }
      exports.alloc_tensor = alloc_tensor;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/misc.js
  var require_misc = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/misc.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.sort = exports.sort_stack = exports.square = exports.exponential = exports.yyexpand = exports.length = exports.cmp_expr = exports.sign = exports.lessp = exports.equal = exports.zero_matrix = exports.new_string = void 0;
      var alloc_1 = require_alloc();
      var defs_1 = require_defs();
      var otherCFunctions_1 = require_otherCFunctions();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var power_1 = require_power();
      var tensor_1 = require_tensor();
      function new_string(s) {
        stack_1.push(new defs_1.Str(s.toString()));
      }
      exports.new_string = new_string;
      function zero_matrix(i, j) {
        const m = alloc_1.alloc_tensor(i * j);
        m.ndim = 2;
        m.dim[0] = i;
        m.dim[1] = j;
        return m;
      }
      exports.zero_matrix = zero_matrix;
      function equal(p1, p2) {
        return cmp_expr(p1, p2) === 0;
      }
      exports.equal = equal;
      function lessp(p1, p2) {
        return cmp_expr(p1, p2) < 0;
      }
      exports.lessp = lessp;
      function sign(n) {
        if (n < 0) {
          return -1;
        } else if (n > 0) {
          return 1;
        } else {
          return 0;
        }
      }
      exports.sign = sign;
      function cmp_expr(p1, p2) {
        let n = 0;
        if (p1 === p2) {
          return 0;
        }
        if (p1 === defs_1.symbol(defs_1.NIL)) {
          return -1;
        }
        if (p2 === defs_1.symbol(defs_1.NIL)) {
          return 1;
        }
        if (defs_1.isNumericAtom(p1) && defs_1.isNumericAtom(p2)) {
          return sign(bignum_1.compare_numbers(p1, p2));
        }
        if (defs_1.isNumericAtom(p1)) {
          return -1;
        }
        if (defs_1.isNumericAtom(p2)) {
          return 1;
        }
        if (defs_1.isstr(p1) && defs_1.isstr(p2)) {
          return sign(otherCFunctions_1.strcmp(p1.str, p2.str));
        }
        if (defs_1.isstr(p1)) {
          return -1;
        }
        if (defs_1.isstr(p2)) {
          return 1;
        }
        if (defs_1.issymbol(p1) && defs_1.issymbol(p2)) {
          return sign(otherCFunctions_1.strcmp(symbol_1.get_printname(p1), symbol_1.get_printname(p2)));
        }
        if (defs_1.issymbol(p1)) {
          return -1;
        }
        if (defs_1.issymbol(p2)) {
          return 1;
        }
        if (defs_1.istensor(p1) && defs_1.istensor(p2)) {
          return tensor_1.compare_tensors(p1, p2);
        }
        if (defs_1.istensor(p1)) {
          return -1;
        }
        if (defs_1.istensor(p2)) {
          return 1;
        }
        while (defs_1.iscons(p1) && defs_1.iscons(p2)) {
          n = cmp_expr(defs_1.car(p1), defs_1.car(p2));
          if (n !== 0) {
            return n;
          }
          p1 = defs_1.cdr(p1);
          p2 = defs_1.cdr(p2);
        }
        if (defs_1.iscons(p2)) {
          return -1;
        }
        if (defs_1.iscons(p1)) {
          return 1;
        }
        return 0;
      }
      exports.cmp_expr = cmp_expr;
      function length(p) {
        const n = defs_1.iscons(p) ? [...p].length : 0;
        return n;
      }
      exports.length = length;
      function yyexpand(p1) {
        return defs_1.doexpand(eval_1.Eval, p1);
      }
      exports.yyexpand = yyexpand;
      function exponential(p1) {
        return power_1.power(defs_1.symbol(defs_1.E), p1);
      }
      exports.exponential = exponential;
      function square(p1) {
        return power_1.power(p1, bignum_1.integer(2));
      }
      exports.square = square;
      function sort_stack(n) {
        const h = defs_1.defs.tos - n;
        const subsetOfStack = defs_1.defs.stack.slice(h, h + n);
        subsetOfStack.sort(cmp_expr);
        defs_1.defs.stack = defs_1.defs.stack.slice(0, h).concat(subsetOfStack).concat(defs_1.defs.stack.slice(h + n));
      }
      exports.sort_stack = sort_stack;
      function sort(arr) {
        arr.sort(cmp_expr);
      }
      exports.sort = sort;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/find.js
  var require_find = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/find.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.findPossibleExponentialForm = exports.findPossibleClockForm = exports.Find = void 0;
      var is_1 = require_is();
      var misc_1 = require_misc();
      var defs_1 = require_defs();
      function Find(p, q) {
        if (misc_1.equal(p, q)) {
          return true;
        }
        if (defs_1.istensor(p)) {
          for (let i = 0; i < p.tensor.nelem; i++) {
            if (Find(p.tensor.elem[i], q)) {
              return true;
            }
          }
          return false;
        }
        if (defs_1.iscons(p)) {
          return [...p].some((p1) => Find(p1, q));
        }
        return false;
      }
      exports.Find = Find;
      function findPossibleClockForm(p, p1) {
        if (is_1.isimaginaryunit(p)) {
          return false;
        }
        if (defs_1.ispower(p) && !is_1.isinteger(defs_1.caddr(p1))) {
          if (Find(defs_1.cadr(p), defs_1.Constants.imaginaryunit)) {
            return true;
          }
        }
        if (defs_1.ispower(p) && is_1.equaln(defs_1.cadr(p), -1) && !is_1.isinteger(defs_1.caddr(p1))) {
          return true;
        }
        if (defs_1.istensor(p)) {
          for (let i = 0; i < p.tensor.nelem; i++) {
            if (findPossibleClockForm(p.tensor.elem[i], p1)) {
              return true;
            }
          }
          return false;
        }
        if (defs_1.iscons(p)) {
          return [...p].some((el) => findPossibleClockForm(el, p1));
        }
        return false;
      }
      exports.findPossibleClockForm = findPossibleClockForm;
      function findPossibleExponentialForm(p) {
        if (defs_1.ispower(p) && defs_1.cadr(p) === defs_1.symbol(defs_1.E)) {
          return Find(defs_1.caddr(p), defs_1.Constants.imaginaryunit);
        }
        if (defs_1.istensor(p)) {
          for (let i = 0; i < p.tensor.nelem; i++) {
            if (findPossibleExponentialForm(p.tensor.elem[i])) {
              return true;
            }
          }
          return false;
        }
        if (defs_1.iscons(p)) {
          return [...p].some(findPossibleExponentialForm);
        }
        return false;
      }
      exports.findPossibleExponentialForm = findPossibleExponentialForm;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/is.js
  var require_is = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/is.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.isnpi = exports.isquarterturn = exports.isimaginaryunit = exports.isfloating = exports.isMinusSqrtThreeOverTwo = exports.isSqrtThreeOverTwo = exports.isminusoneoversqrttwo = exports.isoneoversqrttwo = exports.isminusoneovertwo = exports.isoneovertwo = exports.equalq = exports.equaln = exports.isfraction = exports.isoneover = exports.isNumberOneOverSomething = exports.isintegerfactor = exports.issymbolic = exports.isnegative = exports.iseveninteger = exports.iscomplexnumber = exports.iscomplexnumberdouble = exports.isimaginarynumber = exports.isnegativeterm = exports.ispolyexpandedform = exports.isunivarpolyfactoredorexpandedform = exports.isposint = exports.isnonnegativeinteger = exports.isintegerorintegerfloat = exports.isinteger = exports.isone = exports.isminusone = exports.isplusone = exports.isplustwo = exports.ispositivenumber = exports.isnegativenumber = exports.isZeroLikeOrNonZeroLikeOrUndetermined = exports.isZeroAtomOrTensor = exports.isZeroAtom = void 0;
      var defs_1 = require_defs();
      var find_1 = require_find();
      var misc_1 = require_misc();
      var abs_1 = require_abs();
      var bignum_1 = require_bignum();
      var eval_1 = require_eval();
      var float_1 = require_float();
      var guess_1 = require_guess();
      var multiply_1 = require_multiply();
      var DEBUG_IS = false;
      function isZeroAtom(p) {
        switch (p.k) {
          case defs_1.NUM:
            if (defs_1.MZERO(p.q.a)) {
              return true;
            }
            break;
          case defs_1.DOUBLE:
            if (p.d === 0) {
              return true;
            }
            break;
        }
        return false;
      }
      exports.isZeroAtom = isZeroAtom;
      function isZeroTensor(p) {
        if (!defs_1.istensor(p)) {
          return false;
        }
        return p.tensor.elem.every((el) => isZeroAtomOrTensor(el));
      }
      function isZeroAtomOrTensor(p) {
        return isZeroAtom(p) || isZeroTensor(p);
      }
      exports.isZeroAtomOrTensor = isZeroAtomOrTensor;
      function isZeroLikeOrNonZeroLikeOrUndetermined(valueOrPredicate) {
        let evalledArgument = eval_1.Eval_predicate(valueOrPredicate);
        if (isZeroAtomOrTensor(evalledArgument)) {
          return false;
        }
        if (defs_1.isNumericAtomOrTensor(evalledArgument)) {
          return true;
        }
        evalledArgument = float_1.zzfloat(evalledArgument);
        if (isZeroAtomOrTensor(evalledArgument)) {
          return false;
        }
        if (defs_1.isNumericAtomOrTensor(evalledArgument)) {
          return true;
        }
        if (find_1.Find(evalledArgument, defs_1.Constants.imaginaryunit)) {
          evalledArgument = eval_1.Eval_predicate(abs_1.absValFloat(evalledArgument));
          if (isZeroAtomOrTensor(evalledArgument)) {
            return false;
          }
          if (defs_1.isNumericAtomOrTensor(evalledArgument)) {
            return true;
          }
        }
        return null;
      }
      exports.isZeroLikeOrNonZeroLikeOrUndetermined = isZeroLikeOrNonZeroLikeOrUndetermined;
      function isnegativenumber(p) {
        switch (p.k) {
          case defs_1.NUM:
            if (defs_1.MSIGN(p.q.a) === -1) {
              return true;
            }
            break;
          case defs_1.DOUBLE:
            if (p.d < 0) {
              return true;
            }
            break;
        }
        return false;
      }
      exports.isnegativenumber = isnegativenumber;
      function ispositivenumber(p) {
        switch (p.k) {
          case defs_1.NUM:
            if (defs_1.MSIGN(p.q.a) === 1) {
              return true;
            }
            break;
          case defs_1.DOUBLE:
            if (p.d > 0) {
              return true;
            }
            break;
        }
        return false;
      }
      exports.ispositivenumber = ispositivenumber;
      function isplustwo(p) {
        switch (p.k) {
          case defs_1.NUM:
            if (defs_1.MEQUAL(p.q.a, 2) && defs_1.MEQUAL(p.q.b, 1)) {
              return true;
            }
            break;
          case defs_1.DOUBLE:
            if (p.d === 2) {
              return true;
            }
            break;
        }
        return false;
      }
      exports.isplustwo = isplustwo;
      function isplusone(p) {
        switch (p.k) {
          case defs_1.NUM:
            if (defs_1.MEQUAL(p.q.a, 1) && defs_1.MEQUAL(p.q.b, 1)) {
              return true;
            }
            break;
          case defs_1.DOUBLE:
            if (p.d === 1) {
              return true;
            }
            break;
        }
        return false;
      }
      exports.isplusone = isplusone;
      function isminusone(p) {
        switch (p.k) {
          case defs_1.NUM:
            if (defs_1.MEQUAL(p.q.a, -1) && defs_1.MEQUAL(p.q.b, 1)) {
              return true;
            }
            break;
          case defs_1.DOUBLE:
            if (p.d === -1) {
              return true;
            }
            break;
        }
        return false;
      }
      exports.isminusone = isminusone;
      function isone(p) {
        return isplusone(p) || isminusone(p);
      }
      exports.isone = isone;
      function isinteger(p) {
        return p.k === defs_1.NUM && defs_1.MEQUAL(p.q.b, 1);
      }
      exports.isinteger = isinteger;
      function isintegerorintegerfloat(p) {
        if (p.k === defs_1.DOUBLE) {
          if (p.d === Math.round(p.d)) {
            return true;
          }
          return false;
        }
        return isinteger(p);
      }
      exports.isintegerorintegerfloat = isintegerorintegerfloat;
      function isnonnegativeinteger(p) {
        return defs_1.isrational(p) && defs_1.MEQUAL(p.q.b, 1) && defs_1.MSIGN(p.q.a) === 1;
      }
      exports.isnonnegativeinteger = isnonnegativeinteger;
      function isposint(p) {
        return isinteger(p) && defs_1.MSIGN(p.q.a) === 1;
      }
      exports.isposint = isposint;
      function isunivarpolyfactoredorexpandedform(p, x) {
        if (x == null) {
          x = guess_1.guess(p);
        }
        if (ispolyfactoredorexpandedform(p, x) && countTrue(find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_X)), find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Y)), find_1.Find(p, defs_1.symbol(defs_1.SYMBOL_Z))) === 1) {
          return x;
        } else {
          return;
        }
      }
      exports.isunivarpolyfactoredorexpandedform = isunivarpolyfactoredorexpandedform;
      function countTrue(...a) {
        return a.reduce((count, x) => count + Number(x), 0);
      }
      function ispolyfactoredorexpandedform(p, x) {
        return ispolyfactoredorexpandedform_factor(p, x);
      }
      function ispolyfactoredorexpandedform_factor(p, x) {
        if (defs_1.ismultiply(p)) {
          return p.tail().every((el) => {
            const bool = ispolyfactoredorexpandedform_power(el, x);
            if (defs_1.DEBUG) {
              console.log(`ispolyfactoredorexpandedform_factor testing ${el}`);
              if (bool) {
                console.log(`... tested negative:${el}`);
              }
            }
            return bool;
          });
        } else {
          return ispolyfactoredorexpandedform_power(p, x);
        }
      }
      function ispolyfactoredorexpandedform_power(p, x) {
        if (defs_1.ispower(p)) {
          if (defs_1.DEBUG) {
            console.log("ispolyfactoredorexpandedform_power (isposint(caddr(p)) " + (isposint(defs_1.caddr(p)), defs_1.DEBUG ? console.log("ispolyfactoredorexpandedform_power ispolyexpandedform_expr(cadr(p), x)) " + ispolyexpandedform_expr(defs_1.cadr(p), x)) : void 0));
          }
          return isposint(defs_1.caddr(p)) && ispolyexpandedform_expr(defs_1.cadr(p), x);
        } else {
          if (defs_1.DEBUG) {
            console.log(`ispolyfactoredorexpandedform_power not a power, testing if this is exp form: ${p}`);
          }
          return ispolyexpandedform_expr(p, x);
        }
      }
      function ispolyexpandedform(p, x) {
        if (find_1.Find(p, x)) {
          return ispolyexpandedform_expr(p, x);
        }
        return false;
      }
      exports.ispolyexpandedform = ispolyexpandedform;
      function ispolyexpandedform_expr(p, x) {
        if (defs_1.isadd(p)) {
          return p.tail().every((el) => ispolyexpandedform_term(el, x));
        } else {
          return ispolyexpandedform_term(p, x);
        }
      }
      function ispolyexpandedform_term(p, x) {
        if (defs_1.ismultiply(p)) {
          return p.tail().every((el) => ispolyexpandedform_factor(el, x));
        } else {
          return ispolyexpandedform_factor(p, x);
        }
      }
      function ispolyexpandedform_factor(p, x) {
        if (misc_1.equal(p, x)) {
          return true;
        }
        if (defs_1.ispower(p) && misc_1.equal(defs_1.cadr(p), x)) {
          return isposint(defs_1.caddr(p));
        }
        return !find_1.Find(p, x);
      }
      function isnegativeterm(p) {
        return isnegativenumber(p) || defs_1.ismultiply(p) && isnegativenumber(defs_1.cadr(p));
      }
      exports.isnegativeterm = isnegativeterm;
      function hasNegativeRationalExponent(p) {
        if (defs_1.ispower(p) && defs_1.isrational(defs_1.car(defs_1.cdr(defs_1.cdr(p)))) && isnegativenumber(defs_1.car(defs_1.cdr(p)))) {
          if (DEBUG_IS) {
            console.log(`hasNegativeRationalExponent: ${p} has imaginary component`);
          }
          return true;
        } else {
          if (DEBUG_IS) {
            console.log(`hasNegativeRationalExponent: ${p} has NO imaginary component`);
          }
          return false;
        }
      }
      function isimaginarynumberdouble(p) {
        return defs_1.ismultiply(p) && misc_1.length(p) === 3 && defs_1.isdouble(defs_1.cadr(p)) && hasNegativeRationalExponent(defs_1.caddr(p)) || misc_1.equal(p, defs_1.Constants.imaginaryunit);
      }
      function isimaginarynumber(p) {
        if (defs_1.ismultiply(p) && misc_1.length(p) === 3 && defs_1.isNumericAtom(defs_1.cadr(p)) && misc_1.equal(defs_1.caddr(p), defs_1.Constants.imaginaryunit) || misc_1.equal(p, defs_1.Constants.imaginaryunit) || hasNegativeRationalExponent(defs_1.caddr(p))) {
          if (DEBUG_IS) {
            console.log(`isimaginarynumber: ${p} is imaginary number`);
          }
          return true;
        } else {
          if (DEBUG_IS) {
            console.log(`isimaginarynumber: ${p} isn't an imaginary number`);
          }
          return false;
        }
      }
      exports.isimaginarynumber = isimaginarynumber;
      function iscomplexnumberdouble(p) {
        return defs_1.isadd(p) && misc_1.length(p) === 3 && defs_1.isdouble(defs_1.cadr(p)) && isimaginarynumberdouble(defs_1.caddr(p)) || isimaginarynumberdouble(p);
      }
      exports.iscomplexnumberdouble = iscomplexnumberdouble;
      function iscomplexnumber(p) {
        if (DEBUG_IS) {
          defs_1.breakpoint;
        }
        if (defs_1.isadd(p) && misc_1.length(p) === 3 && defs_1.isNumericAtom(defs_1.cadr(p)) && isimaginarynumber(defs_1.caddr(p)) || isimaginarynumber(p)) {
          if (defs_1.DEBUG) {
            console.log(`iscomplexnumber: ${p} is imaginary number`);
          }
          return true;
        } else {
          if (defs_1.DEBUG) {
            console.log(`iscomplexnumber: ${p} is imaginary number`);
          }
          return false;
        }
      }
      exports.iscomplexnumber = iscomplexnumber;
      function iseveninteger(p) {
        return isinteger(p) && p.q.a.isEven();
      }
      exports.iseveninteger = iseveninteger;
      function isnegative(p) {
        return defs_1.isadd(p) && isnegativeterm(defs_1.cadr(p)) || isnegativeterm(p);
      }
      exports.isnegative = isnegative;
      function issymbolic(p) {
        if (defs_1.issymbol(p)) {
          return true;
        }
        if (defs_1.iscons(p)) {
          return [...p].some(issymbolic);
        }
        return false;
      }
      exports.issymbolic = issymbolic;
      function isintegerfactor(p) {
        return isinteger(p) || defs_1.ispower(p) && isinteger(defs_1.cadr(p)) && isinteger(defs_1.caddr(p));
      }
      exports.isintegerfactor = isintegerfactor;
      function isNumberOneOverSomething(p) {
        return isfraction(p) && defs_1.MEQUAL(p.q.a.abs(), 1);
      }
      exports.isNumberOneOverSomething = isNumberOneOverSomething;
      function isoneover(p) {
        return defs_1.ispower(p) && isminusone(defs_1.caddr(p));
      }
      exports.isoneover = isoneover;
      function isfraction(p) {
        return p.k === defs_1.NUM && !defs_1.MEQUAL(p.q.b, 1);
      }
      exports.isfraction = isfraction;
      function equaln(p, n) {
        switch (p.k) {
          case defs_1.NUM:
            return defs_1.MEQUAL(p.q.a, n) && defs_1.MEQUAL(p.q.b, 1);
          case defs_1.DOUBLE:
            return p.d === n;
          default:
            return false;
        }
      }
      exports.equaln = equaln;
      function equalq(p, a, b) {
        switch (p.k) {
          case defs_1.NUM:
            return defs_1.MEQUAL(p.q.a, a) && defs_1.MEQUAL(p.q.b, b);
          case defs_1.DOUBLE:
            return p.d === a / b;
          default:
            return false;
        }
      }
      exports.equalq = equalq;
      function isoneovertwo(p) {
        return equalq(p, 1, 2);
      }
      exports.isoneovertwo = isoneovertwo;
      function isminusoneovertwo(p) {
        return equalq(p, -1, 2);
      }
      exports.isminusoneovertwo = isminusoneovertwo;
      function isoneoversqrttwo(p) {
        return defs_1.ispower(p) && equaln(defs_1.cadr(p), 2) && equalq(defs_1.caddr(p), -1, 2);
      }
      exports.isoneoversqrttwo = isoneoversqrttwo;
      function isminusoneoversqrttwo(p) {
        return defs_1.ismultiply(p) && equaln(defs_1.cadr(p), -1) && isoneoversqrttwo(defs_1.caddr(p)) && misc_1.length(p) === 3;
      }
      exports.isminusoneoversqrttwo = isminusoneoversqrttwo;
      function isSqrtThreeOverTwo(p) {
        return defs_1.ismultiply(p) && isoneovertwo(defs_1.cadr(p)) && isSqrtThree(defs_1.caddr(p)) && misc_1.length(p) === 3;
      }
      exports.isSqrtThreeOverTwo = isSqrtThreeOverTwo;
      function isMinusSqrtThreeOverTwo(p) {
        return defs_1.ismultiply(p) && isminusoneovertwo(defs_1.cadr(p)) && isSqrtThree(defs_1.caddr(p)) && misc_1.length(p) === 3;
      }
      exports.isMinusSqrtThreeOverTwo = isMinusSqrtThreeOverTwo;
      function isSqrtThree(p) {
        return defs_1.ispower(p) && equaln(defs_1.cadr(p), 3) && isoneovertwo(defs_1.caddr(p));
      }
      function isfloating(p) {
        if (p.k === defs_1.DOUBLE || p === defs_1.symbol(defs_1.FLOATF)) {
          return true;
        }
        if (defs_1.iscons(p)) {
          return [...p].some(isfloating);
        }
        return false;
      }
      exports.isfloating = isfloating;
      function isimaginaryunit(p) {
        return misc_1.equal(p, defs_1.Constants.imaginaryunit);
      }
      exports.isimaginaryunit = isimaginaryunit;
      function isquarterturn(p) {
        let minussign = 0;
        if (!defs_1.ismultiply(p)) {
          return 0;
        }
        if (misc_1.equal(defs_1.cadr(p), defs_1.Constants.imaginaryunit)) {
          if (defs_1.caddr(p) !== defs_1.symbol(defs_1.PI)) {
            return 0;
          }
          if (misc_1.length(p) !== 3) {
            return 0;
          }
          return 2;
        }
        if (!defs_1.isNumericAtom(defs_1.cadr(p))) {
          return 0;
        }
        if (!misc_1.equal(defs_1.caddr(p), defs_1.Constants.imaginaryunit)) {
          return 0;
        }
        if (defs_1.cadddr(p) !== defs_1.symbol(defs_1.PI)) {
          return 0;
        }
        if (misc_1.length(p) !== 4) {
          return 0;
        }
        let n = bignum_1.nativeInt(multiply_1.multiply(defs_1.cadr(p), bignum_1.integer(2)));
        if (isNaN(n)) {
          return 0;
        }
        if (n < 1) {
          minussign = 1;
          n = -n;
        }
        switch (n % 4) {
          case 0:
            n = 1;
            break;
          case 1:
            n = minussign ? 4 : 3;
            break;
          case 2:
            n = 2;
            break;
          case 3:
            n = minussign ? 3 : 4;
        }
        return n;
      }
      exports.isquarterturn = isquarterturn;
      function isnpi(p) {
        let n = 0;
        if (p === defs_1.symbol(defs_1.PI)) {
          return 2;
        }
        if (!defs_1.ismultiply(p) || !defs_1.isNumericAtom(defs_1.cadr(p)) || defs_1.caddr(p) !== defs_1.symbol(defs_1.PI) || misc_1.length(p) !== 3) {
          return 0;
        }
        n = bignum_1.nativeInt(multiply_1.multiply(defs_1.cadr(p), bignum_1.integer(2)));
        if (isNaN(n)) {
          return 0;
        }
        if (n < 0) {
          n = 4 - -n % 4;
        } else {
          n = 1 + (n - 1) % 4;
        }
        return n;
      }
      exports.isnpi = isnpi;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/otherCFunctions.js
  var require_otherCFunctions = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/otherCFunctions.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.yn = exports.jn = exports.append = exports.__range__ = exports.isalnumorunderscore = exports.isalpha = exports.isdigit = exports.isspace = exports.clear_term = exports.doubleToReasonableString = exports.strcmp = void 0;
      var run_1 = require_run();
      var bignum_1 = require_bignum();
      var is_1 = require_is();
      var defs_1 = require_defs();
      var symbol_1 = require_symbol();
      var list_1 = require_list();
      function strcmp(str1, str2) {
        if (str1 === str2) {
          return 0;
        } else if (str1 > str2) {
          return 1;
        } else {
          return -1;
        }
      }
      exports.strcmp = strcmp;
      function doubleToReasonableString(d) {
        let stringRepresentation;
        if (defs_1.defs.codeGen || defs_1.defs.fullDoubleOutput) {
          return "" + d;
        }
        if (is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.FORCE_FIXED_PRINTOUT)))) {
          stringRepresentation = "" + d;
          if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
            if (/\d*\.\d*e.*/gm.test(stringRepresentation)) {
              stringRepresentation = stringRepresentation.replace(/e(.*)/gm, "\\mathrm{e}{$1}");
            } else {
              stringRepresentation = stringRepresentation.replace(/(\d+)e(.*)/gm, "$1.0\\mathrm{e}{$2}");
            }
          } else {
            if (/\d*\.\d*e.*/gm.test(stringRepresentation)) {
              stringRepresentation = stringRepresentation.replace(/e(.*)/gm, "*10^($1)");
            } else {
              stringRepresentation = stringRepresentation.replace(/(\d+)e(.*)/gm, "$1.0*10^($2)");
            }
          }
        } else {
          const maxFixedPrintoutDigits = bignum_1.nativeInt(symbol_1.get_binding(defs_1.symbol(defs_1.MAX_FIXED_PRINTOUT_DIGITS)));
          stringRepresentation = "" + d.toFixed(maxFixedPrintoutDigits);
          stringRepresentation = stringRepresentation.replace(/(\.\d*?[1-9])0+$/gm, "$1");
          stringRepresentation = stringRepresentation.replace(/\.0+$/gm, "");
          if (stringRepresentation.indexOf(".") === -1) {
            stringRepresentation += ".0";
          }
          if (parseFloat(stringRepresentation) !== d) {
            stringRepresentation = d.toFixed(maxFixedPrintoutDigits) + "...";
          }
        }
        return stringRepresentation;
      }
      exports.doubleToReasonableString = doubleToReasonableString;
      function clear_term() {
      }
      exports.clear_term = clear_term;
      function isspace(s) {
        if (s == null) {
          return false;
        }
        return s === " " || s === "	" || s === "\n" || s === "\v" || s === "\f" || s === "\r";
      }
      exports.isspace = isspace;
      function isdigit(str) {
        if (str == null) {
          return false;
        }
        return /^\d+$/.test(str);
      }
      exports.isdigit = isdigit;
      function isalpha(str) {
        if (str == null) {
          return false;
        }
        return str.search(/[^A-Za-z]/) === -1;
      }
      exports.isalpha = isalpha;
      function isalphaOrUnderscore(str) {
        if (str == null) {
          return false;
        }
        return str.search(/[^A-Za-z_]/) === -1;
      }
      function isalnumorunderscore(str) {
        if (str == null) {
          return false;
        }
        return isalphaOrUnderscore(str) || isdigit(str);
      }
      exports.isalnumorunderscore = isalnumorunderscore;
      function __range__(left, right, inclusive) {
        let range = [];
        let ascending = left < right;
        let end = !inclusive ? right : ascending ? right + 1 : right - 1;
        for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
          range.push(i);
        }
        return range;
      }
      exports.__range__ = __range__;
      function append(p1, p2) {
        const arr = [];
        if (defs_1.iscons(p1)) {
          arr.push(...p1);
        }
        if (defs_1.iscons(p2)) {
          arr.push(...p2);
        }
        return list_1.makeList(...arr);
      }
      exports.append = append;
      function jn(n, x) {
        run_1.stop("Not implemented");
      }
      exports.jn = jn;
      function yn(n, x) {
        run_1.stop("Not implemented");
      }
      exports.yn = yn;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/qadd.js
  var require_qadd = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/qadd.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.qadd = void 0;
      var defs_1 = require_defs();
      var bignum_1 = require_bignum();
      var madd_1 = require_madd();
      var mgcd_1 = require_mgcd();
      var mmul_1 = require_mmul();
      function qadd(qadd_frac1, qadd_frac2) {
        const qadd_ab = mmul_1.mmul(qadd_frac1.q.a, qadd_frac2.q.b);
        const qadd_ba = mmul_1.mmul(qadd_frac1.q.b, qadd_frac2.q.a);
        const qadd_numerator = madd_1.madd(qadd_ab, qadd_ba);
        if (defs_1.MZERO(qadd_numerator)) {
          return defs_1.Constants.zero;
        }
        const qadd_denominator = mmul_1.mmul(qadd_frac1.q.b, qadd_frac2.q.b);
        let gcdBetweenNumeratorAndDenominator = mgcd_1.mgcd(qadd_numerator, qadd_denominator);
        gcdBetweenNumeratorAndDenominator = bignum_1.makeSignSameAs(gcdBetweenNumeratorAndDenominator, qadd_denominator);
        const a = mmul_1.mdiv(qadd_numerator, gcdBetweenNumeratorAndDenominator);
        const b = mmul_1.mdiv(qadd_denominator, gcdBetweenNumeratorAndDenominator);
        const resultSum = new defs_1.Num(a, b);
        return resultSum;
      }
      exports.qadd = qadd;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/qdiv.js
  var require_qdiv = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/qdiv.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.qdiv = void 0;
      var defs_1 = require_defs();
      var run_1 = require_run();
      var bignum_1 = require_bignum();
      var mgcd_1 = require_mgcd();
      var mmul_1 = require_mmul();
      function qdiv(p1, p2) {
        if (defs_1.MZERO(p2.q.a)) {
          run_1.stop("divide by zero");
        }
        if (defs_1.MZERO(p1.q.a)) {
          return defs_1.Constants.zero;
        }
        const aa = mmul_1.mmul(p1.q.a, p2.q.b);
        const bb = mmul_1.mmul(p1.q.b, p2.q.a);
        let c = mgcd_1.mgcd(aa, bb);
        c = bignum_1.makeSignSameAs(c, bb);
        return new defs_1.Num(mmul_1.mdiv(aa, c), mmul_1.mdiv(bb, c));
      }
      exports.qdiv = qdiv;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/qmul.js
  var require_qmul = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/qmul.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.qmul = void 0;
      var defs_1 = require_defs();
      var bignum_1 = require_bignum();
      var mgcd_1 = require_mgcd();
      var mmul_1 = require_mmul();
      function qmul(p1, p2) {
        if (defs_1.MZERO(p1.q.a) || defs_1.MZERO(p2.q.a)) {
          return defs_1.Constants.zero;
        }
        const aa = mmul_1.mmul(p1.q.a, p2.q.a);
        const bb = mmul_1.mmul(p1.q.b, p2.q.b);
        let c = mgcd_1.mgcd(aa, bb);
        c = bignum_1.makeSignSameAs(c, bb);
        return new defs_1.Num(mmul_1.mdiv(aa, c), mmul_1.mdiv(bb, c));
      }
      exports.qmul = qmul;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/bignum.js
  var require_bignum = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/bignum.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.bignum_factorial = exports.bignum_float = exports.pop_number = exports.nativeDouble = exports.pop_double = exports.gcd_numbers = exports.print_number = exports.bignum_scan_float = exports.bignum_scan_integer = exports.nativeInt = exports.pop_integer = exports.rational = exports.push_rational = exports.double = exports.push_double = exports.integer = exports.push_integer = exports.convert_rational_to_double = exports.bignum_power_number = exports.mp_denominator = exports.mp_numerator = exports.bignum_truncate = exports.negate_number = exports.compare_numbers = exports.invert_number = exports.divide_numbers = exports.multiply_numbers = exports.add_numbers = exports.makePositive = exports.makeSignSameAs = exports.setSignTo = exports.isSmall = exports.mint = void 0;
      var big_integer_1 = __importDefault(require_BigInteger());
      var defs_1 = require_defs();
      var mcmp_1 = require_mcmp();
      var otherCFunctions_1 = require_otherCFunctions();
      var run_1 = require_run();
      var stack_1 = require_stack();
      var is_1 = require_is();
      var mgcd_1 = require_mgcd();
      var mmul_1 = require_mmul();
      var mpow_1 = require_mpow();
      var multiply_1 = require_multiply();
      var qadd_1 = require_qadd();
      var qdiv_1 = require_qdiv();
      var qmul_1 = require_qmul();
      function mint(a) {
        return big_integer_1.default(a);
      }
      exports.mint = mint;
      function isSmall(a) {
        return a.geq(Number.MIN_SAFE_INTEGER) && a.leq(Number.MAX_SAFE_INTEGER);
      }
      exports.isSmall = isSmall;
      function setSignTo(a, b) {
        if (a.isPositive()) {
          if (b < 0) {
            return a.multiply(big_integer_1.default(-1));
          }
        } else {
          if (b > 0) {
            return a.multiply(big_integer_1.default(-1));
          }
        }
        return a;
      }
      exports.setSignTo = setSignTo;
      function makeSignSameAs(a, b) {
        if (a.isPositive()) {
          if (b.isNegative()) {
            return a.multiply(big_integer_1.default(-1));
          }
        } else {
          if (b.isPositive()) {
            return a.multiply(big_integer_1.default(-1));
          }
        }
        return a;
      }
      exports.makeSignSameAs = makeSignSameAs;
      function makePositive(a) {
        if (a.isNegative()) {
          return a.multiply(big_integer_1.default(-1));
        }
        return a;
      }
      exports.makePositive = makePositive;
      function add_numbers(p1, p2) {
        if (defs_1.isrational(p1) && defs_1.isrational(p2)) {
          return qadd_1.qadd(p1, p2);
        }
        const a = defs_1.isdouble(p1) ? p1.d : convert_rational_to_double(p1);
        const b = defs_1.isdouble(p2) ? p2.d : convert_rational_to_double(p2);
        return double(a + b);
      }
      exports.add_numbers = add_numbers;
      function multiply_numbers(p1, p2) {
        if (defs_1.isrational(p1) && defs_1.isrational(p2)) {
          return qmul_1.qmul(p1, p2);
        }
        const a = defs_1.isdouble(p1) ? p1.d : convert_rational_to_double(p1);
        const b = defs_1.isdouble(p2) ? p2.d : convert_rational_to_double(p2);
        return new defs_1.Double(a * b);
      }
      exports.multiply_numbers = multiply_numbers;
      function divide_numbers(p1, p2) {
        if (defs_1.isrational(p1) && defs_1.isrational(p2)) {
          return qdiv_1.qdiv(p1, p2);
        }
        if (is_1.isZeroAtomOrTensor(p2)) {
          run_1.stop("divide by zero");
        }
        const a = defs_1.isdouble(p1) ? p1.d : convert_rational_to_double(p1);
        const b = defs_1.isdouble(p2) ? p2.d : convert_rational_to_double(p2);
        return new defs_1.Double(a / b);
      }
      exports.divide_numbers = divide_numbers;
      function invert_number(p1) {
        if (is_1.isZeroAtomOrTensor(p1)) {
          run_1.stop("divide by zero");
        }
        if (defs_1.isdouble(p1)) {
          return new defs_1.Double(1 / p1.d);
        }
        let a = big_integer_1.default(p1.q.a);
        let b = big_integer_1.default(p1.q.b);
        b = makeSignSameAs(b, a);
        a = setSignTo(a, 1);
        return new defs_1.Num(b, a);
      }
      exports.invert_number = invert_number;
      function compare_rationals(a, b) {
        const ab = mmul_1.mmul(a.q.a, b.q.b);
        const ba = mmul_1.mmul(a.q.b, b.q.a);
        return mcmp_1.mcmp(ab, ba);
      }
      function compare_numbers(a, b) {
        if (defs_1.isrational(a) && defs_1.isrational(b)) {
          return compare_rationals(a, b);
        }
        const x = defs_1.isdouble(a) ? a.d : convert_rational_to_double(a);
        const y = defs_1.isdouble(b) ? b.d : convert_rational_to_double(b);
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
        return 0;
      }
      exports.compare_numbers = compare_numbers;
      function negate_number(p1) {
        if (is_1.isZeroAtomOrTensor(p1)) {
          return p1;
        }
        switch (p1.k) {
          case defs_1.NUM:
            return new defs_1.Num(big_integer_1.default(p1.q.a.multiply(big_integer_1.default.minusOne)), big_integer_1.default(p1.q.b));
          case defs_1.DOUBLE:
            return new defs_1.Double(-p1.d);
          default:
            run_1.stop("bug caught in mp_negate_number");
        }
      }
      exports.negate_number = negate_number;
      function bignum_truncate(p1) {
        const a = mmul_1.mdiv(p1.q.a, p1.q.b);
        return new defs_1.Num(a);
      }
      exports.bignum_truncate = bignum_truncate;
      function mp_numerator(p1) {
        if (!defs_1.isrational(p1)) {
          return defs_1.Constants.one;
        }
        return new defs_1.Num(big_integer_1.default(p1.q.a));
      }
      exports.mp_numerator = mp_numerator;
      function mp_denominator(p1) {
        if (!defs_1.isrational(p1)) {
          return defs_1.Constants.one;
        }
        return new defs_1.Num(big_integer_1.default(p1.q.b));
      }
      exports.mp_denominator = mp_denominator;
      function bignum_power_number(base, expo) {
        let a = mpow_1.mpow(base.q.a, Math.abs(expo));
        let b = mpow_1.mpow(base.q.b, Math.abs(expo));
        if (expo < 0) {
          const t = a;
          a = b;
          b = t;
          a = makeSignSameAs(a, b);
          b = setSignTo(b, 1);
        }
        return new defs_1.Num(a, b);
      }
      exports.bignum_power_number = bignum_power_number;
      function convert_rational_to_double(p) {
        if (p.q == null) {
          defs_1.breakpoint;
        }
        const quotientAndRemainder = p.q.a.divmod(p.q.b);
        const result = quotientAndRemainder.quotient.toJSNumber() + quotientAndRemainder.remainder.toJSNumber() / p.q.b.toJSNumber();
        return result;
      }
      exports.convert_rational_to_double = convert_rational_to_double;
      function push_integer(n) {
        if (defs_1.DEBUG) {
          console.log(`pushing integer ${n}`);
        }
        stack_1.push(integer(n));
      }
      exports.push_integer = push_integer;
      function integer(n) {
        return new defs_1.Num(big_integer_1.default(n));
      }
      exports.integer = integer;
      function push_double(d) {
        stack_1.push(double(d));
      }
      exports.push_double = push_double;
      function double(d) {
        return new defs_1.Double(d);
      }
      exports.double = double;
      function push_rational(a, b) {
        stack_1.push(rational(a, b));
      }
      exports.push_rational = push_rational;
      function rational(a, b) {
        return new defs_1.Num(big_integer_1.default(a), big_integer_1.default(b));
      }
      exports.rational = rational;
      function pop_integer() {
        const p1 = stack_1.pop();
        return nativeInt(p1);
      }
      exports.pop_integer = pop_integer;
      function nativeInt(p1) {
        let n = NaN;
        switch (p1.k) {
          case defs_1.NUM:
            if (is_1.isinteger(p1) && isSmall(p1.q.a)) {
              n = p1.q.a.toJSNumber();
            }
            break;
          case defs_1.DOUBLE:
            if (defs_1.DEBUG) {
              console.log("popping integer but double is found");
            }
            if (Math.floor(p1.d) === p1.d) {
              if (defs_1.DEBUG) {
                console.log("...although it's an integer");
              }
              n = p1.d;
            }
            break;
        }
        return n;
      }
      exports.nativeInt = nativeInt;
      function bignum_scan_integer(s) {
        let scounter = 0;
        const sign_ = s[scounter];
        if (sign_ === "+" || sign_ === "-") {
          scounter++;
        }
        const a = big_integer_1.default(s.substring(scounter));
        let p1 = new defs_1.Num(a);
        if (sign_ === "-") {
          p1 = multiply_1.negate(p1);
        }
        stack_1.push(p1);
      }
      exports.bignum_scan_integer = bignum_scan_integer;
      function bignum_scan_float(s) {
        push_double(parseFloat(s));
      }
      exports.bignum_scan_float = bignum_scan_float;
      function print_number(p, signed) {
        let accumulator = "";
        let denominatorString = "";
        const buf = "";
        switch (p.k) {
          case defs_1.NUM:
            var aAsString = p.q.a.toString();
            if (!signed) {
              if (aAsString[0] === "-") {
                aAsString = aAsString.substring(1);
              }
            }
            if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX && is_1.isfraction(p)) {
              aAsString = "\\frac{" + aAsString + "}{";
            }
            accumulator += aAsString;
            if (is_1.isfraction(p)) {
              if (defs_1.defs.printMode !== defs_1.PRINTMODE_LATEX) {
                accumulator += "/";
              }
              denominatorString = p.q.b.toString();
              if (defs_1.defs.printMode === defs_1.PRINTMODE_LATEX) {
                denominatorString += "}";
              }
              accumulator += denominatorString;
            }
            break;
          case defs_1.DOUBLE:
            aAsString = otherCFunctions_1.doubleToReasonableString(p.d);
            if (!signed) {
              if (aAsString[0] === "-") {
                aAsString = aAsString.substring(1);
              }
            }
            accumulator += aAsString;
            break;
        }
        return accumulator;
      }
      exports.print_number = print_number;
      function gcd_numbers(p1, p2) {
        const a = mgcd_1.mgcd(p1.q.a, p2.q.a);
        const b = mgcd_1.mgcd(p1.q.b, p2.q.b);
        return new defs_1.Num(setSignTo(a, 1), b);
      }
      exports.gcd_numbers = gcd_numbers;
      function pop_double() {
        const p1 = stack_1.pop();
        return nativeDouble(p1);
      }
      exports.pop_double = pop_double;
      function nativeDouble(p1) {
        let d = 0;
        switch (p1.k) {
          case defs_1.NUM:
            d = convert_rational_to_double(p1);
            break;
          case defs_1.DOUBLE:
            ({ d } = p1);
            break;
          default:
            d = 0;
        }
        return d;
      }
      exports.nativeDouble = nativeDouble;
      function pop_number() {
        const n = stack_1.pop();
        if (!defs_1.isNumericAtom(n)) {
          run_1.stop("not a number");
        }
        return n;
      }
      exports.pop_number = pop_number;
      function bignum_float(n) {
        const d = convert_rational_to_double(n);
        return new defs_1.Double(d);
      }
      exports.bignum_float = bignum_float;
      function bignum_factorial(n) {
        return new defs_1.Num(__factorial(n));
      }
      exports.bignum_factorial = bignum_factorial;
      function __factorial(n) {
        let a;
        if (n === 0 || n === 1) {
          a = big_integer_1.default(1);
          return a;
        }
        a = big_integer_1.default(2);
        let b = big_integer_1.default(0);
        if (3 <= n) {
          for (let i = 3; i <= n; i++) {
            b = big_integer_1.default(i);
            a = mmul_1.mmul(a, b);
          }
        }
        return a;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/bake.js
  var require_bake = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/sources/bake.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.polyform = exports.bake = void 0;
      var defs_1 = require_defs();
      var bignum_1 = require_bignum();
      var coeff_1 = require_coeff();
      var is_1 = require_is();
      var list_1 = require_list();
      function bake(p1) {
        return defs_1.doexpand(_bake, p1);
      }
      exports.bake = bake;
      function _bake(p1) {
        const s = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_S));
        const t = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_T));
        const x = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_X));
        const y = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_Y));
        const z = is_1.ispolyexpandedform(p1, defs_1.symbol(defs_1.SYMBOL_Z));
        let result;
        if (s && !t && !x && !y && !z) {
          result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_S));
        } else if (!s && t && !x && !y && !z) {
          result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_T));
        } else if (!s && !t && x && !y && !z) {
          result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_X));
        } else if (!s && !t && !x && y && !z) {
          result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_Y));
        } else if (!s && !t && !x && !y && z) {
          result = bake_poly(p1, defs_1.symbol(defs_1.SYMBOL_Z));
        } else if (defs_1.iscons(p1) && defs_1.car(p1) !== defs_1.symbol(defs_1.FOR)) {
          result = list_1.makeList(defs_1.car(p1), ...p1.tail().map(bake));
        } else {
          result = p1;
        }
        return result;
      }
      function polyform(p1, p2) {
        if (is_1.ispolyexpandedform(p1, p2)) {
          return bake_poly(p1, p2);
        }
        if (defs_1.iscons(p1)) {
          return list_1.makeList(defs_1.car(p1), ...p1.tail().map((el) => polyform(el, p2)));
        }
        return p1;
      }
      exports.polyform = polyform;
      function bake_poly(poly, x) {
        const k = coeff_1.coeff(poly, x);
        const result = [];
        for (let i = k.length - 1; i >= 0; i--) {
          const term = k[i];
          result.push(...bake_poly_term(i, term, x));
        }
        if (result.length > 1) {
          return new defs_1.Cons(defs_1.symbol(defs_1.ADD), list_1.makeList(...result));
        }
        return result[0];
      }
      function bake_poly_term(k, coefficient, term) {
        if (is_1.isZeroAtomOrTensor(coefficient)) {
          return [];
        }
        if (k === 0) {
          if (defs_1.isadd(coefficient)) {
            return coefficient.tail();
          }
          return [coefficient];
        }
        const result = [];
        if (defs_1.ismultiply(coefficient)) {
          result.push(...coefficient.tail());
        } else if (!is_1.equaln(coefficient, 1)) {
          result.push(coefficient);
        }
        if (k === 1) {
          result.push(term);
        } else {
          result.push(list_1.makeList(defs_1.symbol(defs_1.POWER), term, bignum_1.integer(k)));
        }
        if (result.length > 1) {
          return [list_1.makeList(defs_1.symbol(defs_1.MULTIPLY), ...result)];
        }
        return result;
      }
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/run.js
  var require_run = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/run.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.computeResultsAndJavaScriptFromAlgebra = exports.computeDependenciesFromAlgebra = exports.check_esc_flag = exports.top_level_eval = exports.check_stack = exports.run = exports.findDependenciesInScript = exports.stop = void 0;
      var stack_1 = require_stack();
      var bake_1 = require_bake();
      var clear_1 = require_clear();
      var eval_1 = require_eval();
      var is_1 = require_is();
      var print_1 = require_print();
      var print2d_1 = require_print2d();
      var scan_1 = require_scan();
      var simplify_1 = require_simplify();
      var subst_1 = require_subst();
      var defs_1 = require_defs();
      var init_1 = require_init();
      var symbol_1 = require_symbol();
      function stop(s) {
        defs_1.defs.errorMessage += "Stop: ";
        defs_1.defs.errorMessage += s;
        const message = defs_1.defs.errorMessage;
        defs_1.defs.errorMessage = "";
        stack_1.moveTos(0);
        throw new Error(message);
      }
      exports.stop = stop;
      function findDependenciesInScript(stringToBeParsed, dontGenerateCode = false) {
        if (defs_1.DEBUG) {
          console.log(`stringToBeParsed: ${stringToBeParsed}`);
        }
        const timeStartFromAlgebra = new Date().getTime();
        const inited = true;
        defs_1.defs.codeGen = true;
        defs_1.defs.symbolsDependencies = {};
        defs_1.defs.symbolsHavingReassignments = [];
        defs_1.defs.symbolsInExpressionsWithoutAssignments = [];
        defs_1.defs.patternHasBeenFound = false;
        let indexOfPartRemainingToBeParsed = 0;
        let allReturnedPlainStrings = "";
        let allReturnedLatexStrings = "";
        let n = 0;
        const dependencyInfo = {
          affectsVariables: [],
          affectedBy: []
        };
        const stringToBeRun = stringToBeParsed;
        while (true) {
          try {
            defs_1.defs.errorMessage = "";
            check_stack();
            if (defs_1.DEBUG) {
              console.log("findDependenciesInScript: scanning");
            }
            n = scan_1.scan(stringToBeParsed.substring(indexOfPartRemainingToBeParsed));
            if (defs_1.DEBUG) {
              console.log("scanned");
            }
            stack_1.pop();
            check_stack();
          } catch (error) {
            if (defs_1.PRINTOUTRESULT) {
              console.log(error);
            }
            defs_1.defs.errorMessage = error + "";
            defs_1.reset_after_error();
            break;
          }
          if (n === 0) {
            break;
          }
          indexOfPartRemainingToBeParsed += n;
        }
        let testableString = "";
        if (defs_1.DEBUG) {
          console.log("all local dependencies ----------------");
        }
        testableString += "All local dependencies: ";
        for (let key in defs_1.defs.symbolsDependencies) {
          const value = defs_1.defs.symbolsDependencies[key];
          if (defs_1.DEBUG) {
            console.log(`variable ${key} depends on: `);
          }
          dependencyInfo.affectsVariables.push(key);
          testableString += " variable " + key + " depends on: ";
          for (let i of Array.from(value)) {
            if (defs_1.DEBUG) {
              console.log(`    ${i}`);
            }
            if (i[0] !== "'") {
              dependencyInfo.affectedBy.push(i);
            }
            testableString += i + ", ";
          }
          testableString += "; ";
        }
        testableString += ". ";
        if (defs_1.DEBUG) {
          console.log("Symbols with reassignments ----------------");
        }
        testableString += "Symbols with reassignments: ";
        for (let key of Array.from(defs_1.defs.symbolsHavingReassignments)) {
          if (dependencyInfo.affectedBy.indexOf(key) === -1) {
            dependencyInfo.affectedBy.push(key);
            testableString += key + ", ";
          }
        }
        testableString += ". ";
        if (defs_1.DEBUG) {
          console.log("Symbols in expressions without assignments ----------------");
        }
        testableString += "Symbols in expressions without assignments: ";
        for (let key of Array.from(defs_1.defs.symbolsInExpressionsWithoutAssignments)) {
          if (dependencyInfo.affectedBy.indexOf(key) === -1) {
            dependencyInfo.affectedBy.push(key);
            testableString += key + ", ";
          }
        }
        testableString += ". ";
        dependencyInfo.affectedBy.push("PATTERN_DEPENDENCY");
        if (defs_1.defs.patternHasBeenFound) {
          dependencyInfo.affectsVariables.push("PATTERN_DEPENDENCY");
          testableString += " - PATTERN_DEPENDENCY inserted - ";
        }
        if (defs_1.DEBUG) {
          console.log("All dependencies recursively ----------------");
        }
        testableString += "All dependencies recursively: ";
        let scriptEvaluation = ["", ""];
        let generatedCode = "";
        let readableSummaryOfGeneratedCode = "";
        if (defs_1.defs.errorMessage === "" && !dontGenerateCode) {
          try {
            allReturnedPlainStrings = "";
            allReturnedLatexStrings = "";
            scriptEvaluation = run(stringToBeParsed, true);
            allReturnedPlainStrings = "";
            allReturnedLatexStrings = "";
          } catch (error2) {
            const error = error2;
            if (defs_1.PRINTOUTRESULT) {
              console.log(error);
            }
            defs_1.defs.errorMessage = error.toString();
            init_1.init();
          }
          if (defs_1.defs.errorMessage === "") {
            for (let key in defs_1.defs.symbolsDependencies) {
              defs_1.defs.codeGen = true;
              if (defs_1.DEBUG) {
                console.log("  variable " + key + " is: " + symbol_1.get_binding(symbol_1.usr_symbol(key)).toString());
              }
              defs_1.defs.codeGen = false;
              if (defs_1.DEBUG) {
                console.log(`  variable ${key} depends on: `);
              }
              testableString += " variable " + key + " depends on: ";
              var recursedDependencies = [];
              const variablesWithCycles = [];
              const cyclesDescriptions = [];
              recursiveDependencies(key, recursedDependencies, [], variablesWithCycles, [], cyclesDescriptions);
              for (let i of Array.from(variablesWithCycles)) {
                if (defs_1.DEBUG) {
                  console.log(`    --> cycle through ${i}`);
                }
              }
              for (let i of Array.from(recursedDependencies)) {
                if (defs_1.DEBUG) {
                  console.log(`    ${i}`);
                }
                testableString += i + ", ";
              }
              testableString += "; ";
              for (let i of Array.from(cyclesDescriptions)) {
                testableString += " " + i + ", ";
              }
              if (defs_1.DEBUG) {
                console.log(`  code generation:${key} is: ${symbol_1.get_binding(symbol_1.usr_symbol(key))}`);
              }
              stack_1.push(symbol_1.get_binding(symbol_1.usr_symbol(key)));
              const replacementsFrom = [];
              const replacementsTo = [];
              for (let eachDependency of Array.from(recursedDependencies)) {
                if (eachDependency[0] === "'") {
                  const deQuotedDep = eachDependency.substring(1);
                  const originalUserSymbol = symbol_1.usr_symbol(deQuotedDep);
                  const newUserSymbol = symbol_1.usr_symbol("AVOID_BINDING_TO_EXTERNAL_SCOPE_VALUE" + deQuotedDep);
                  replacementsFrom.push(originalUserSymbol);
                  replacementsTo.push(newUserSymbol);
                  stack_1.push(subst_1.subst(stack_1.pop(), originalUserSymbol, newUserSymbol));
                  if (defs_1.DEBUG) {
                    console.log(`after substitution: ${stack_1.top()}`);
                  }
                }
              }
              try {
                stack_1.push(simplify_1.simplifyForCodeGeneration(stack_1.pop()));
              } catch (error) {
                if (defs_1.PRINTOUTRESULT) {
                  console.log(error);
                }
                defs_1.defs.errorMessage = error + "";
                init_1.init();
              }
              for (let indexOfEachReplacement = 0; indexOfEachReplacement < replacementsFrom.length; indexOfEachReplacement++) {
                stack_1.push(subst_1.subst(stack_1.pop(), replacementsTo[indexOfEachReplacement], replacementsFrom[indexOfEachReplacement]));
              }
              clear_1.clearRenamedVariablesToAvoidBindingToExternalScope();
              if (defs_1.defs.errorMessage === "") {
                const toBePrinted = stack_1.pop();
                let userVariablesMentioned = [];
                symbol_1.collectUserSymbols(toBePrinted, userVariablesMentioned);
                allReturnedPlainStrings = "";
                allReturnedLatexStrings = "";
                defs_1.defs.codeGen = true;
                const generatedBody = toBePrinted.toString();
                defs_1.defs.codeGen = false;
                const origPrintMode = defs_1.defs.printMode;
                defs_1.defs.printMode = defs_1.PRINTMODE_LATEX;
                const bodyForReadableSummaryOfGeneratedCode = toBePrinted.toString();
                defs_1.defs.printMode = origPrintMode;
                if (variablesWithCycles.indexOf(key) !== -1) {
                  generatedCode += "// " + key + " is part of a cyclic dependency, no code generated.";
                  readableSummaryOfGeneratedCode += "#" + key + " is part of a cyclic dependency, no code generated.";
                } else {
                  userVariablesMentioned = userVariablesMentioned.filter((x) => defs_1.predefinedSymbolsInGlobalScope_doNotTrackInDependencies.indexOf(x + "") === -1);
                  userVariablesMentioned = userVariablesMentioned.filter((x) => recursedDependencies.indexOf(x + "") !== -1 || recursedDependencies.indexOf("'" + x + "") !== -1);
                  if (userVariablesMentioned.length !== 0) {
                    let parameters = "(";
                    for (let i of Array.from(userVariablesMentioned)) {
                      if (i.printname !== key) {
                        parameters += i.printname + ", ";
                      }
                    }
                    parameters = parameters.replace(/, $/gm, "");
                    parameters += ")";
                    generatedCode += key + " = function " + parameters + " { return ( " + generatedBody + " ); }";
                    readableSummaryOfGeneratedCode += key + parameters + " = " + bodyForReadableSummaryOfGeneratedCode;
                  } else {
                    generatedCode += key + " = " + generatedBody + ";";
                    readableSummaryOfGeneratedCode += key + " = " + bodyForReadableSummaryOfGeneratedCode;
                  }
                }
                generatedCode += "\n";
                readableSummaryOfGeneratedCode += "\n";
                if (defs_1.DEBUG) {
                  console.log(`    ${generatedCode}`);
                }
              }
            }
          }
        }
        generatedCode = generatedCode.replace(/\n$/gm, "");
        readableSummaryOfGeneratedCode = readableSummaryOfGeneratedCode.replace(/\n$/gm, "");
        defs_1.defs.symbolsDependencies = {};
        defs_1.defs.symbolsHavingReassignments = [];
        defs_1.defs.patternHasBeenFound = false;
        defs_1.defs.symbolsInExpressionsWithoutAssignments = [];
        if (defs_1.DEBUG) {
          console.log(`testable string: ${testableString}`);
        }
        if (TIMING_DEBUGS) {
          console.log(`findDependenciesInScript time for: ${stringToBeRun} : ${new Date().getTime() - timeStartFromAlgebra}ms`);
        }
        return [
          testableString,
          scriptEvaluation[0],
          generatedCode,
          readableSummaryOfGeneratedCode,
          scriptEvaluation[1],
          defs_1.defs.errorMessage,
          dependencyInfo
        ];
      }
      exports.findDependenciesInScript = findDependenciesInScript;
      function recursiveDependencies(variableToBeChecked, arrayWhereDependenciesWillBeAdded, variablesAlreadyFleshedOut, variablesWithCycles, chainBeingChecked, cyclesDescriptions) {
        variablesAlreadyFleshedOut.push(variableToBeChecked);
        if (defs_1.defs.symbolsDependencies[chainBeingChecked[chainBeingChecked.length - 1]] != null) {
          if (defs_1.defs.symbolsDependencies[chainBeingChecked[chainBeingChecked.length - 1]].indexOf("'" + variableToBeChecked) !== -1) {
            if (defs_1.DEBUG) {
              console.log("can't keep following the chain of " + variableToBeChecked + " because it's actually a variable bound to a parameter");
            }
            if (arrayWhereDependenciesWillBeAdded.indexOf("'" + variableToBeChecked) === -1 && arrayWhereDependenciesWillBeAdded.indexOf(variableToBeChecked) === -1) {
              arrayWhereDependenciesWillBeAdded.push(variableToBeChecked);
            }
            arrayWhereDependenciesWillBeAdded;
            return;
          }
        }
        chainBeingChecked.push(variableToBeChecked);
        if (defs_1.defs.symbolsDependencies[variableToBeChecked] == null) {
          if (arrayWhereDependenciesWillBeAdded.indexOf(variableToBeChecked) === -1) {
            arrayWhereDependenciesWillBeAdded.push(variableToBeChecked);
          }
          arrayWhereDependenciesWillBeAdded;
        } else {
          for (let i of Array.from(defs_1.defs.symbolsDependencies[variableToBeChecked])) {
            if (chainBeingChecked.indexOf(i) !== -1) {
              if (defs_1.DEBUG) {
                console.log("  found cycle:");
              }
              let cyclesDescription = "";
              for (let k of Array.from(chainBeingChecked)) {
                if (variablesWithCycles.indexOf(k) === -1) {
                  variablesWithCycles.push(k);
                }
                if (defs_1.DEBUG) {
                  console.log(k + " --> ");
                }
                cyclesDescription += k + " --> ";
              }
              if (defs_1.DEBUG) {
                console.log(` ... then ${i} again`);
              }
              cyclesDescription += " ... then " + i + " again";
              cyclesDescriptions.push(cyclesDescription);
              if (variablesWithCycles.indexOf(i) === -1) {
                variablesWithCycles.push(i);
              }
            } else {
              recursiveDependencies(i, arrayWhereDependenciesWillBeAdded, variablesAlreadyFleshedOut, variablesWithCycles, chainBeingChecked, cyclesDescriptions);
              chainBeingChecked.pop();
            }
          }
          arrayWhereDependenciesWillBeAdded;
        }
      }
      var latexErrorSign = "\\rlap{\\large\\color{red}\\bigtriangleup}{\\ \\ \\tiny\\color{red}!}";
      function turnErrorMessageToLatex(theErrorMessage) {
        theErrorMessage = theErrorMessage.replace(/\n/g, "");
        theErrorMessage = theErrorMessage.replace(/_/g, "} \\_ \\text{");
        theErrorMessage = theErrorMessage.replace(new RegExp(String.fromCharCode(defs_1.transpose_unicode), "g"), "}{}^{T}\\text{");
        theErrorMessage = theErrorMessage.replace(new RegExp(String.fromCharCode(defs_1.dotprod_unicode), "g"), "}\\cdot \\text{");
        theErrorMessage = theErrorMessage.replace("Stop:", "}  \\quad \\text{Stop:");
        theErrorMessage = theErrorMessage.replace("->", "}  \\rightarrow \\text{");
        theErrorMessage = theErrorMessage.replace("?", "}\\enspace " + latexErrorSign + " \\enspace  \\text{");
        theErrorMessage = "$$\\text{" + theErrorMessage.replace(/\n/g, "") + "}$$";
        return theErrorMessage;
      }
      function normaliseDots(stringToNormalise) {
        stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(8901), "g"), String.fromCharCode(defs_1.dotprod_unicode));
        stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(8226), "g"), String.fromCharCode(defs_1.dotprod_unicode));
        stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(12539), "g"), String.fromCharCode(defs_1.dotprod_unicode));
        stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(55296), "g"), String.fromCharCode(defs_1.dotprod_unicode));
        stringToNormalise = stringToNormalise.replace(new RegExp(String.fromCharCode(65381), "g"), String.fromCharCode(defs_1.dotprod_unicode));
        return stringToNormalise;
      }
      var TIMING_DEBUGS = false;
      function run(stringToBeRun, generateLatex = false) {
        let p1, p2;
        let stringToBeReturned;
        const timeStart = new Date().getTime();
        stringToBeRun = normaliseDots(stringToBeRun);
        if (!defs_1.defs.inited) {
          defs_1.defs.inited = true;
          init_1.init();
        }
        let n = 0;
        let indexOfPartRemainingToBeParsed = 0;
        let allReturnedPlainStrings = "";
        let allReturnedLatexStrings = "";
        let collectedLatexResult;
        let collectedPlainResult;
        while (true) {
          try {
            defs_1.defs.errorMessage = "";
            check_stack();
            n = scan_1.scan(stringToBeRun.substring(indexOfPartRemainingToBeParsed));
            p1 = stack_1.pop();
            check_stack();
          } catch (error) {
            if (defs_1.PRINTOUTRESULT) {
              console.log(error);
            }
            allReturnedPlainStrings += error.message;
            if (generateLatex) {
              const theErrorMessage = turnErrorMessageToLatex(error.message);
              allReturnedLatexStrings += theErrorMessage;
            }
            defs_1.reset_after_error();
            break;
          }
          if (n === 0) {
            break;
          }
          indexOfPartRemainingToBeParsed += n;
          stack_1.push(p1);
          let errorWhileExecution = false;
          try {
            defs_1.defs.stringsEmittedByUserPrintouts = "";
            top_level_eval();
            p2 = stack_1.pop();
            check_stack();
            if (defs_1.isstr(p2)) {
              if (defs_1.DEBUG) {
                console.log(p2.str);
              }
              if (defs_1.DEBUG) {
                console.log("\n");
              }
            }
            if (p2 === defs_1.symbol(defs_1.NIL)) {
              collectedPlainResult = defs_1.defs.stringsEmittedByUserPrintouts;
              if (generateLatex) {
                collectedLatexResult = "$$" + defs_1.defs.stringsEmittedByUserPrintouts + "$$";
              }
            } else {
              collectedPlainResult = print_1.print_expr(p2);
              collectedPlainResult += "\n";
              if (generateLatex) {
                collectedLatexResult = "$$" + print_1.collectLatexStringFromReturnValue(p2) + "$$";
                if (defs_1.DEBUG) {
                  console.log(`collectedLatexResult: ${collectedLatexResult}`);
                }
              }
            }
            allReturnedPlainStrings += collectedPlainResult;
            if (generateLatex) {
              allReturnedLatexStrings += collectedLatexResult;
            }
            if (defs_1.PRINTOUTRESULT) {
              if (defs_1.DEBUG) {
                console.log("printline");
              }
              if (defs_1.DEBUG) {
                console.log(collectedPlainResult);
              }
            }
            if (defs_1.PRINTOUTRESULT) {
              if (defs_1.DEBUG) {
                console.log("display:");
              }
              print2d_1.print2dascii(p2);
            }
            if (generateLatex) {
              allReturnedLatexStrings += "\n";
            }
          } catch (error) {
            errorWhileExecution = true;
            collectedPlainResult = error.message;
            if (generateLatex) {
              collectedLatexResult = turnErrorMessageToLatex(error.message);
            }
            if (defs_1.PRINTOUTRESULT) {
              console.log(collectedPlainResult);
            }
            allReturnedPlainStrings += collectedPlainResult;
            if (collectedPlainResult !== "") {
              allReturnedPlainStrings += "\n";
            }
            if (generateLatex) {
              allReturnedLatexStrings += collectedLatexResult;
              allReturnedLatexStrings += "\n";
            }
            init_1.init();
          }
        }
        if (allReturnedPlainStrings[allReturnedPlainStrings.length - 1] === "\n") {
          allReturnedPlainStrings = allReturnedPlainStrings.substring(0, allReturnedPlainStrings.length - 1);
        }
        if (generateLatex) {
          if (allReturnedLatexStrings[allReturnedLatexStrings.length - 1] === "\n") {
            allReturnedLatexStrings = allReturnedLatexStrings.substring(0, allReturnedLatexStrings.length - 1);
          }
        }
        if (generateLatex) {
          if (defs_1.DEBUG) {
            console.log(`allReturnedLatexStrings: ${allReturnedLatexStrings}`);
          }
          stringToBeReturned = [allReturnedPlainStrings, allReturnedLatexStrings];
        } else {
          stringToBeReturned = allReturnedPlainStrings;
        }
        if (TIMING_DEBUGS) {
          const timingDebugWrite = "run time on: " + stringToBeRun + " : " + (new Date().getTime() - timeStart) + "ms";
          console.log(timingDebugWrite);
        }
        allReturnedPlainStrings = "";
        allReturnedLatexStrings = "";
        return stringToBeReturned;
      }
      exports.run = run;
      function check_stack() {
        if (defs_1.defs.tos !== 0) {
          defs_1.breakpoint;
          stop("stack error");
        }
        if (defs_1.defs.frame !== defs_1.TOS) {
          defs_1.breakpoint;
          stop("frame error");
        }
        if (defs_1.defs.chainOfUserSymbolsNotFunctionsBeingEvaluated.length !== 0) {
          defs_1.breakpoint;
          stop("symbols evaluation still ongoing?");
        }
        if (defs_1.defs.evaluatingAsFloats) {
          defs_1.breakpoint;
          stop("numeric evaluation still ongoing?");
        }
        if (defs_1.defs.evaluatingPolar) {
          defs_1.breakpoint;
          stop("evaluation of polar still ongoing?");
        }
      }
      exports.check_stack = check_stack;
      function top_level_eval() {
        if (defs_1.DEBUG) {
          console.log("#### top level eval");
        }
        defs_1.defs.trigmode = 0;
        const shouldAutoexpand = defs_1.symbol(defs_1.AUTOEXPAND);
        defs_1.defs.expanding = !is_1.isZeroAtomOrTensor(symbol_1.get_binding(shouldAutoexpand));
        const originalArgument = stack_1.top();
        stack_1.push(eval_1.Eval(stack_1.pop()));
        let evalledArgument = stack_1.top();
        if (evalledArgument === defs_1.symbol(defs_1.NIL)) {
          return;
        }
        symbol_1.set_binding(defs_1.symbol(defs_1.LAST), evalledArgument);
        if (!is_1.isZeroAtomOrTensor(symbol_1.get_binding(defs_1.symbol(defs_1.BAKE)))) {
          const baked = bake_1.bake(stack_1.pop());
          evalledArgument = baked;
          stack_1.push(baked);
        }
        if ((originalArgument === defs_1.symbol(defs_1.SYMBOL_I) || originalArgument === defs_1.symbol(defs_1.SYMBOL_J)) && is_1.isimaginaryunit(evalledArgument)) {
          return;
        } else if (is_1.isimaginaryunit(symbol_1.get_binding(defs_1.symbol(defs_1.SYMBOL_J)))) {
          stack_1.push(subst_1.subst(stack_1.pop(), defs_1.Constants.imaginaryunit, defs_1.symbol(defs_1.SYMBOL_J)));
        } else if (is_1.isimaginaryunit(symbol_1.get_binding(defs_1.symbol(defs_1.SYMBOL_I)))) {
          stack_1.push(subst_1.subst(stack_1.pop(), defs_1.Constants.imaginaryunit, defs_1.symbol(defs_1.SYMBOL_I)));
        }
      }
      exports.top_level_eval = top_level_eval;
      function check_esc_flag() {
        if (defs_1.defs.esc_flag) {
          stop("esc key");
        }
      }
      exports.check_esc_flag = check_esc_flag;
      function computeDependenciesFromAlgebra(codeFromAlgebraBlock) {
        let p1, p6;
        if (defs_1.DEBUG) {
          console.log("computeDependenciesFromAlgebra!!!");
        }
        const originalcodeFromAlgebraBlock = codeFromAlgebraBlock;
        const keepState = true;
        defs_1.defs.called_from_Algebra_block = true;
        codeFromAlgebraBlock = normaliseDots(codeFromAlgebraBlock);
        if (!keepState) {
          defs_1.defs.userSimplificationsInListForm = [];
          let userSimplificationsInProgramForm = "";
          for (const i of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            userSimplificationsInProgramForm += "silentpattern(" + defs_1.car(i) + "," + defs_1.car(defs_1.cdr(i)) + "," + defs_1.car(defs_1.cdr(defs_1.cdr(i))) + ")\n";
          }
          [p1, p6] = clear_1.do_clearall();
          codeFromAlgebraBlock = userSimplificationsInProgramForm + codeFromAlgebraBlock;
          if (defs_1.DEBUG) {
            console.log("codeFromAlgebraBlock including patterns: " + codeFromAlgebraBlock);
          }
        }
        if (defs_1.DEBUG) {
          console.log("computeDependenciesFromAlgebra: patterns in the list --------------- ");
          for (const i of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            console.log(defs_1.car(i) + "," + defs_1.cdr(i) + ")");
          }
          console.log("...end of list --------------- ");
        }
        defs_1.defs.called_from_Algebra_block = false;
        return findDependenciesInScript(codeFromAlgebraBlock, true)[6];
      }
      exports.computeDependenciesFromAlgebra = computeDependenciesFromAlgebra;
      function computeResultsAndJavaScriptFromAlgebra(codeFromAlgebraBlock) {
        let p1, p6;
        let code, dependencyInfo, i, latexResult, readableSummaryOfCode, result, testableStringIsIgnoredHere;
        const originalcodeFromAlgebraBlock = codeFromAlgebraBlock;
        const keepState = true;
        defs_1.defs.called_from_Algebra_block = true;
        const timeStartFromAlgebra = new Date().getTime();
        if (TIMING_DEBUGS) {
          console.log(" --------- computeResultsAndJavaScriptFromAlgebra input: " + codeFromAlgebraBlock + " at: " + new Date());
        }
        codeFromAlgebraBlock = normaliseDots(codeFromAlgebraBlock);
        const stringToBeRun = codeFromAlgebraBlock;
        if (defs_1.DEBUG) {
          console.log("computeResultsAndJavaScriptFromAlgebra: patterns in the list --------------- ");
          for (i of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            console.log(defs_1.car(i) + "," + defs_1.cdr(i) + ")");
          }
          console.log("...end of list --------------- ");
        }
        if (!keepState) {
          defs_1.defs.userSimplificationsInListForm = [];
          let userSimplificationsInProgramForm = "";
          for (i of Array.from(defs_1.defs.userSimplificationsInListForm)) {
            userSimplificationsInProgramForm += "silentpattern(" + defs_1.car(i) + "," + defs_1.car(defs_1.cdr(i)) + "," + defs_1.car(defs_1.cdr(defs_1.cdr(i))) + ")\n";
          }
          [p1, p6] = clear_1.do_clearall();
          codeFromAlgebraBlock = userSimplificationsInProgramForm + codeFromAlgebraBlock;
          if (defs_1.DEBUG) {
            console.log("codeFromAlgebraBlock including patterns: " + codeFromAlgebraBlock);
          }
        }
        [
          testableStringIsIgnoredHere,
          result,
          code,
          readableSummaryOfCode,
          latexResult,
          defs_1.defs.errorMessage,
          dependencyInfo
        ] = findDependenciesInScript(codeFromAlgebraBlock);
        defs_1.defs.called_from_Algebra_block = false;
        if (readableSummaryOfCode !== "" || defs_1.defs.errorMessage !== "") {
          result += "\n" + readableSummaryOfCode;
          if (defs_1.defs.errorMessage !== "") {
            result += "\n" + defs_1.defs.errorMessage;
          }
          result = result.replace(/\n/g, "\n\n");
          latexResult += "\n$$" + readableSummaryOfCode + "$$";
          if (defs_1.defs.errorMessage !== "") {
            latexResult += turnErrorMessageToLatex(defs_1.defs.errorMessage);
          }
          latexResult = latexResult.replace(/\n/g, "\n\n");
        }
        latexResult = latexResult.replace(/\n*/, "");
        latexResult = latexResult.replace(/\$\$\$\$\n*/g, "");
        code = code.replace(/Math\./g, "");
        code = code.replace(/\n/g, "\n\n");
        if (TIMING_DEBUGS) {
          console.log("computeResultsAndJavaScriptFromAlgebra time (total time from notebook and back) for: " + stringToBeRun + " : " + (new Date().getTime() - timeStartFromAlgebra) + "ms");
        }
        return {
          code,
          result: latexResult,
          latexResult,
          dependencyInfo
        };
      }
      exports.computeResultsAndJavaScriptFromAlgebra = computeResultsAndJavaScriptFromAlgebra;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/stack.js
  var require_stack = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/stack.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.dupl = exports.swap = exports.restore = exports.save = exports.pop_n_items = exports.pop = exports.top = exports.moveTos = exports.push_all = exports.push = void 0;
      var run_1 = require_run();
      var defs_1 = require_defs();
      var nil_symbols = 0;
      function push(p) {
        if (p == null) {
          defs_1.breakpoint;
        }
        if (p === defs_1.symbol(defs_1.NIL)) {
          nil_symbols++;
          if (defs_1.DEBUG) {
            console.log(`pushing symbol(NIL) #${nil_symbols}`);
          }
        }
        if (defs_1.defs.tos >= defs_1.defs.frame) {
          run_1.stop("stack overflow");
        }
        return defs_1.defs.stack[defs_1.defs.tos++] = p;
      }
      exports.push = push;
      function push_all(items) {
        while (items.length > 0) {
          push(items.shift());
        }
      }
      exports.push_all = push_all;
      function moveTos(stackPos) {
        if (defs_1.defs.tos <= stackPos) {
          defs_1.defs.tos = stackPos;
          return;
        }
        while (defs_1.defs.tos > stackPos) {
          defs_1.defs.stack[defs_1.defs.tos] = null;
          defs_1.defs.tos--;
        }
      }
      exports.moveTos = moveTos;
      function top() {
        return defs_1.defs.stack[defs_1.defs.tos - 1];
      }
      exports.top = top;
      function pop() {
        if (defs_1.defs.tos === 0) {
          defs_1.breakpoint;
          run_1.stop("stack underflow");
        }
        if (top() == null) {
          defs_1.breakpoint;
        }
        const elementToBeReturned = defs_1.defs.stack[--defs_1.defs.tos];
        defs_1.defs.stack[defs_1.defs.tos] = null;
        return elementToBeReturned;
      }
      exports.pop = pop;
      function pop_n_items(n) {
        const items = [];
        for (let i = 0; i < n; i++) {
          items.push(pop());
        }
        return items;
      }
      exports.pop_n_items = pop_n_items;
      function save() {
        let p0, p1, p2, p3, p4, p5, p6, p7, p8, p9;
        defs_1.defs.frame -= 10;
        if (defs_1.defs.frame < defs_1.defs.tos) {
          defs_1.breakpoint;
          run_1.stop("frame overflow, circular reference?");
        }
        defs_1.defs.stack[defs_1.defs.frame + 0] = p0;
        defs_1.defs.stack[defs_1.defs.frame + 1] = p1;
        defs_1.defs.stack[defs_1.defs.frame + 2] = p2;
        defs_1.defs.stack[defs_1.defs.frame + 3] = p3;
        defs_1.defs.stack[defs_1.defs.frame + 4] = p4;
        defs_1.defs.stack[defs_1.defs.frame + 5] = p5;
        defs_1.defs.stack[defs_1.defs.frame + 6] = p6;
        defs_1.defs.stack[defs_1.defs.frame + 7] = p7;
        defs_1.defs.stack[defs_1.defs.frame + 8] = p8;
        defs_1.defs.stack[defs_1.defs.frame + 9] = p9;
      }
      exports.save = save;
      function restore() {
        let p0, p1, p2, p3, p4, p5, p6, p7, p8, p9;
        if (defs_1.defs.frame > defs_1.TOS - 10) {
          run_1.stop("frame underflow");
        }
        p0 = defs_1.defs.stack[defs_1.defs.frame + 0];
        p1 = defs_1.defs.stack[defs_1.defs.frame + 1];
        p2 = defs_1.defs.stack[defs_1.defs.frame + 2];
        p3 = defs_1.defs.stack[defs_1.defs.frame + 3];
        p4 = defs_1.defs.stack[defs_1.defs.frame + 4];
        p5 = defs_1.defs.stack[defs_1.defs.frame + 5];
        p6 = defs_1.defs.stack[defs_1.defs.frame + 6];
        p7 = defs_1.defs.stack[defs_1.defs.frame + 7];
        p8 = defs_1.defs.stack[defs_1.defs.frame + 8];
        p9 = defs_1.defs.stack[defs_1.defs.frame + 9];
        return defs_1.defs.frame += 10;
      }
      exports.restore = restore;
      function swap() {
        const p = pop();
        const q = pop();
        push(p);
        push(q);
      }
      exports.swap = swap;
      function dupl() {
        const p = pop();
        push(p);
        return push(p);
      }
      exports.dupl = dupl;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/defs.js
  var require_defs = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/defs.js"(exports) {
      "use strict";
      var __importDefault = exports && exports.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : { "default": mod };
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.evalFloats = exports.evalPolar = exports.doexpand = exports.noexpand = exports.Constants = exports.$ = exports.reset_after_error = exports.MEQUAL = exports.MZERO = exports.MSIGN = exports.isidentitymatrix = exports.isinv = exports.istranspose = exports.isinnerordot = exports.isfactorial = exports.ispower = exports.ismultiply = exports.isadd = exports.caddaddr = exports.cdddaddr = exports.caddadr = exports.cddaddr = exports.cadaddr = exports.caddddr = exports.cddddr = exports.cadddr = exports.cdaddr = exports.caddar = exports.cadadr = exports.caaddr = exports.cdddr = exports.cddar = exports.cdadr = exports.cadar = exports.caddr = exports.caadr = exports.cddr = exports.cdar = exports.cadr = exports.caar = exports.cdr = exports.car = exports.iskeyword = exports.issymbol = exports.isNumericAtomOrTensor = exports.istensor = exports.isstr = exports.isNumericAtom = exports.isdouble = exports.isrational = exports.iscons = exports.symbol = exports.dotprod_unicode = exports.transpose_unicode = exports.isSymbolReclaimable = exports.binding = exports.symtab = exports.logbuf = exports.mtotal = exports.primetab = exports.parse_time_simplifications = exports.predefinedSymbolsInGlobalScope_doNotTrackInDependencies = exports.MAXDIM = exports.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE = exports.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES = exports.MAXPRIMETAB = exports.TOS = exports.E = exports.C6 = exports.C5 = exports.C4 = exports.C3 = exports.C2 = exports.C1 = exports.SYMBOL_X_UNDERSCORE = exports.SYMBOL_B_UNDERSCORE = exports.SYMBOL_A_UNDERSCORE = exports.SYMBOL_IDENTITY_MATRIX = exports.SYMBOL_Z = exports.SYMBOL_Y = exports.SYMBOL_X = exports.SYMBOL_T = exports.SYMBOL_S = exports.SYMBOL_R = exports.SYMBOL_N = exports.SYMBOL_J = exports.SYMBOL_I = exports.SYMBOL_D = exports.SYMBOL_C = exports.SYMBOL_B = exports.SYMBOL_A = exports.PI = exports.VERSION = exports.SECRETX = exports.METAX = exports.METAB = exports.METAA = exports.DRAWX = exports.YYE = exports.MAX_FIXED_PRINTOUT_DIGITS = exports.FORCE_FIXED_PRINTOUT = exports.TRACE = exports.ASSUME_REAL_VARIABLES = exports.BAKE = exports.AUTOEXPAND = exports.LAST_PLAIN_PRINT = exports.LAST_LIST_PRINT = exports.LAST_LATEX_PRINT = exports.LAST_FULL_PRINT = exports.LAST_2DASCII_PRINT = exports.LAST_PRINT = exports.LAST = exports.NIL = exports.ZERO = exports.UNIT = exports.TRANSPOSE = exports.TESTLT = exports.TESTLE = exports.TESTGT = exports.TESTGE = exports.TESTEQ = exports.TEST = exports.TAYLOR = exports.TANH = exports.TAN = exports.SYMBOLSINFO = exports.SUM = exports.SUBST = exports.STOP = exports.SQRT = exports.SHAPE = exports.SINH = exports.SIN = exports.SIMPLIFY = exports.SILENTPATTERN = exports.SGN = exports.SETQ = exports.ROOTS = exports.YYRECT = exports.ROUND = exports.REAL = exports.RATIONALIZE = exports.RANK = exports.QUOTIENT = exports.QUOTE = exports.PRODUCT = exports.PRINTPLAIN = exports.PRINTLIST = exports.PRINTLATEX = exports.PRINTFULL = exports.PRINT2DASCII = exports.PRINT = exports.PRINT_LEAVE_X_ALONE = exports.PRINT_LEAVE_E_ALONE = exports.PRIME = exports.POWER = exports.POLAR = exports.PATTERNSINFO = exports.PATTERN = exports.OUTER = exports.OR = exports.OPERATOR = exports.NUMERATOR = exports.NUMBER = exports.NROOTS = exports.NOT = exports.MULTIPLY = exports.MOD = exports.LOOKUP = exports.LOG = exports.LEGENDRE = exports.LEADING = exports.LCM = exports.LAGUERRE = exports.ISPRIME = exports.ISINTEGER = exports.INVG = exports.INV = exports.INTEGRAL = exports.INNER = exports.INDEX = exports.IMAG = exports.HILBERT = exports.HERMITE = exports.GCD = exports.GAMMA = exports.FUNCTION = exports.FOR = exports.FLOOR = exports.FLOATF = exports.FILTER = exports.FACTORPOLY = exports.FACTORIAL = exports.FACTOR = exports.EXPSIN = exports.EXPCOS = exports.EXPAND = exports.EXP = exports.EVAL = exports.ERFC = exports.ERF = exports.EIGENVEC = exports.EIGENVAL = exports.EIGEN = exports.DSOLVE = exports.DRAW = exports.DOT = exports.DO = exports.DIVISORS = exports.DIRAC = exports.DIM = exports.DET = exports.DERIVATIVE = exports.DENOMINATOR = exports.DEGREE = exports.DEFINT = exports.DECOMP = exports.COSH = exports.COS = exports.CONTRACT = exports.CONJ = exports.CONDENSE = exports.COFACTOR = exports.COEFF = exports.CLOCK = exports.CLEARPATTERNS = exports.CLEARALL = exports.CLEAR = exports.CIRCEXP = exports.CHOOSE = exports.CHECK = exports.CEILING = exports.BINOMIAL = exports.BINDING = exports.BESSELY = exports.BESSELJ = exports.ATOMIZE = exports.ARG = exports.ARCTANH = exports.ARCTAN = exports.ARCSINH = exports.ARCSIN = exports.ARCCOSH = exports.ARCCOS = exports.APPROXRATIO = exports.AND = exports.ADJ = exports.ADD = exports.ABS = exports.SYM = exports.TENSOR = exports.STR = exports.DOUBLE = exports.NUM = exports.CONS = exports.Sym = exports.Tensor = exports.Str = exports.Double = exports.Num = exports.Cons = exports.BaseAtom = exports.avoidCalculatingPowersIntoArctans = exports.do_simplify_nested_radicals = exports.dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication = exports.defs = exports.PRINTMODE_LIST = exports.PRINTMODE_HUMAN = exports.PRINTMODE_COMPUTER = exports.PRINTMODE_2DASCII = exports.PRINTMODE_LATEX = exports.PRINTOUTRESULT = exports.DEBUG = exports.NSYM = exports.version = exports.breakpoint = void 0;
      var big_integer_1 = __importDefault(require_BigInteger());
      var stack_1 = require_stack();
      var print_1 = require_print();
      var symbol_1 = require_symbol();
      function breakpoint() {
      }
      exports.breakpoint = breakpoint;
      exports.version = "1.3.1";
      exports.NSYM = 1e3;
      exports.DEBUG = false;
      exports.PRINTOUTRESULT = false;
      exports.PRINTMODE_LATEX = "PRINTMODE_LATEX";
      exports.PRINTMODE_2DASCII = "PRINTMODE_2DASCII";
      exports.PRINTMODE_COMPUTER = "PRINTMODE_COMPUTER";
      exports.PRINTMODE_HUMAN = "PRINTMODE_HUMAN";
      exports.PRINTMODE_LIST = "PRINTMODE_LIST";
      var Defs = class {
        constructor() {
          this.printMode = exports.PRINTMODE_COMPUTER;
          this.recursionLevelNestedRadicalsRemoval = 0;
          this.errorMessage = "";
          this.symbolsDependencies = {};
          this.symbolsHavingReassignments = [];
          this.symbolsInExpressionsWithoutAssignments = [];
          this.patternHasBeenFound = false;
          this.inited = false;
          this.chainOfUserSymbolsNotFunctionsBeingEvaluated = [];
          this.stringsEmittedByUserPrintouts = "";
          this.called_from_Algebra_block = false;
          this.tos = 0;
          this.expanding = false;
          this.evaluatingAsFloats = false;
          this.evaluatingPolar = false;
          this.esc_flag = false;
          this.trigmode = 0;
          this.stack = [];
          this.frame = 0;
          this.out_count = 0;
          this.test_flag = false;
          this.codeGen = false;
          this.userSimplificationsInListForm = [];
          this.userSimplificationsInStringForm = [];
          this.fullDoubleOutput = false;
        }
      };
      exports.defs = new Defs();
      exports.dontCreateNewRadicalsInDenominatorWhenEvalingMultiplication = true;
      exports.do_simplify_nested_radicals = true;
      exports.avoidCalculatingPowersIntoArctans = true;
      var BaseAtom = class {
        toString() {
          return print_1.print_expr(this);
        }
        toLatexString() {
          return print_1.collectLatexStringFromReturnValue(this);
        }
      };
      exports.BaseAtom = BaseAtom;
      var Cons = class extends BaseAtom {
        constructor(car2, cdr2) {
          super();
          this.k = exports.CONS;
          this.cons = { car: car2, cdr: cdr2 };
        }
        *[Symbol.iterator]() {
          let u = this;
          while (iscons(u)) {
            yield car(u);
            u = cdr(u);
          }
        }
        tail() {
          if (iscons(this.cons.cdr)) {
            return [...this.cons.cdr];
          }
          return [];
        }
        map(f) {
          const a = car(this);
          let b = cdr(this);
          if (iscons(b)) {
            b = b.map(f);
          }
          return new Cons(f(a), b);
        }
      };
      exports.Cons = Cons;
      var Num = class extends BaseAtom {
        constructor(a, b = big_integer_1.default.one) {
          super();
          this.a = a;
          this.b = b;
          this.q = this;
          this.k = exports.NUM;
        }
      };
      exports.Num = Num;
      var Double = class extends BaseAtom {
        constructor(d) {
          super();
          this.d = d;
          this.k = exports.DOUBLE;
        }
      };
      exports.Double = Double;
      var Str = class extends BaseAtom {
        constructor(str) {
          super();
          this.str = str;
          this.k = exports.STR;
        }
      };
      exports.Str = Str;
      var Tensor = class extends BaseAtom {
        constructor() {
          super(...arguments);
          this.tensor = this;
          this.k = exports.TENSOR;
          this.ndim = 0;
          this.dim = [];
          this.elem = [];
        }
        get nelem() {
          return this.elem.length;
        }
      };
      exports.Tensor = Tensor;
      var Sym = class extends BaseAtom {
        constructor(printname) {
          super();
          this.printname = printname;
          this.k = exports.SYM;
        }
      };
      exports.Sym = Sym;
      exports.CONS = 0;
      exports.NUM = 1;
      exports.DOUBLE = 2;
      exports.STR = 3;
      exports.TENSOR = 4;
      exports.SYM = 5;
      var counter = 0;
      exports.ABS = counter++;
      exports.ADD = counter++;
      exports.ADJ = counter++;
      exports.AND = counter++;
      exports.APPROXRATIO = counter++;
      exports.ARCCOS = counter++;
      exports.ARCCOSH = counter++;
      exports.ARCSIN = counter++;
      exports.ARCSINH = counter++;
      exports.ARCTAN = counter++;
      exports.ARCTANH = counter++;
      exports.ARG = counter++;
      exports.ATOMIZE = counter++;
      exports.BESSELJ = counter++;
      exports.BESSELY = counter++;
      exports.BINDING = counter++;
      exports.BINOMIAL = counter++;
      exports.CEILING = counter++;
      exports.CHECK = counter++;
      exports.CHOOSE = counter++;
      exports.CIRCEXP = counter++;
      exports.CLEAR = counter++;
      exports.CLEARALL = counter++;
      exports.CLEARPATTERNS = counter++;
      exports.CLOCK = counter++;
      exports.COEFF = counter++;
      exports.COFACTOR = counter++;
      exports.CONDENSE = counter++;
      exports.CONJ = counter++;
      exports.CONTRACT = counter++;
      exports.COS = counter++;
      exports.COSH = counter++;
      exports.DECOMP = counter++;
      exports.DEFINT = counter++;
      exports.DEGREE = counter++;
      exports.DENOMINATOR = counter++;
      exports.DERIVATIVE = counter++;
      exports.DET = counter++;
      exports.DIM = counter++;
      exports.DIRAC = counter++;
      exports.DIVISORS = counter++;
      exports.DO = counter++;
      exports.DOT = counter++;
      exports.DRAW = counter++;
      exports.DSOLVE = counter++;
      exports.EIGEN = counter++;
      exports.EIGENVAL = counter++;
      exports.EIGENVEC = counter++;
      exports.ERF = counter++;
      exports.ERFC = counter++;
      exports.EVAL = counter++;
      exports.EXP = counter++;
      exports.EXPAND = counter++;
      exports.EXPCOS = counter++;
      exports.EXPSIN = counter++;
      exports.FACTOR = counter++;
      exports.FACTORIAL = counter++;
      exports.FACTORPOLY = counter++;
      exports.FILTER = counter++;
      exports.FLOATF = counter++;
      exports.FLOOR = counter++;
      exports.FOR = counter++;
      exports.FUNCTION = counter++;
      exports.GAMMA = counter++;
      exports.GCD = counter++;
      exports.HERMITE = counter++;
      exports.HILBERT = counter++;
      exports.IMAG = counter++;
      exports.INDEX = counter++;
      exports.INNER = counter++;
      exports.INTEGRAL = counter++;
      exports.INV = counter++;
      exports.INVG = counter++;
      exports.ISINTEGER = counter++;
      exports.ISPRIME = counter++;
      exports.LAGUERRE = counter++;
      exports.LCM = counter++;
      exports.LEADING = counter++;
      exports.LEGENDRE = counter++;
      exports.LOG = counter++;
      exports.LOOKUP = counter++;
      exports.MOD = counter++;
      exports.MULTIPLY = counter++;
      exports.NOT = counter++;
      exports.NROOTS = counter++;
      exports.NUMBER = counter++;
      exports.NUMERATOR = counter++;
      exports.OPERATOR = counter++;
      exports.OR = counter++;
      exports.OUTER = counter++;
      exports.PATTERN = counter++;
      exports.PATTERNSINFO = counter++;
      exports.POLAR = counter++;
      exports.POWER = counter++;
      exports.PRIME = counter++;
      exports.PRINT_LEAVE_E_ALONE = counter++;
      exports.PRINT_LEAVE_X_ALONE = counter++;
      exports.PRINT = counter++;
      exports.PRINT2DASCII = counter++;
      exports.PRINTFULL = counter++;
      exports.PRINTLATEX = counter++;
      exports.PRINTLIST = counter++;
      exports.PRINTPLAIN = counter++;
      exports.PRODUCT = counter++;
      exports.QUOTE = counter++;
      exports.QUOTIENT = counter++;
      exports.RANK = counter++;
      exports.RATIONALIZE = counter++;
      exports.REAL = counter++;
      exports.ROUND = counter++;
      exports.YYRECT = counter++;
      exports.ROOTS = counter++;
      exports.SETQ = counter++;
      exports.SGN = counter++;
      exports.SILENTPATTERN = counter++;
      exports.SIMPLIFY = counter++;
      exports.SIN = counter++;
      exports.SINH = counter++;
      exports.SHAPE = counter++;
      exports.SQRT = counter++;
      exports.STOP = counter++;
      exports.SUBST = counter++;
      exports.SUM = counter++;
      exports.SYMBOLSINFO = counter++;
      exports.TAN = counter++;
      exports.TANH = counter++;
      exports.TAYLOR = counter++;
      exports.TEST = counter++;
      exports.TESTEQ = counter++;
      exports.TESTGE = counter++;
      exports.TESTGT = counter++;
      exports.TESTLE = counter++;
      exports.TESTLT = counter++;
      exports.TRANSPOSE = counter++;
      exports.UNIT = counter++;
      exports.ZERO = counter++;
      exports.NIL = counter++;
      exports.LAST = counter++;
      exports.LAST_PRINT = counter++;
      exports.LAST_2DASCII_PRINT = counter++;
      exports.LAST_FULL_PRINT = counter++;
      exports.LAST_LATEX_PRINT = counter++;
      exports.LAST_LIST_PRINT = counter++;
      exports.LAST_PLAIN_PRINT = counter++;
      exports.AUTOEXPAND = counter++;
      exports.BAKE = counter++;
      exports.ASSUME_REAL_VARIABLES = counter++;
      exports.TRACE = counter++;
      exports.FORCE_FIXED_PRINTOUT = counter++;
      exports.MAX_FIXED_PRINTOUT_DIGITS = counter++;
      exports.YYE = counter++;
      exports.DRAWX = counter++;
      exports.METAA = counter++;
      exports.METAB = counter++;
      exports.METAX = counter++;
      exports.SECRETX = counter++;
      exports.VERSION = counter++;
      exports.PI = counter++;
      exports.SYMBOL_A = counter++;
      exports.SYMBOL_B = counter++;
      exports.SYMBOL_C = counter++;
      exports.SYMBOL_D = counter++;
      exports.SYMBOL_I = counter++;
      exports.SYMBOL_J = counter++;
      exports.SYMBOL_N = counter++;
      exports.SYMBOL_R = counter++;
      exports.SYMBOL_S = counter++;
      exports.SYMBOL_T = counter++;
      exports.SYMBOL_X = counter++;
      exports.SYMBOL_Y = counter++;
      exports.SYMBOL_Z = counter++;
      exports.SYMBOL_IDENTITY_MATRIX = counter++;
      exports.SYMBOL_A_UNDERSCORE = counter++;
      exports.SYMBOL_B_UNDERSCORE = counter++;
      exports.SYMBOL_X_UNDERSCORE = counter++;
      exports.C1 = counter++;
      exports.C2 = counter++;
      exports.C3 = counter++;
      exports.C4 = counter++;
      exports.C5 = counter++;
      exports.C6 = counter++;
      var USR_SYMBOLS = counter++;
      exports.E = exports.YYE;
      exports.TOS = 1e5;
      exports.MAXPRIMETAB = 1e4;
      exports.MAX_CONSECUTIVE_APPLICATIONS_OF_ALL_RULES = 5;
      exports.MAX_CONSECUTIVE_APPLICATIONS_OF_SINGLE_RULE = 10;
      exports.MAXDIM = 24;
      exports.predefinedSymbolsInGlobalScope_doNotTrackInDependencies = [
        "rationalize",
        "abs",
        "e",
        "i",
        "pi",
        "sin",
        "ceiling",
        "cos",
        "roots",
        "integral",
        "derivative",
        "defint",
        "sqrt",
        "eig",
        "cov",
        "deig",
        "dcov",
        "float",
        "floor",
        "product",
        "root",
        "round",
        "sum",
        "test",
        "unit"
      ];
      exports.parse_time_simplifications = true;
      exports.primetab = function() {
        const primes = [2];
        let i = 3;
        while (primes.length < exports.MAXPRIMETAB) {
          let j = 0;
          const ceil = Math.sqrt(i);
          while (j < primes.length && primes[j] <= ceil) {
            if (i % primes[j] === 0) {
              j = -1;
              break;
            }
            j++;
          }
          if (j !== -1) {
            primes.push(i);
          }
          i += 2;
        }
        primes[exports.MAXPRIMETAB] = 0;
        return primes;
      }();
      var draw_flag = false;
      exports.mtotal = 0;
      exports.logbuf = "";
      exports.symtab = [];
      exports.binding = [];
      exports.isSymbolReclaimable = [];
      exports.transpose_unicode = 7488;
      exports.dotprod_unicode = 183;
      function symbol(x) {
        return exports.symtab[x];
      }
      exports.symbol = symbol;
      function iscons(p) {
        return p.k === exports.CONS;
      }
      exports.iscons = iscons;
      function isrational(p) {
        return p.k === exports.NUM;
      }
      exports.isrational = isrational;
      function isdouble(p) {
        return p.k === exports.DOUBLE;
      }
      exports.isdouble = isdouble;
      function isNumericAtom(p) {
        return isrational(p) || isdouble(p);
      }
      exports.isNumericAtom = isNumericAtom;
      function isstr(p) {
        return p.k === exports.STR;
      }
      exports.isstr = isstr;
      function istensor(p) {
        return p.k === exports.TENSOR;
      }
      exports.istensor = istensor;
      function isNumericAtomOrTensor(p) {
        if (isNumericAtom(p) || p === symbol(exports.SYMBOL_IDENTITY_MATRIX)) {
          return true;
        }
        if (!istensor(p)) {
          return false;
        }
        const n = p.tensor.nelem;
        const a = p.tensor.elem;
        for (let i = 0; i < n; i++) {
          if (!isNumericAtomOrTensor(a[i])) {
            return false;
          }
        }
        return true;
      }
      exports.isNumericAtomOrTensor = isNumericAtomOrTensor;
      function issymbol(p) {
        return p.k === exports.SYM;
      }
      exports.issymbol = issymbol;
      function iskeyword(p) {
        return issymbol(p) && symbol_1.symnum(p) < exports.NIL;
      }
      exports.iskeyword = iskeyword;
      function car(p) {
        if (iscons(p)) {
          return p.cons.car;
        } else {
          return symbol(exports.NIL);
        }
      }
      exports.car = car;
      function cdr(p) {
        if (iscons(p)) {
          return p.cons.cdr;
        } else {
          return symbol(exports.NIL);
        }
      }
      exports.cdr = cdr;
      function caar(p) {
        return car(car(p));
      }
      exports.caar = caar;
      function cadr(p) {
        return car(cdr(p));
      }
      exports.cadr = cadr;
      function cdar(p) {
        return cdr(car(p));
      }
      exports.cdar = cdar;
      function cddr(p) {
        return cdr(cdr(p));
      }
      exports.cddr = cddr;
      function caadr(p) {
        return car(car(cdr(p)));
      }
      exports.caadr = caadr;
      function caddr(p) {
        return car(cdr(cdr(p)));
      }
      exports.caddr = caddr;
      function cadar(p) {
        return car(cdr(car(p)));
      }
      exports.cadar = cadar;
      function cdadr(p) {
        return cdr(car(cdr(p)));
      }
      exports.cdadr = cdadr;
      function cddar(p) {
        return cdr(cdr(car(p)));
      }
      exports.cddar = cddar;
      function cdddr(p) {
        return cdr(cdr(cdr(p)));
      }
      exports.cdddr = cdddr;
      function caaddr(p) {
        return car(car(cdr(cdr(p))));
      }
      exports.caaddr = caaddr;
      function cadadr(p) {
        return car(cdr(car(cdr(p))));
      }
      exports.cadadr = cadadr;
      function caddar(p) {
        return car(cdr(cdr(car(p))));
      }
      exports.caddar = caddar;
      function cdaddr(p) {
        return cdr(car(cdr(cdr(p))));
      }
      exports.cdaddr = cdaddr;
      function cadddr(p) {
        return car(cdr(cdr(cdr(p))));
      }
      exports.cadddr = cadddr;
      function cddddr(p) {
        return cdr(cdr(cdr(cdr(p))));
      }
      exports.cddddr = cddddr;
      function caddddr(p) {
        return car(cdr(cdr(cdr(cdr(p)))));
      }
      exports.caddddr = caddddr;
      function cadaddr(p) {
        return car(cdr(car(cdr(cdr(p)))));
      }
      exports.cadaddr = cadaddr;
      function cddaddr(p) {
        return cdr(cdr(car(cdr(cdr(p)))));
      }
      exports.cddaddr = cddaddr;
      function caddadr(p) {
        return car(cdr(cdr(car(cdr(p)))));
      }
      exports.caddadr = caddadr;
      function cdddaddr(p) {
        return cdr(cdr(cdr(car(cdr(cdr(p))))));
      }
      exports.cdddaddr = cdddaddr;
      function caddaddr(p) {
        return car(cdr(cdr(car(cdr(cdr(p))))));
      }
      exports.caddaddr = caddaddr;
      function isadd(p) {
        return car(p) === symbol(exports.ADD);
      }
      exports.isadd = isadd;
      function ismultiply(p) {
        return car(p) === symbol(exports.MULTIPLY);
      }
      exports.ismultiply = ismultiply;
      function ispower(p) {
        return car(p) === symbol(exports.POWER);
      }
      exports.ispower = ispower;
      function isfactorial(p) {
        return car(p) === symbol(exports.FACTORIAL);
      }
      exports.isfactorial = isfactorial;
      function isinnerordot(p) {
        return car(p) === symbol(exports.INNER) || car(p) === symbol(exports.DOT);
      }
      exports.isinnerordot = isinnerordot;
      function istranspose(p) {
        return car(p) === symbol(exports.TRANSPOSE);
      }
      exports.istranspose = istranspose;
      function isinv(p) {
        return car(p) === symbol(exports.INV);
      }
      exports.isinv = isinv;
      function isidentitymatrix(p) {
        return p === symbol(exports.SYMBOL_IDENTITY_MATRIX);
      }
      exports.isidentitymatrix = isidentitymatrix;
      function MSIGN(p) {
        if (p.isPositive()) {
          return 1;
        } else if (p.isZero()) {
          return 0;
        } else {
          return -1;
        }
      }
      exports.MSIGN = MSIGN;
      function MZERO(p) {
        return p.isZero();
      }
      exports.MZERO = MZERO;
      function MEQUAL(p, n) {
        if (p == null) {
          breakpoint;
        }
        return p.equals(n);
      }
      exports.MEQUAL = MEQUAL;
      function reset_after_error() {
        stack_1.moveTos(0);
        exports.defs.esc_flag = false;
        draw_flag = false;
        exports.defs.frame = exports.TOS;
        exports.defs.evaluatingAsFloats = false;
        exports.defs.evaluatingPolar = false;
      }
      exports.reset_after_error = reset_after_error;
      exports.$ = {};
      var Constants = class {
        static One() {
          return exports.defs.evaluatingAsFloats ? Constants.oneAsDouble : Constants.one;
        }
        static NegOne() {
          return exports.defs.evaluatingAsFloats ? Constants.negOneAsDouble : Constants.negOne;
        }
        static Zero() {
          return exports.defs.evaluatingAsFloats ? Constants.zeroAsDouble : Constants.zero;
        }
        static Pi() {
          return exports.defs.evaluatingAsFloats ? Constants.piAsDouble : symbol(exports.PI);
        }
      };
      exports.Constants = Constants;
      Constants.one = new Num(big_integer_1.default(1));
      Constants.oneAsDouble = new Double(1);
      Constants.negOne = new Num(big_integer_1.default(-1));
      Constants.negOneAsDouble = new Double(-1);
      Constants.zero = new Num(big_integer_1.default(0));
      Constants.zeroAsDouble = new Double(0);
      Constants.piAsDouble = new Double(Math.PI);
      function noexpand(func, ...args) {
        const prev_expanding = exports.defs.expanding;
        exports.defs.expanding = false;
        try {
          return func(...args);
        } finally {
          exports.defs.expanding = prev_expanding;
        }
      }
      exports.noexpand = noexpand;
      function doexpand(func, ...args) {
        const prev_expanding = exports.defs.expanding;
        exports.defs.expanding = true;
        try {
          return func(...args);
        } finally {
          exports.defs.expanding = prev_expanding;
        }
      }
      exports.doexpand = doexpand;
      function evalPolar(func, ...args) {
        const prev_evaluatingPolar = exports.defs.evaluatingPolar;
        exports.defs.evaluatingPolar = true;
        try {
          return func(...args);
        } finally {
          exports.defs.evaluatingPolar = prev_evaluatingPolar;
        }
      }
      exports.evalPolar = evalPolar;
      function evalFloats(func, ...args) {
        const prev_evaluatingAsFloats = exports.defs.evaluatingAsFloats;
        exports.defs.evaluatingAsFloats = true;
        try {
          return func(...args);
        } finally {
          exports.defs.evaluatingAsFloats = prev_evaluatingAsFloats;
        }
      }
      exports.evalFloats = evalFloats;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/runtime/zombocom.js
  var require_zombocom = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/runtime/zombocom.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.exec = exports.parse = void 0;
      var run_1 = require_run();
      var stack_1 = require_stack();
      var bignum_1 = require_bignum();
      var list_1 = require_list();
      var scan_1 = require_scan();
      var defs_1 = require_defs();
      var init_1 = require_init();
      var symbol_1 = require_symbol();
      if (!defs_1.defs.inited) {
        defs_1.defs.inited = true;
        init_1.init();
      }
      function parse_internal(argu) {
        if (typeof argu === "string") {
          scan_1.scan(argu);
        } else if (typeof argu === "number") {
          if (argu % 1 === 0) {
            bignum_1.push_integer(argu);
          } else {
            bignum_1.push_double(argu);
          }
        } else if (argu instanceof defs_1.BaseAtom) {
          stack_1.push(argu);
        } else {
          console.warn("unknown argument type", argu);
          stack_1.push(defs_1.symbol(defs_1.NIL));
        }
      }
      function parse(argu) {
        let data;
        try {
          parse_internal(argu);
          data = stack_1.pop();
          run_1.check_stack();
        } catch (error) {
          defs_1.reset_after_error();
          throw error;
        }
        return data;
      }
      exports.parse = parse;
      function exec(name, ...argus) {
        let result;
        const fn = symbol_1.get_binding(symbol_1.usr_symbol(name));
        run_1.check_stack();
        stack_1.push(fn);
        for (let argu of Array.from(argus)) {
          parse_internal(argu);
        }
        list_1.list(1 + argus.length);
        const p1 = stack_1.pop();
        stack_1.push(p1);
        try {
          run_1.top_level_eval();
          result = stack_1.pop();
          run_1.check_stack();
        } catch (error) {
          defs_1.reset_after_error();
          throw error;
        }
        return result;
      }
      exports.exec = exec;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/index.js
  var require_bin = __commonJS({
    "bazel-out/darwin_arm64-fastbuild/bin/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var defs_1 = require_defs();
      var find_1 = require_find();
      var init_1 = require_init();
      var stack_1 = require_stack();
      var symbol_1 = require_symbol();
      var zombocom_1 = require_zombocom();
      var is_1 = require_is();
      var misc_1 = require_misc();
      var scan_1 = require_scan();
      var approxratio_1 = require_approxratio();
      var integral_1 = require_integral();
      var run_1 = require_run();
      var $ = {};
      $.version = defs_1.version;
      $.isadd = defs_1.isadd;
      $.ismultiply = defs_1.ismultiply;
      $.ispower = defs_1.ispower;
      $.isfactorial = defs_1.isfactorial;
      $.car = defs_1.car;
      $.cdr = defs_1.cdr;
      $.caar = defs_1.caar;
      $.cadr = defs_1.cadr;
      $.cdar = defs_1.cdar;
      $.cddr = defs_1.cddr;
      $.caadr = defs_1.caadr;
      $.caddr = defs_1.caddr;
      $.cadar = defs_1.cadar;
      $.cdadr = defs_1.cdadr;
      $.cddar = defs_1.cddar;
      $.cdddr = defs_1.cdddr;
      $.caaddr = defs_1.caaddr;
      $.cadadr = defs_1.cadadr;
      $.caddar = defs_1.caddar;
      $.cdaddr = defs_1.cdaddr;
      $.cadddr = defs_1.cadddr;
      $.cddddr = defs_1.cddddr;
      $.caddddr = defs_1.caddddr;
      $.cadaddr = defs_1.cadaddr;
      $.cddaddr = defs_1.cddaddr;
      $.caddadr = defs_1.caddadr;
      $.cdddaddr = defs_1.cdddaddr;
      $.caddaddr = defs_1.caddaddr;
      $.symbol = defs_1.symbol;
      $.iscons = defs_1.iscons;
      $.isrational = defs_1.isrational;
      $.isdouble = defs_1.isdouble;
      $.isNumericAtom = defs_1.isNumericAtom;
      $.isstr = defs_1.isstr;
      $.istensor = defs_1.istensor;
      $.issymbol = defs_1.issymbol;
      $.iskeyword = defs_1.iskeyword;
      $.CONS = defs_1.CONS;
      $.NUM = defs_1.NUM;
      $.DOUBLE = defs_1.DOUBLE;
      $.STR = defs_1.STR;
      $.TENSOR = defs_1.TENSOR;
      $.SYM = defs_1.SYM;
      $.approxRadicals = approxratio_1.approxRadicals;
      $.approxRationalsOfLogs = approxratio_1.approxRationalsOfLogs;
      $.approxAll = approxratio_1.approxAll;
      $.testApprox = approxratio_1.testApprox;
      $.make_hashed_itab = integral_1.make_hashed_itab;
      $.isZeroAtomOrTensor = is_1.isZeroAtomOrTensor;
      $.isnegativenumber = is_1.isnegativenumber;
      $.isplusone = is_1.isplusone;
      $.isminusone = is_1.isminusone;
      $.isinteger = is_1.isinteger;
      $.isnonnegativeinteger = is_1.isnonnegativeinteger;
      $.isposint = is_1.isposint;
      $.isnegativeterm = is_1.isnegativeterm;
      $.isimaginarynumber = is_1.isimaginarynumber;
      $.iscomplexnumber = is_1.iscomplexnumber;
      $.iseveninteger = is_1.iseveninteger;
      $.isnegative = is_1.isnegative;
      $.issymbolic = is_1.issymbolic;
      $.isintegerfactor = is_1.isintegerfactor;
      $.isoneover = is_1.isoneover;
      $.isfraction = is_1.isfraction;
      $.isoneoversqrttwo = is_1.isoneoversqrttwo;
      $.isminusoneoversqrttwo = is_1.isminusoneoversqrttwo;
      $.isfloating = is_1.isfloating;
      $.isimaginaryunit = is_1.isimaginaryunit;
      $.isquarterturn = is_1.isquarterturn;
      $.isnpi = is_1.isnpi;
      $.equal = misc_1.equal;
      $.length = misc_1.length;
      $.scan = scan_1.scan;
      $.Find = find_1.Find;
      $.dupl = stack_1.dupl;
      $.swap = stack_1.swap;
      $.restore = stack_1.restore;
      $.save = stack_1.save;
      $.push = stack_1.push;
      $.pop = stack_1.pop;
      $.get_binding = symbol_1.get_binding;
      $.set_binding = symbol_1.set_binding;
      $.usr_symbol = symbol_1.usr_symbol;
      $.collectUserSymbols = symbol_1.collectUserSymbols;
      $.init = init_1.init;
      $.exec = zombocom_1.exec;
      $.parse = zombocom_1.parse;
      $.run = run_1.run;
      var builtin_fns = [
        "abs",
        "add",
        "adj",
        "and",
        "approxratio",
        "arccos",
        "arccosh",
        "arcsin",
        "arcsinh",
        "arctan",
        "arctanh",
        "arg",
        "atomize",
        "besselj",
        "bessely",
        "binding",
        "binomial",
        "ceiling",
        "check",
        "choose",
        "circexp",
        "clear",
        "clearall",
        "clearpatterns",
        "clock",
        "coeff",
        "cofactor",
        "condense",
        "conj",
        "contract",
        "cos",
        "cosh",
        "decomp",
        "defint",
        "deg",
        "denominator",
        "det",
        "derivative",
        "dim",
        "dirac",
        "divisors",
        "do",
        "dot",
        "draw",
        "dsolve",
        "eigen",
        "eigenval",
        "eigenvec",
        "erf",
        "erfc",
        "eval",
        "exp",
        "expand",
        "expcos",
        "expsin",
        "factor",
        "factorial",
        "factorpoly",
        "filter",
        "float",
        "floor",
        "for",
        "Gamma",
        "gcd",
        "hermite",
        "hilbert",
        "imag",
        "component",
        "inner",
        "integral",
        "inv",
        "invg",
        "isinteger",
        "isprime",
        "laguerre",
        "lcm",
        "leading",
        "legendre",
        "log",
        "mod",
        "multiply",
        "not",
        "nroots",
        "number",
        "numerator",
        "operator",
        "or",
        "outer",
        "pattern",
        "patternsinfo",
        "polar",
        "power",
        "prime",
        "print",
        "print2dascii",
        "printcomputer",
        "printlatex",
        "printlist",
        "printhuman",
        "product",
        "quote",
        "quotient",
        "rank",
        "rationalize",
        "real",
        "rect",
        "roots",
        "round",
        "equals",
        "shape",
        "sgn",
        "silentpattern",
        "simplify",
        "sin",
        "sinh",
        "sqrt",
        "stop",
        "subst",
        "sum",
        "symbolsinfo",
        "tan",
        "tanh",
        "taylor",
        "test",
        "testeq",
        "testge",
        "testgt",
        "testle",
        "testlt",
        "transpose",
        "unit",
        "zero"
      ];
      Array.from(builtin_fns).map((fn) => $[fn] = zombocom_1.exec.bind(exports, fn));
      exports.default = $;
    }
  });

  // bazel-out/darwin_arm64-fastbuild/bin/sources/browser_main.js
  var import__ = __toModule(require_bin());
  globalThis.Algebrite = import__.default;
})();
//# sourceMappingURL=algebrite.bundle-for-browser.js.map
