setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").lpf(700).gain(.2)

$: s("~ cp ~ ~").bank("RolandTR808").gain(.4)

$: n("g2 b2 d3 g3").scale("g:minor").s("sawtooth")
  .lpf(2000).release(.25).room(.3).gain(.4)

$: n("<g1 d2 eb2 f1>").scale("g:minor").s("square")
  .lpf(600).release(.25).gain(.5)
