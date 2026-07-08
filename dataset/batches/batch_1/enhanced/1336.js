setcpm(120/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: n("4 3 4 3 4 5 6 7 8 6 5 6 4 3 2 0").scale("g:minor").s("sawtooth")
  .lpf(2000).resonance(6).release(.15).gain(.4)

$: note("g2 a2 f2 g2").s("supersaw")
  .lpf(600).gain(.5).release(.3)
