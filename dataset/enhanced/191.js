setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("9*2 8").scale("c:minor").s("sawtooth")
  .room(1).lpf(2200).release(.2).gain(.25)

$: n("<0 3 5 7>").scale("c:minor").s("sitar")
  .room(.3).delay(.6).delaytime(".16 | .33").gain(.35)

$: n("<c2 g1 g#1 bb1>").scale("c:minor").s("square")
  .lpf(600).release(.25).gain(.5)
