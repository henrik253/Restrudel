setcpm(114/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).pan(.44)

$: note("d#5 d#5 d5 d5").s("gm_pad_warm").lpf(3000)
  .release(.4).room(.3).gain(.4)

$: n("3 0 0 0 ~ -7").scale("c:major").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: n("<c2 c2 g1 a1>").scale("c:major").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
