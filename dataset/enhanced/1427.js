setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4 ~").gain(.2).pan(.24).room(.3)

$: note("e1 ~ ~ e2 ~ e1 ~ ~").sound("sawtooth").lpf(600)
  .release(.2).gain(.5)

$: n("0 3 5 7 5 3 0 ~").scale("e:minor").s("sawtooth")
  .lpf(2000).release(.2).room(.4).gain(.4)

$: n("<e3 b3 e4 g4>").scale("e:minor").s("square")
  .lpf(1800).release(.2).gain(.3)
