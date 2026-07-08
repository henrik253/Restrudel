setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("9*2 9!2 6 7 11*2 11!2").scale("c:minor").s("sawtooth")
  .lpf(2400).release(.2).room(.3).gain(.4)

$: n("<0 3 5 7>").scale("c:minor").s("square")
  .lpf(3000).hpf(400).release(.2).gain(.35)

$: n("<c2 g1 g#1 bb1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
