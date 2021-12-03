test_test = ->
  run_test [
    "a<a+1",
    "1",

    "a-1<a",
    "1",

    "0==-0",
    "1",

    "0!=-0",
    "0",

    "1==1",
    "1",

    "1==2",
    "0",

    "1!=1",
    "0",

    "1!=2",
    "1",

    "1>=1",
    "1",

    "1>=2",
    "0",

    "2>=1",
    "1",

    "1>1",
    "0",

    "1>2",
    "0",

    "2>1",
    "1",

    "1<=1",
    "1",

    "1<=2",
    "1",

    "2<=1",
    "0",

    "1<1",
    "0",

    "1<2",
    "1",

    "2<1",
    "0",

    "-1<-2",
    "0",

    "-2<-1",
    "1",

    "test(0,A,B)",
    "B",

    "test(1,A,B)",
    "A",

    "test(0,A,0,B)",
    "0",

    "test(0,A,0,B,C)",
    "C",

    "test(x<3,-x-4,3<=x,x*x+7,120/x+5)",
    "test(testlt(x,3),-x-4,testle(3,x),x^2+7,120/x+5)",

    "x = -1",
    "",

    "test(x<1,-x-4,3<=x,x*x+7,120/x+5)",
    "-3",

    "x = 3",
    "",

    "test(x<1,-x-4,3<=x,x*x+7,120/x+5)",
    "16",

    "x = 2",
    "",

    "test(x<1,-x-4,3<=x,x*x+7,120/x+5)",
    "65",

    "x=quote(x)",
    "",

    # not ---------------------------------

    "not(a=b)",
    "not(a=b)",

    "a",
    "a",

    "not(a)",
    "not(a)",

    "not(not(a))",
    "not(not(a))",

    "not(a=a)",
    "0",

    "not(not(a=a))",
    "1",

    "not(a==a)",
    "0",

    "not(a===a)",
    "not(a=== ? a)\nStop: syntax error",

    "not(a+1=a)",
    "1",

    "not(a+1==a)",
    "1",

    "not(a+1===a)",
    "not(a+1=== ? a)\nStop: syntax error",

    "not(1)",
    "0",

    "not(0)",
    "1",

    "not(and(1,0))",
    "1",

    "not(and(1,1))",
    "0",

    # if passed a value, check if non-zero
    "not(pi)",
    "0",

    "not(2)",
    "0",

    "not(-2)",
    "0",

    "not(sqrt(2))",
    "0",

    "not(sqrt(-1))",
    "0",

    "not(sqrt(pi/4)-sqrt(i))",
    "0",

    "not(1+i)",
    "0",

    "not([0,0])",
    "1",

    "not([1,2])",
    "0",

    "not([1+i,2])",
    "0",

    "not([a,2])",
    "not([a,2])",

    "not(1-i)",
    "0",


    # and ---------------------------------

    # and with the first predicate being true 

    "and(1,1)",
    "1",

    "and(1,a=a,b=b)",
    "1",

    "and(1,0)",
    "0",

    "and(1,2)",
    "1",

    "and(1,-2)",
    "1",

    "and(1,sqrt(2))",
    "1",

    "and(1,sqrt(-1))",
    "1",

    "and(1,sqrt(pi/4)-sqrt(i))",
    "1",

    "and(1,1+i)",
    "1",


    "and(1,a)",
    "and(1,a)",


    "and(1,[0,0])",
    "0",

    "and(1,[1,2])",
    "1",

    "and(1,[1+i,2])",
    "1",

    "and(1,[a,2])",
    "and(1,[a,2])",

    "and(1,1-i)",
    "1",

    # and with the first predicate being false

    "and(0,1)",
    "0",

    "and(0,a=a,b=b)",
    "0",

    "and(0,0)",
    "0",

    "and(0,2)",
    "0",

    "and(0,-2)",
    "0",

    "and(0,sqrt(2))",
    "0",

    "and(0,sqrt(-1))",
    "0",

    "and(0,sqrt(pi/4)-sqrt(i))",
    "0",

    "and(0,1+i)",
    "0",

    "and(0,a)",
    "0",

    "and(0,[0,0])",
    "0",

    "and(0,[1,2])",
    "0",

    "and(0,[1+i,2])",
    "0",

    "and(0,[a,2])",
    "0",

    "and(0,1-i)",
    "0",

    # and with last predicate being true

    "and(1,1)",
    "1",

    "and(a=a,b=b,1)",
    "1",

    "and(0,1)",
    "0",

    "and(2,1)",
    "1",

    "and(-2,1)",
    "1",

    "and(sqrt(2),1)",
    "1",

    "and(sqrt(-1),1)",
    "1",

    "and(sqrt(pi/4)-sqrt(i),1)",
    "1",

    "and(1+i,1)",
    "1",


    "and(a,1)",
    "and(a,1)",


    "and([0,0],1)",
    "0",

    "and([1,2],1)",
    "1",

    "and([1+i,2],1)",
    "1",

    "and([a,2],1)",
    "and([a,2],1)",

    "and(1-i,1)",
    "1",

    # and with last predicate being false

    "and(1,0)",
    "0",

    "and(a=a,b=b,0)",
    "0",

    "and(0,0)",
    "0",

    "and(2,0)",
    "0",

    "and(-2,0)",
    "0",

    "and(sqrt(2),0)",
    "0",

    "and(sqrt(-1),0)",
    "0",

    "and(sqrt(pi/4)-sqrt(i),0)",
    "0",

    "and(1+i,0)",
    "0",

    "and(a,0)",
    "0",


    "and([0,0],0)",
    "0",

    "and([1,2],0)",
    "0",

    "and([1+i,2],0)",
    "0",

    "and([a,2],0)",
    "0",

    "and(1-i,0)",
    "0",

    # or ----------------------------------------------

    # or with the first predicate being true 

    "or(1,1)",
    "1",

    "or(1,a=a,b=b)",
    "1",

    "or(1,0)",
    "1",

    "or(1,2)",
    "1",

    "or(1,-2)",
    "1",

    "or(1,sqrt(2))",
    "1",

    "or(1,sqrt(-1))",
    "1",

    "or(1,sqrt(pi/4)-sqrt(i))",
    "1",

    "or(1,1+i)",
    "1",

    "or(1,a)",
    "1",

    "or(1,[0,0])",
    "1",

    "or(1,[1,2])",
    "1",

    "or(1,[1+i,2])",
    "1",

    "or(1,[a,2])",
    "1",

    "or(1,1-i)",
    "1",

    # or with the first predicate being false

    "or(0,1)",
    "1",

    "or(0,a=a,b=b)",
    "1",

    "or(0,0)",
    "0",

    "or(0,2)",
    "1",

    "or(0,-2)",
    "1",

    "or(0,sqrt(2))",
    "1",

    "or(0,sqrt(-1))",
    "1",

    "or(0,sqrt(pi/4)-sqrt(i))",
    "1",

    "or(0,1+i)",
    "1",

    "or(0,a)",
    "or(0,a)",

    "or(0,[0,0])",
    "0",

    "or(0,[1,2])",
    "1",

    "or(0,[1+i,2])",
    "1",

    "or(0,[a,2])",
    "or(0,[a,2])",

    "or(0,1-i)",
    "1",

    # or with last predicate being true

    "or(1,1)",
    "1",

    "or(a=a,b=b,1)",
    "1",

    "or(0,1)",
    "1",

    "or(2,1)",
    "1",

    "or(-2,1)",
    "1",

    "or(sqrt(2),1)",
    "1",

    "or(sqrt(-1),1)",
    "1",

    "or(sqrt(pi/4)-sqrt(i),1)",
    "1",

    "or(1+i,1)",
    "1",

    "or(a,1)",
    "1",

    "or([0,0],1)",
    "1",

    "or([1,2],1)",
    "1",

    "or([1+i,2],1)",
    "1",

    "or([a,2],1)",
    "1",

    "or(1-i,1)",
    "1",

    # or with last predicate being false

    "or(1,0)",
    "1",

    "or(a=a,b=b,0)",
    "1",

    "or(0,0)",
    "0",

    "or(2,0)",
    "1",

    "or(-2,0)",
    "1",

    "or(sqrt(2),0)",
    "1",

    "or(sqrt(-1),0)",
    "1",

    "or(sqrt(pi/4)-sqrt(i),0)",
    "1",

    "or(1+i,0)",
    "1",

    "or(a,0)",
    "or(a,0)",


    "or([0,0],0)",
    "0",

    "or([1,2],0)",
    "1",

    "or([1+i,2],0)",
    "1",

    "or([a,2],0)",
    "or([a,2],0)",

    "or(1-i,0)",
    "1",

    # ------------------------------------------------

    # zero and all zero vectors are considered equal.
    # The reason being that the test checks whether
    # [0,0]-0 is zero. Since anything minus zero is
    # equal to itself, we effectively check if [0,0]
    # is zero, which it is.
    "[0,0]==0",
    "1",

    "[1,2]==[1,2]",
    "1",

    "[1,2]==[a,2]",
    "testeq([1,2],[a,2])",

    "[1,2]==[3,4]",
    "0",

    "[1,2]==[cos(x)^2 + sin(x)^2,2]",
    "1",

    "1<sqrt(3)",
    "1",

    "cos(x)^2 + sin(x)^2 == 1",
    "1",

    "cos(x)^2 + sin(x)^2 >= 1",
    "1",

    "cos(x)^2 + sin(x)^2 <= 1",
    "1",

    "cos(x)^2 + sin(x)^2 < 1",
    "0",

    "cos(x)^2 + sin(x)^2 + 1 > 1",
    "1",

    "x + x > x",
    "testgt(2*x,x)",

    "a > x",
    "testgt(a,x)",

    "a >= x",
    "testge(a,x)",

    "a == x",
    "testeq(a,x)",

    "a < x",
    "testlt(a,x)",

    "a <= x",
    "testle(a,x)",

    # clean up -----------------

    "a=quote(a)",
    "",

    "x=quote(x)",
    "",

    "b=quote(b)",
    "",

    "A=quote(A)",
    "",

    "B=quote(B)",
    "",

    "C=quote(C)",
    "",

  ]

