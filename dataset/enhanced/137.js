setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ ~ lt ~").bank("RolandTR909").gain(.5)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: note("b4@2 f4@2 ~ b4").s("gm_lead_6_voice")
  .lpf(2500).release(.2).room(.5).gain(.4)

$: note("<b1 f2 d2 f2>").s("sawtooth").lpf(600).release(.25).gain(.5)
