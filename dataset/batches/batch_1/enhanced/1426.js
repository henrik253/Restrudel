setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4 ~").gain(.2).pan(.4)

$: n("6 13 13 12 12 ~ 9 10 10 ~ 7").scale("g:minor:pentatonic").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("<g1 g1 d1 f1>").scale("g:minor:pentatonic").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
