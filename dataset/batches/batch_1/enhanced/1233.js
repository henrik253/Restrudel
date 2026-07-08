setcpm(118/4)

$: s("bd*4 bd ~ ~ sd").bank("RolandTR909").gain(.82)

$: s("hh*4 ~ sd ~").gain(.25)

$: note("f4 f4 g#4 d#4").s("square")
  .lpf(2000).resonance(5).release(.15).delay(.4).gain(.4)

$: note("<f1 f1 c2 d#2>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
