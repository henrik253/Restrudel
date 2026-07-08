setcpm(118/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.85)

$: s("~ cp ~ ~").gain(.8)

$: s("~ sd ~ mt").bank("RolandTR909").gain(.55)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: n("<0 3 5 7>").scale("d:minor").s("sawtooth")
  .lpf(1900).resonance(5).release(.15).delay(.3).gain(.4)

$: n("<d2 a1 f2 a1>").scale("d:minor").s("square").lpf(600).release(.25).gain(.5)
