setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: note("c5 d5 e5 e5").s("sawtooth")
  .lpf(2400).release(.2).room(.3).gain(.4)

$: n("c2 ~ f2 ~ 1@3 2 -5 -4").scale("c:minor").s("supersaw")
  .lpf(800).release(.25).gain(.45)
