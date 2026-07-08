setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ amen ~ ~").hpf(4000).gain(.3)

$: note("c2*8 e5 a5 e5").s("sine")
  .lpf(3000).room(.7).release(.15).gain(.4)

$: note("<c2 c2 g1 a1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
