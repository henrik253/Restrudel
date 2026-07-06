setcpm(120/4)

$: s("cp ~ sd ~").bank("RolandTR909").gain(.5)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("hh*2 ~ hh ~").gain(.2)

$: note("b3 d4 f#4 b4").s("sawtooth")
  .lpf(2000).resonance(5).release(.15).delay(.4).gain(.4)

$: note("<b1 b1 f#1 g1>").s("square")
  .lpf(600).release(.2).gain(.5)
