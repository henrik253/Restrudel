setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").room(.2).delay(.2).delayfeedback(.5).gain(.7)

$: s("hh*8").decay(.14).sustain(0).gain(.2)

$: n("<0 3 5 7>").scale("c:minor").s("piano")
  .lpf(862).room(.6).gain(.5)

$: n("<c2 g1 g#1 bb1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
