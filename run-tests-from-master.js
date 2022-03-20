"use strict";


var runtime_run = require("./runtime/run");
var runtime_zombocom = require("./runtime/zombocom");


var do_clearall_module  = require("./sources/clear");
var do_clearall = do_clearall_module.do_clearall;

var computeDependenciesFromAlgebra = runtime_run.computeDependenciesFromAlgebra;
var computeResultsAndJavaScriptFromAlgebra = runtime_run.computeResultsAndJavaScriptFromAlgebra;
var findDependenciesInScript = runtime_run.findDependenciesInScript;
var run = runtime_run.run;

var bignum_module  = require("./sources/bignum");
var mint = bignum_module.mint;
var setSignTo = bignum_module.setSignTo;
var push_integer = bignum_module.push_integer;
var pop_integer = bignum_module.pop_integer;
var integer = bignum_module.integer;
var madd_module  = require("./sources/madd");
var madd = madd_module.madd;
var msub = madd_module.msub;
var mcmp_module  = require("./runtime/mcmp");
var mcmp = mcmp_module.mcmp;
var mmul_module  = require("./sources/mmul");
var mmul = mmul_module.mmul;
var mdiv = mmul_module.mdiv;
var mmod = mmul_module.mmod;
var mprime_module  = require("./sources/mprime");
var mprime = mprime_module.mprime;
var defs_module  = require("./runtime/defs");
var primetab = defs_module.primetab;
var MZERO = defs_module.MZERO;
var MSIGN = defs_module.MSIGN;
var tos = defs_module.tos;
var mgcd_module  = require("./sources/mgcd");
var mgcd = mgcd_module.mgcd;
var mpow_module  = require("./sources/mpow");
var mpow = mpow_module.mpow;
var mroot_module  = require("./sources/mroot");
var mroot = mroot_module.mroot;
var quickfactor_module  = require("./sources/quickfactor");
var quickfactor = quickfactor_module.quickfactor;
var quickpower = quickfactor_module.quickpower;
var multiply_module  = require("./sources/multiply");
var multiply_all = multiply_module.multiply_all;
var misc_module  = require("./sources/misc");
var equal = misc_module.equal;



var ko_tests, logout, ok_tests, run_test;

var DEBUG = false;
var mtotal = 0;

ok_tests = 0;

ko_tests = 0;

logout = function(s) {
  return console.log(s);
};

run_test = function(s) {
  var error, i, j, out_count, ref, resultFromRun, t, test_flag;
  i = 0;
  t = "";
  test_flag = 1;
  run("clearall");
  run("e=quote(e)");
  for (i = j = 0, ref = s.length; j < ref; i = j += 2) {
    console.log("starting example: " + s[i]);
    //alert("starting example: " + s[i])
    // document.write("starting example: " + s[i] )
    out_count = 0;
    try {
      resultFromRun = run(s[i]);
    } catch (error1) {
      error = error1;
      console.log(error);
      init();
    }
    if (resultFromRun === s[i + 1]) {
      // document.write(" ...ok</br>")
      console.log("ok example: " + s[i]);
      // alert("ok example: " + s[i])
      ok_tests++;
      continue;
    }
    ko_tests++;
    // document.write(" ...fail</br>")
    console.log("\n");
    console.log("test failed: " + s[i]);
    console.log("expected: " + s[i + 1]);
    console.log("obtained: " + resultFromRun);
    console.log("\n");
  }
  // alert "test failed: " + s[i] + " expected: " + s[i+1] + " obtained: " + resultFromRun
  return test_flag = 0;
};

// these tests do not use "run" but still need a "stop" context




// self test functions
var selftest, test_low_level;

