setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: note("<c a>").s("gm_overdriven_guitar")
  .lpf(2000).room(.3).release(.2).gain(.35)

$: n("7 11 6 7 11 12").scale("a:minor").s("square")
  .lpf(2200).resonance(5).release(.15).delay(.3).gain(.4)

$: n("<a1 a1 f1 g1>").scale("a:minor").s("gm_electric_bass_finger")
  .lpf(600).release(.25).gain(.5)
