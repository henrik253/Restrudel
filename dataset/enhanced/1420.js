setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*4").gain(.2).hpf(8000).room(.4).pan(.4)

$: note("c2*4 f2 c2 b1 c2").s("sawtooth")
  .lpf(600).release(.2).gain(.5)

$: note("g5 c6 g5 d5 g5").sound("square").lpf(2500)
  .release(.15).room(.3).gain(.4)
