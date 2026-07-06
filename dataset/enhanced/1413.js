setcpm(120/4)

$: s("bd ~ sd ~").bank("AkaiLinn").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: n("5 ~ 8 ~ 7 5 ~ 3").scale("g:dorian").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("<g1 g1 d1 f1>").scale("g:dorian").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
