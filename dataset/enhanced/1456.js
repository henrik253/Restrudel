setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh:8*8").gain("[.2 .13]*4")

$: s("~ sd ~ sd").gain(.22).release(.4)

$: note("d4 d#4@4 ~ d#4").s("bell")
  .lpf(2000).lpq(2).delay(.4).room(.3).gain(.4)

$: n("<d2 d2 bb1 c2>").scale("d:minor").s("sawtooth")
  .lpf(600).resonance(6).room(.4).release(.25).gain(.5)