test_low_level = function() {
  run("clearall");
  if (runtime_zombocom.exec("factor", "(x^2-1)").toString() === "(x-1)*(x+1)") {
    console.log("exec text ok");
  } else {
    console.log("exec text failed");
  }
  // test_clearall(); // merged into the .ts tests
  // test_inv(); // merged into the .ts tests
  test_printlatex();
  test_mixedprint();
  test_inner();
  test_transpose();
  test_signs_in_rationals();
  test_madd();
  test_msub();
  test_mmul();
  test_mdiv();
  test_mmod();
  test_mprime();
  // test_mgcd(); // merged into the .ts tests
  test_mpow();
  test_mroot();
  // test_dependencies(); // merged into the .ts tests
  // test_assignments(); // merged into the .ts tests
  test_strings();
  test_test();
  // test_check(); // merged into the .ts tests
  return
};

// use the window.selftest version
// for running the tests from the
// browser console ("run npm build-for-browser")
//window.selftest  = ->
selftest = function() {
  test_low_level();
  test_pattern();
  // test_abs(); // merged into the .ts tests
  test_sum();
  test_product();
  // test_for(); // merged into the .ts tests
  // test_exp(); // merged into the .ts tests
  // test_expand(); // merged into the .ts tests
  test_factorpoly();
  test_subst();
  // test_simplify(); // merged into the .ts tests
  test_multiply();
  test_scan();
  test_power();
  // test_factor_number(); // merged into the .ts tests
  test_tensor();
  // test_bake(); // merged into the .ts tests
  // test_adj(); // merged into the .ts tests
  // test_arg(); // merged into the .ts tests
  // test_approxratio(); // merged into the .ts tests
  // test_besselj(); // merged into the .ts tests
  // test_bessely(); // merged into the .ts tests
  // test_ceiling(); // merged into the .ts tests
  // test_choose(); // merged into the .ts tests
  // test_circexp(); // merged into the .ts tests
  // test_clock(); // merged into the .ts tests
  // test_cofactor(); // merged into the .ts tests
  // test_condense(); // merged into the .ts tests
  // test_contract(); // merged into the .ts tests
  // test_defint(); // merged into the .ts tests
  // test_denominator(); // merged into the .ts tests
  // test_derivative(); // merged into the .ts tests
  // test_dirac(); // merged into the .ts tests
  // test_erf(); // merged into the .ts tests
  // test_erfc(); // in the .ts tests
  // test_expcos(); // in the .ts tests
  // test_expsin(); // in the .ts tests
  // test_float(); // in the .ts tests
  // test_floor(); // in the .ts tests
  // test_gamma(); // in the .ts tests
  test_gcd();
  // test_imag(); // in the .ts tests
  // test_lcm(); // in the .ts tests
  // test_log(); // in the .ts tests
  // test_mod(); // in the .ts tests
  test_nroots();
  test_numerator();
  test_outer();
  test_polar();
  test_quotient();
  test_rationalize();
  test_real();
  test_rect();
  test_round();
  test_sgn();
  test_taylor();
  test_zero();
  // test_hermite(); // merged into the .ts tests
  // test_laguerre(); // merged into the .ts tests
  test_legendre();
  // test_binomial(); // merged into the .ts tests
  // test_divisors(); // merged into the .ts tests
  // test_coeff(); // merged into the .ts tests
  test_sin();
  // test_cos(); // merged into the .ts tests
  test_tan();
  test_sinh();
  // test_cosh(); // merged into the .ts tests
  test_tanh();
  // test_arcsin(); // merged into the .ts tests
  // test_arcsinh(); // merged into the .ts tests
  // test_arccos(); // merged into the .ts tests
  // test_arccosh(); // merged into the .ts tests
  // test_arctan(); // merged into the .ts tests
  // test_arctanh(); // merged into the .ts tests
  // test_index(); // merged into the .ts tests
  // test_isprime(); // merged into the .ts tests
  // test_eigen(); // merged into the .ts tests
  test_shape();
  mini_test();
  test_quickfactor();
  test_integral();
  test_roots();
};

// remove this selftest()
// for running the tests from the
// browser console ("run npm build-for-browser")
// alert "passed tests: " + ok_tests + " / failed tests: " + ko_tests
selftest();
