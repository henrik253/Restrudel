setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain("[.2 .12]*8")

$: note("a4 d#5@2 a4").s("sawtooth")
  .lpf(2500).room(.5).release(.3).gain(.4)

$: note("<a2 a1 d2 e2>").s("square")
  .lpf(600).release(.25).gain(.5)
