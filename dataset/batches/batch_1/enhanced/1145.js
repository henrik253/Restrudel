setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh 1 2 hh").gain(.2)

$: n("5 8 7 9!2 7 8").scale("c:minor").s("sawtooth")
  .lpf(1800).resonance(6).release(.15).delay(.3).gain(.4)

$: note("d#5@2 d5@2").s("square").lpf(1800)
  .release(.2).gain(.4)
