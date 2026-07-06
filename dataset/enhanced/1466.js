setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain("[.18 .12]*8").room(.3)

$: n("<0 1 3 4>").scale("g:minor:pentatonic").s("gm_distortion_guitar")
  .lpf(2000).room(.3).release(.2).gain(.35)

$: n("F4 Bb4 D5 D4").scale("g:minor:pentatonic").s("square")
  .velocity(.53).lpf(2200).resonance(5).release(.15).delay(.3).gain(.4)

$: n("<g1 g1 eb1 f1>").scale("g:minor:pentatonic").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
