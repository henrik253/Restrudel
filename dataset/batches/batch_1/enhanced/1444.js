setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: n("0 3 7 5").scale("c:major").s("gm_acoustic_guitar_steel")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("-3 -2 -1 0").scale("c:major").s("sawtooth")
  .lpf(2000).release(.2).gain(.4)

$: n("<c2 c2 g1 a1>").scale("c:major").s("square")
  .lpf(600).release(.2).gain(.5)
