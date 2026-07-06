setcpm(120/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("hh*8").bank("Linn9000").gain("[.2 .13]*4")

$: n("6 8 10 ~ 4 4 3 1 2 1 0 4 5 2 4 6 4 2 3 4 4 5 4 3 2 0 4 5 4 3 2 ~")
  .scale("a:minor").clip(.93).release(.4).s("square")
  .lpf(2000).resonance(5).delay(.3).gain(.4)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
