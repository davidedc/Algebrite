test_check = ->
  if DEBUG then console.log "test_check ----------------------------"

  run_test [

    # note how check can turn an assignment
    # into a test, so in this case a is not
    # assigned anything

    "check(a=b)",
    "check(a=b)",

    "a",
    "a",

    "check(a)",
    "check(a)",

    "check(a=a)",
    "1",

    "check(a==a)",
    "1",

    "check(a===a)",
    "check(a=== ? a)\nStop: syntax error",

    "check(a+1=a)",
    "0",

    "check(a+1==a)",
    "0",

    "check(a+1===a)",
    "check(a+1=== ? a)\nStop: syntax error",

    "check(1)",
    "1",

    "check(0)",
    "0",

    "check(and(1,0))",
    "0",

    "check(and(1,1))",
    "1",

    # if passed a value, check if non-zero
    "check(pi)",
    "1",

    "check(2)",
    "1",

    "check(-2)",
    "1",

    "check(sqrt(2))",
    "1",

    "check(sqrt(-1))",
    "1",

    "check(sqrt(pi/4)-sqrt(i))",
    "1",

    "check(1+i)",
    "1",


    "check([0,0])",
    "0",

    "check([1,2])",
    "1",

    "check([1+i,2])",
    "1",

    "check([a,2])",
    "check([a,2])",

    "check(1-i)",
    "1",

  ]
