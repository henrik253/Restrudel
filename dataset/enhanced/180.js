setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").lpf(800).resonance(5).gain(.8)

$: s("hh*8").gain(.16)

$: note("c4 c4 e4 g4").s("supersaw")
  .lpf(2400).release(.2).room(.3).gain(.4)

$: s("sd ~ sd ~ sd ~ sd ~").bank("RolandTR909").lpf(4000).hpf(300).gain(.55)

$: note("<c2 g1 e2 f2>").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
