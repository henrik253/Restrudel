setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4").gain(.2)

$: n("3 -1 ~ -1 -1 0 ~ 0 0 0 ~ 0 0 0 ~ 0").scale("c:minor").s("sawtooth")
  .gain(.4).lpf(1600).room(.5).release(.2)

$: n("<c2 g1 eb2 f1>").scale("c:minor").s("square")
  .lpf(600).release(.3).gain(.5)
