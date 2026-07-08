setcpm(126/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh*8").gain(.2).pan(.4)

$: note("0 04 a4 ~").sound("sawtooth").lpf(835)
  .attack(.05).release(.2).room(.3).gain(.4)

$: n("<a1 a1 e1 f1>").scale("a:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
