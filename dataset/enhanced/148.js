setcpm(118/4)

$: s("~ bd*2 ~ bd").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("~ g3 ~ b3").s("sawtooth")
  .lpf(1244).resonance(6).release(.2).delay(.3).room(.4).gain(.45)

$: s("gm_pad_warm").note("g3 b3 d4 g4").room(.6).release(.4).gain(.3)
