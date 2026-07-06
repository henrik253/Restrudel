setcpm(120/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh:1*4").gain(.2)

$: note("~ ~ c5 ~").s("square")
  .lpf(1200).release(.3).room(.4).gain(.35)

$: note("b2 f#2 f2 bb2").s("sawtooth")
  .lpf(700).release(.3).gain(.5)

$: note("d2*8").s("sawtooth")
  .lpf(600).gain(.35)
