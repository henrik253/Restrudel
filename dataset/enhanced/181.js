setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").delay(.2).room(.2).gain("[.8 .5]*2")

$: s("hh*8").gain(.16)

$: n("9*2 8 ~ 7").scale("d:dorian").s("sawtooth")
  .transpose(-12).lpf(2000).release(.2).gain(.4)

$: note("d4 f4 a4 c5").s("square")
  .lpf(1500).release(.2).gain(.35)

$: n("<d2 a1 c2 g1>").scale("d:dorian").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
