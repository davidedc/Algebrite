test_bake = ->
  run_test [

    "bake = 0",
    "",

    "(x+3)^3",
    "27+27*x+9*x^2+x^3",

    "factor",
    "(3+x)^3",

    "bake = 1",
    "",

    "(x+3)^3",
    "x^3+9*x^2+27*x+27",

    "factor",
    "(x+3)^3",

  ]
