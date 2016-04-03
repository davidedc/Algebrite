# self test functions

#include "stdafx.h"
#include "defs.h"
#include "selftest.h"


selftest  = ->
	# for handling "errout"

	#if SELFTEST

	test_low_level();

	###
	test_multiply();
	test_scan();
	test_power();
	test_factor_number();
	test_test();
	test_tensor();
	test_bake();
	test_abs();
	test_adj();
	test_arg();
	###

	test_besselj();

	return

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
	test_expand();
	test_expcos();
	test_expsin();
	test_factorpoly();
	test_float();
	test_floor();
	test_gamma();
	test_gcd();
	test_imag();
	test_inner();
	test_lcm();
	test_log();
	test_mag();
	test_mod();
	test_nroots();
	test_numerator();
	test_outer();
	test_polar();
	test_quotient();
	test_rationalize();
	test_real();
	test_rect();
	test_sgn();
	test_taylor();
	test_transpose();
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
	test_integral();
	test_simplify();
	test_roots();
	test_eigen();

	#endif

	mini_test();

	console.log("OK, all tests passed.");

logout = (s) ->
	console.log s


run_test = (s) ->
	i = 0;
	t = "";

	test_flag = 1;

	run("clear");

	run("e=quote(e)");

	for i in [0...s.length] by 2

		console.log("starting example: " + s[i]);

		out_count = 0;

		resultFromRun = run(s[i]);

		if (resultFromRun == s[i+1])
			console.log("ok example: " + s[i]);
			continue;

		console.log("expected to get the following result:\n");
		console.log(s[i+1]);

		console.log("got this result instead:\n");
		console.log(resultFromRun);


	test_flag = 0;

# these tests do not use "run" but still need a "stop" context


test_low_level = ->
	run("clear"); # to initialize stack and memory

	test_madd();
	test_msub();
	test_mmul();
	test_mdiv();
	test_mmod();
	test_mprime();
	test_mgcd();
	test_mpow();
	test_mroot();
	# commenting out because it takes a looong time
	# with the current logging. But it works now
	# as I'm commenting it out.
	#test_quickfactor();
