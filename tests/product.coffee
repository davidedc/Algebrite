test_product = ->
  run_test [
    
    # compute pi using Viete's formula ------------

    # note that this is not an array, this
    # defines a recursive function
    "a(n)=test(n=0,0,sqrt(2+a(n-1)))",
    "",

    # not very efficient because evaluation of
    # a(n) is not memoized, so there
    # is quadratic cost as n increases.
    "float(2*product(2/a(k),k,1,9))",
    "3.141588...",


    # Wallis' product
    "2*product(float(4*k^2/(4*k^2-1)),k,1,100)",
    "3.133787...",

    # ---------------------------
    "f(a,b)=product(k,k,a,b)",
    "",

    "f(1,2)",
    "2",

    # --- cleanup

    "a = quote(a)",
    "",

    "f = quote(f)",
    "",


  ]
