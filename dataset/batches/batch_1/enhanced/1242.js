setcpm(114/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ lt ~ lt").gain(.3)

$: n("4 2 ~ 3").scale("c:minor").s("gm_piccolo")
  .lpf(3000).release(.2).delay(.35).room(.3).gain(.35)

$: note("g2 c2 f2 c2").s("sawtooth")
  .lpf(800).release(.2).gain(.5)
