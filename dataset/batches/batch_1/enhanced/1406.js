setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: s("~ cp ~ cp").gain(.25)

$: n("0 3 7 5 7 3 0 ~").scale("d:minor").s("square")
  .lpf(1800).release(.2).room(.3).gain(.4)

$: n("<d2 d2 a1 bb1>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
