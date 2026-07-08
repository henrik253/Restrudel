setcpm(120/4)

$: s("amen*2").bank("RolandTR909").lpf(4000).resonance(2).gain(.4)

$: s("~ oh ~ oh").gain(.3)

$: note("c3 g2 a2 f2").s("gm_electric_guitar_jazz")
  .lpf(1500).room(.3).release(.25).gain(.5)

$: n("<0 3 5 7>").scale("c:minor").s("kalimba")
  .lpf(2500).room(.4).delay(.3).gain(.35)
