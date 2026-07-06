setcpm(122/4)

$: s("bd bd ~ bd").bank("RolandTR808").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: note("a2*8").s("sawtooth").lpf(1337).lpq(.2)
  .shape(.6).release(.3).gain(.4)

$: note("c4*2 d#4 f4 ~").s("sawtooth").lpf(4659)
  .resonance(2).release(.2).gain(.35)
