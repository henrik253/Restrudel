setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: n("7 5 3 0 3 5 7 ~").scale("c:minor").s("sawtooth")
  .lpf(2000).release(.16).room(.3).gain(.4)

$: note("c2*4 g1 c2 d#2 g1").s("gm_acoustic_bass")
  .lpf(700).release(.2).gain(.5)
