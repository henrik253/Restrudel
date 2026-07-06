setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cymbal ~ ~").gain(.3).room(.3)

$: n("6 -3 -1 1 -4 -1").scale("c:minor").s("sawtooth")
  .clip(1).release(.4).gain(.4).room(.4).lpf(1800)

$: n("<c2 g1 eb2 f1>").scale("c:minor").s("square")
  .lpf(600).release(.3).gain(.5)
