test_assignments = ->
  run_test [

    # it used to return exp(1)
    "e",
    "e",

    # normally sqrt(-1) is shown as i or j
    # but if user really wants to look inside
    # i/j then we are going to show sqrt(-1)
    "i",
    "(-1)^(1/2)",

    "j",
    "j",

    # degenerate assignments give an error ----

    "0=0",
    "Stop: symbol assignment: error in symbol",

    "1=2",
    "Stop: symbol assignment: error in symbol",

    "3=a",
    "Stop: symbol assignment: error in symbol",

    # ------------------------------------------

    # f is not defined, so everything left as is
    "f(a)",
    "f(a)",

    # this is parsed as a function call, the (f-f) is evaluated and
    # returns zero, which is not a valid function, so here
    # we can say that the user probably meant to use
    # the multiplication
    "(f-f)(a)",
    "Stop: expected function invocation, found multiplication instead. Use '*' symbol explicitly for multiplication.",

    # tensor instead of function
    "([1,2])(a)",
    "Stop: expected function invocation, found tensor product instead. Use 'dot/inner' explicitly.",

    "[1,2](a)",
    "Stop: expected function invocation, found tensor product instead. Use 'dot/inner' explicitly.",

    # string instead of function
    "(\"hey\")(a)",
    "Stop: expected function, found string instead.",

    "\"hey\"(a)",
    "Stop: expected function, found string instead.",

    # this is parsed as a function call, (f(a)) is evaluated and
    # returns something that is not fully evaluated, so we have to
    # leave it all as it was
    "(f(a))(b)",
    "f(a)(b)",

    # this is parsed as a function call, the (f-1) is evaluated and
    # returns something that is not fully evaluated, so again
    # little that we can do
    "(f-1)(a)",
    "(-1+f)(a)",

    # similar to the case above
    "(x-2)(x-1)",
    "(-2+x)(x-1)",

    # similar to the case above, just with a space
    "(x-2) (x-1)",
    "(-2+x)(x-1)",

    # ------------------------------------------

    "1[2] = 3"
    "Stop: indexed assignment: expected a symbol name"

    "undefinedVar[1] = 2"
    "Stop: error in indexed assign: assigning to something that is not a tensor"

    "[[1,2],[3,4]][5] = 6"
    "Stop: indexed assignment: expected a symbol name"

    # ------------------------------------------

    "f(x) = x + 1",
    "",

    "g = f",
    "",

    "lookup(f)",
    "function (x) -> x+1",

    "lookup(g)",
    "function (x) -> x+1",

    "f(x,y) = x + 2",
    "",

    "lookup(f)",
    "function (x y) -> x+2",

    "g(3)",
    "4",

    "f(3,0)",
    "5",

    "f = quote(1+1)",
    "",

    "g = f",
    "",

    "g",
    "2",

    "g = quote(f)",
    "",

    "g",
    "2",

    "lookup(g)",
    "f",

    "g = lookup(f)",
    "",

    "g",
    "2",

    "lookup(g)",
    "1+1",

    # test the abbreviated form :=
    # of assignment with quote
    "f := 1+1",
    "",

    "lookup(f)",
    "1+1",

    # a function returning a function

    "f(x) = x + 1",
    "",

    "g() = f",
    "",

    "g()(2)",
    "3",

    # a function returning a function
    # variant in which g has an (unneeded) parameter

    "f(x) = x + 1",
    "",

    "g(y) = f",
    "",

    "g()(2)",
    "3",


    # a function returning a function
    # variant in which g has an (unneeded) parameter
    # with the same name of the parameter that f uses

    "f(x) = x + 1",
    "",

    "g(x) = f",
    "",

    "g()(2)",
    "3",

    # passing functions as parameters

    "f(x) = x + 1",
    "",

    "g(x) = x * x",
    "",

    "h(l, x) = l(x)",
    "",

    "h(f, 2)",
    "3",

    "h(g, 3)",
    "9",


    # passing function as parameter
    # but doing nothing with it because
    # the function in the body is already
    # defined

    "f(x) = x + 1",
    "",

    "g(x) = x * x",
    "",

    "h(l, x) = f(x)",
    "",

    "h(f, 2)",
    "3",

    "h(g, 3)",
    "4",


    # clean up -----------------

    "f=quote(f)",
    "",

    "g=quote(g)",
    "",

    "h=quote(h)",
    "",

    # ----------------------
    "a = a+1",
    "",

    "a",
    "Stop: recursive evaluation of symbols: a -> a",

    # ----------------------
    "a := b",
    "",

    "b := c",
    "",

    "c := a",
    "",

    "b",
    "Stop: recursive evaluation of symbols: b -> c -> a -> b",

    # ----------------------
    # note how this case actually doesn't generate a recursion
    # as in Algebrite it's not a problem when a variable
    # just contain itself, actually that's the default of
    # unassigned variables.

    "a = b",
    "",

    "b = a",
    "",

    "a",
    "b",

    "b",
    "b",

    # ----------------------
    # note how these assignments actually don't generate
    # a recursion as in Algebrite it's not a problem when
    # a variable just contain itself, actually that's the
    # default for unassigned variables.

    "a=a",
    "",

    "a := a",
    "",

    "a",
    "a",

    # clean up -----------------

    "clearall",
    "",


  ]
