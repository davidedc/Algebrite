test_erf = ->
  run_test [

    "erf(a)",
    "erf(a)",

    "erf(0.0) + 1",
    "1.0",

    "1.0",
  ]
    "float(erf(0))",

###

#two potential more tests that were
# commented-out

    "float(erf(1))",
    "0.842701...",

