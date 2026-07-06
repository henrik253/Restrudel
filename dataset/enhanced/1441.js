setcpm(120/4)

$: s("bd*2 sd").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("c1 f1 c1 g1").s("gm_bassoon").lpf(700)
  .release(.2).gain(.5)

$: n("0 3 7 5 7 3 0 ~").scale("c:major").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)
