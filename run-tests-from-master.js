"use strict";
Object.defineProperty(exports, "__esModule", { value: true });


var runtime_run = require("./runtime/run");
var runtime_zombocom = require("./runtime/zombocom");


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
  runtime_run.run("clearall");
  runtime_run.run("e=quote(e)");
  for (i = j = 0, ref = s.length; j < ref; i = j += 2) {
    console.log("starting example: " + s[i]);
    //alert("starting example: " + s[i])
    // document.write("starting example: " + s[i] )
    out_count = 0;
    try {
      resultFromRun = runtime_run.run(s[i]);
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
  runtime_run.run("clearall");
  if (runtime_zombocom.exec("factor", "(x^2-1)").toString() === "(x-1)*(x+1)") {
    console.log("exec text ok");
  } else {
    console.log("exec text failed");
  }
  test_clearall();
  test_inv();
  test_printlatex();
  test_mixedprint();
  test_inner();
  test_transpose();
  test_signs_in_rationals();
  //test_madd();
  //test_msub();
  //test_mmul();
  //test_mdiv();
  //test_mmod();
  //test_mprime();
  //test_mgcd();
  //test_mpow();
  //test_mroot();
  //test_dependencies();
  test_assignments();
  test_strings();
  test_test();
  return test_check();
};

// use the window.selftest version
// for running the tests from the
// browser console ("run npm build-for-browser")
//window.selftest  = ->
selftest = function() {
  test_low_level();
  test_pattern();
  test_abs();
  test_sum();
  test_product();
  test_for();
  test_exp();
  test_expand();
  test_factorpoly();
  test_subst();
  test_simplify();
  test_multiply();
  test_scan();
  test_power();
  test_factor_number();
  test_tensor();
  test_bake();
  test_adj();
  test_arg();
  test_approxratio();
  test_besselj();
  test_bessely();
  test_ceiling();
  test_choose();
  test_circexp();
  test_clock();
  test_cofactor();
  test_condense();
  test_contract();
  test_defint();
  test_denominator();
  test_derivative();
  test_dirac();
  test_erf();
  test_erfc();
  test_expcos();
  test_expsin();
  test_float();
  test_floor();
  test_gamma();
  test_gcd();
  test_imag();
  test_lcm();
  test_log();
  test_mod();
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
  test_hermite();
  test_laguerre();
  test_legendre();
  test_binomial();
  test_divisors();
  test_coeff();
  test_sin();
  test_cos();
  test_tan();
  test_sinh();
  test_cosh();
  test_tanh();
  test_arcsin();
  test_arcsinh();
  test_arccos();
  test_arccosh();
  test_arctan();
  test_arctanh();
  test_index();
  test_isprime();
  test_eigen();
  test_shape();
  mini_test();
  //test_quickfactor();
  test_integral();
  test_roots();
};

// remove this selftest()
// for running the tests from the
// browser console ("run npm build-for-browser")
// alert "passed tests: " + ok_tests + " / failed tests: " + ko_tests
selftest();
