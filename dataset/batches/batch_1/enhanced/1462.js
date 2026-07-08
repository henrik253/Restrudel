setcpm(110/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR808").gain(.8)

$: s("~ oh ~ oh").lpf(800).gain(.3)

$: s("~ ~ cp ~").bank("RolandTR909").gain(.4)

$: note("a2 ~ ~ a2 ~ ~ a2 ~ ~ a2 ~ ~").lpf(400).s("sawtooth")
  .resonance(4).release(.2).gain(.5)

$: n("<0 3 5 3>").scale("a:minor").s("square")
  .lpf(1600).release(.2).delay(.3).gain(.35)
