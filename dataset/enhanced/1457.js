setcpm(130/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .14]*4")

$: s("~ sd*2 ~ sd").bank("RolandTR909").gain(.4)

$: n("0 ~ 3 5 ~ 7 5 ~").scale("e:minor").s("supersaw")
  .lpf(2377).resonance(5).release(.2).delay(.3).gain(.4)

$: n("<e2 e2 c2 d2>").scale("e:minor").s("gm_electric_bass_finger")
  .lpf(600).release(.25).gain(.5)
