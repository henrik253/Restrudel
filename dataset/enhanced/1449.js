setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: n("2 -1 0 4 4 4 4 4 3 2 1 1 1 1").scale("g:lydian").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("<g1 g1 d2 c2>").scale("g:lydian").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
