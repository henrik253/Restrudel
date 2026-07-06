setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: note("a2*8 a2*8 a2*4 ~").s("sawtooth")
  .lpf(700).release(.2).gain(.5)

$: n("<0 3 5 7>").scale("a:minor").s("sawtooth")
  .lpf(2400).release(.2).room(.3).gain(.4)
