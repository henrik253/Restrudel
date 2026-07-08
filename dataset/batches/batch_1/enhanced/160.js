setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("~ 2*3").scale("d:minor").s("sawtooth")
  .lpf(2400).release(.2).room(.3).gain(.4)

$: note("d5 e5 e5 ~").s("square").lpf(2000).release(.2).gain(.35)

$: n("<d2 a1 bb1 f1>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
