setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .12]*4")

$: note("c5 ~ e5 ~").s("square")
  .lpf(2600).release(.2).room(.4).delay(.4).gain(.35)

$: note("<c2 g1 a1 f1>").s("sawtooth")
  .lpf(600).release(.3).gain(.5)
