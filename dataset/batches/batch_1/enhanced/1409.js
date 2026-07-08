setcpm(128/4)

$: s("bd*4").bank("RolandTR909").lpf(4000).gain(.85)

$: s("~ sd ~ sd").bank("RolandTR909").gain(.6)

$: s("hh*8").gain(.2).pan(.4)

$: note("d2*4 c2 eb2 g2 d2").sound("supersaw").lpf(1000)
  .release(.15).gain(.5)

$: n("0 3 7 10 7 3 0 ~").scale("d:minor").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)
