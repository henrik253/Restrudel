setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("b2 d2 g2 bb2").s("sawtooth")
  .lpf(600).release(.2).gain(.5)

$: n("0 3 7 5 7 3 0 ~").scale("g:minor").s("sawtooth")
  .lpf(3500).release(.2).room(.3).gain(.4)
