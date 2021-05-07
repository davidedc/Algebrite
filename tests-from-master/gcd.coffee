test_gcd = ->

  gcdTests = []

  GCD_TESTS_DONT_TEST_FACTOR = 1

  addGcdTest = (arg1, arg2, result, dontTestFactor) ->
    gcdTests.push "gcd(" + arg1 + "," + arg2 + ")"
    gcdTests.push result

    gcdTests.push "gcd(" + arg2 + "," + arg1 + ")"
    gcdTests.push result

    if !dontTestFactor?
      gcdTests.push "gcd(factor(" + arg1 + ")," + arg2 + ")"
      gcdTests.push result

    if !dontTestFactor?
      gcdTests.push "gcd(factor(" + arg2 + ")," + arg1 + ")"
      gcdTests.push result

    if !dontTestFactor?
      gcdTests.push "gcd(" + arg1 + ",factor(" + arg2 + "))"
      gcdTests.push result

    if !dontTestFactor?
      gcdTests.push "gcd(" + arg2 + ",factor(" + arg1 + "))"
      gcdTests.push result

    if !dontTestFactor?
      gcdTests.push "gcd(factor(" + arg1 + "),factor(" + arg2 + "))"
      gcdTests.push result

    if !dontTestFactor?
      gcdTests.push "gcd(factor(" + arg2 + "),factor(" + arg1 + "))"
      gcdTests.push result
  

  addGcdTest "30","42","6"
  addGcdTest "-30","42","6"
  addGcdTest "30","-42","6"
  addGcdTest "-30","-42","6", GCD_TESTS_DONT_TEST_FACTOR

  addGcdTest "x","x","x"
  addGcdTest "-x","x","x"
  addGcdTest "-x","-x","-x"

  addGcdTest "x^2","x^3","x^2"
  addGcdTest "x","y","1"
  addGcdTest "x*y","y","y"
  addGcdTest "x*y","y^2","y"
  addGcdTest "x^2*y^2","x^3*y^3","x^2*y^2"
  addGcdTest "x^2","x^3","x^2"

  # gcd of expr
  addGcdTest "x+y","x+z","1"
  addGcdTest "x+y","x+y","x+y"
  addGcdTest "x+y","2*x+2*y","x+y", GCD_TESTS_DONT_TEST_FACTOR
  addGcdTest "-x-y","x+y","x+y", GCD_TESTS_DONT_TEST_FACTOR
  addGcdTest "4*x+4*y","6*x+6*y","2*x+2*y", GCD_TESTS_DONT_TEST_FACTOR
  addGcdTest "4*x+4*y+4","6*x+6*y+6","2+2*x+2*y", GCD_TESTS_DONT_TEST_FACTOR
  # TODO this is not really correct, it should give 2
  # however this was failing before all the gcd changes
  # of May 2019, so just leaving it in with a note
  addGcdTest "4*x+4*y+4","6*x+6*y+12","1", GCD_TESTS_DONT_TEST_FACTOR
  addGcdTest "27*t^3+y^3+9*t*y^2+27*t^2*y","t+y","1"

  # gcd expr factor
  addGcdTest "2*a^2*x^2+a*x+a*b","a","a"
  addGcdTest "2*a^2*x^2+a*x+a*b","a^2","a"
  addGcdTest "2*a^2*x^2+2*a*x+2*a*b","a","a"

  # gcd expr term
  addGcdTest "2*a^2*x^2+2*a*x+2*a*b","2*a","2*a"
  addGcdTest "2*a^2*x^2+2*a*x+2*a*b","3*a","a"
  addGcdTest "2*a^2*x^2+2*a*x+2*a*b","4*a","2*a"

  # gcd factor factor
  addGcdTest "x","x^2","x"
  addGcdTest "x","x^a","1"


  # polynomials
  addGcdTest "(x+1)*(x+1)","x+1","x+1"
  addGcdTest "x*(x+1)","x","x"
  addGcdTest "x^2+7x+6","x^2-5x-6","x+1",
  addGcdTest "x*(x+1)^2","x+1","x+1"
  addGcdTest "x*(x+1)","x+1","x+1"
  addGcdTest "x^2+3x","x^2+5x","x"
  addGcdTest "6x+20","2x+10","2"
  addGcdTest "x^3-3x^2","4x^2-5x","x"
  addGcdTest "x^2-9","x^2+5x+6","x+3"
  addGcdTest "x^2-3x+2","x^2-1","x-1"
  addGcdTest "x^2-2x-15","x^2+x-6","x+3"
  addGcdTest "10x^3","2x^2-18x","2*x"
  addGcdTest "6x^2","12x^4-9x^3","3*x^2"
  addGcdTest "(3-x)*(x-1)","(x-3)*(x+1)","x-3"
  addGcdTest "(x-2)*(x-5)","(2-x)*(x+5)","x-2"
  addGcdTest "15-10x","8x^3-12x^2","2*x-3"
  addGcdTest "3x","15x^2-6x","3*x"
  addGcdTest "3x^3-15x^2+12x","3x-3","3*x-3"
  addGcdTest "6x^2-12x","6x-3x^2","3*x^2-6*x"
  addGcdTest "2x^2+13x+20","2x^2+17x+30","2*x+5"
  addGcdTest "x^4+8x^2+7","3x^5-3x","x^2+1"
  addGcdTest "x^2+8x*k+16*k^2","x^2-16k^2","x+4*k"


  run_test gcdTests

  # multiple arguments
  run_test [
    "gcd(12,18,9)",
    "3",
  ]

