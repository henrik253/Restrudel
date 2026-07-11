setcpm(120/4)

$: s("bd*4").bank("RolandTR909").gain(.8)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh*8").gain(.16)

$: note("a3 c4 ~ e4 f3 a3 c4 f4").s("square")
  .lpf(500).resonance(10).release(.2).gain(.4)

$: note("<a1 f1 c2 g1>").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
