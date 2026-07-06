setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.22 .14]*4").pan(.4)

$: n("0 ~ 3 ~ 5 3 0 ~").scale("c:minor").s("square")
  .lpf(sine.range(500, 2200).slow(4)).resonance(8)
  .release(.12).delay(.5).delayfeedback(.35).gain(.4)

$: n("<c2 g1 eb2 g1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
