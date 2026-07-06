setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: s("gm_epiano1:1").note("c4 eb4 g4 bb4").clip(.9).release(.3).room(.5).gain(.35)

$: note("c2 g2 eb2 bb1").s("gm_acoustic_bass").lpf(800).release(.25).gain(.5)

$: n("<0 3 5 4>").scale("c:minor").s("sawtooth")
  .lpf(1800).resonance(5).release(.15).delay(.3).gain(.35)
