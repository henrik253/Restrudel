setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: n("1 3 1 5 4 4 ~ 3 ~ 4 6@2 4 ~ 7 2 3 4 5 6 ~ 4").scale("c:minor").s("sawtooth")
  .lpf(2200).resonance(6).release(.15).delay(.3).room(.3).gain(.4)

$: n("<c2 g1 eb2 g1>").scale("c:minor").s("square").lpf(600).release(.25).gain(.5)
