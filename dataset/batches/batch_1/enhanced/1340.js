setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("woodblock:1*4").gain(.25)

$: n("0 -7 ~ 2 0@3 ~ 3 ~ 1 ~ 2 3 -4 -3 4 3 4").scale("a:minor").s("sawtooth")
  .lpf(2000).resonance(6).release(.15).delay(.4).gain(.4)

$: n("<a1 e2 c2 f1>").scale("a:minor").s("square")
  .lpf(600).release(.3).gain(.5)
