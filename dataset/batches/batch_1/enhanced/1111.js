setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: note("c4 e4 g4 e4").s("piano").gain("<0 .3 .6 .6>")
  .lpf(500).resonance(20).room(.6)

$: n("<c2 g1 e2 g1>").scale("c:minor").s("gm_electric_bass_finger")
  .lpf(700).release(.2).gain(.45)
