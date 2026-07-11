setcpm(114/4)

$: s("bd ~ sd ~").bank("linn9000").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").room(.5).pan(.5)

$: note("c4 e4 g4 e4").s("gtr").clip(.8).room(.4).gain(.35)

$: note("<c2 g1 a1 f1>").s("sawtooth").lpf(600).release(.25).gain(.5)

$: n("0 3 5 7").scale("c:major").s("square")
  .lpf(1800).release(.15).delay(.3).gain(.3)
