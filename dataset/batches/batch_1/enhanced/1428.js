setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("cp*4").gain(.2).pan(.4)

$: n("0 7 5 3").scale("d:dorian").s("gm_epiano1")
  .lpf(2000).release(.2).room(.3).clip(1).gain(.4)

$: n("<d2 d2 a1 c2>").scale("d:dorian").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
