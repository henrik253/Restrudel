setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("cowbell ~ ~ cowbell").gain(.5).room(.5)

$: n("0 ~ 3 ~ 5 7 ~ 5").scale("g:minor").s("gm_piccolo")
  .lpf(2500).release(.2).clip(1).gain(.4)

$: n("<g2 g2 d2 eb2>").scale("g:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
