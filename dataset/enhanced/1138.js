setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ lt ~ lt").gain(.3)

$: note("a3 c4 a3 c4").s("gm_epiano1:1").lpf(2000)
  .release(.3).room(.4).gain(.35)

$: note("a2 e2 a2 g2").s("sawtooth").lpf(700)
  .release(.25).gain(.45)
