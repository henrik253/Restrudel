setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ oh ~ oh").bank("RolandTR808").gain(.3)

$: note("f4 a3 f#4 bb3 e4").s("supersaw")
  .lpf(2500).release(.25).room(.4).gain(.4)

$: note("~ e4 f3 ~").s("piano").room(.3).gain(.35)

$: note("<f2 a1 c2 g1>").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
