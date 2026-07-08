setcpm(128/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd*2").bank("RolandTR909").gain(.7)

$: s("hh*8").gain("[.2 .13]*4")

$: n("0 ~ 3 5 ~ 3 0 ~").scale("c:minor").s("square")
  .lpf(1800).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<c2 c2 ab1 bb1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
