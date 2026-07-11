setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4")

$: note("<c2 f2>").s("sawtooth")
  .lpf(600).resonance(5).release(.25).gain(.5)

$: n("0 ~ 3 5 ~ 3 0 ~").scale("c:major").s("piano")
  .lpf(2000).room(.4).release(.2).gain(.4)
