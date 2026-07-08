setcpm(114/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .12]*4").pan(.4)

$: n("9*2 8 ~ 14 8*2 6").scale("g2:dorian").s("square")
  .lpf(2000).resonance(5).release(.15).delay(.35).gain(.4)

$: note("<g3 c4 f4 bb3>").s("gm_church_organ")
  .attack(.2).release(1.2).room(.5).gain(.3)

$: n("<0 -2 -4 -3>").scale("g2:dorian").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
