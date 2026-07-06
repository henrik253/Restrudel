setcpm(120/4)

$: s("bd 0 1 2").bank("RolandTR909").gain(.5).delay(.4).room(.2).hpf(300)

$: s("hh ~ hh ~").gain(.8).shape(.4).release(.4).hpf(200).pan(.5)

$: n("0 3 7 5 3 0").scale("g:minor").s("sawtooth")
  .lpf(2000).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<g1 d2 bb1 d2>").scale("g:minor").s("square").lpf(600).release(.25).gain(.5)
