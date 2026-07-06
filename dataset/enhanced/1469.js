setcpm(118/4)

$: s("bd ~ cp ~").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh").lpf(2800).gain(.4)

$: n("7 6 5 4 3 2").scale("c:<major minor>/2").s("piano")
  .velocity(.75).lpf(1000).clip(.93).gain(.4)

$: note("d5 ~ f5 ~").s("square")
  .lpf(2200).resonance(5).release(.15).delay(.3).gain(.35)

$: n("<c2 c2 a1 g1>").scale("c:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
