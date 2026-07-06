setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").room(.4).gain(.8)

$: s("hh ~ hh ~").gain(.3)

$: note("c4 b3 b3 b3 b3 b3").s("pulse")
  .lpf(3000).release(.2).gain(.4)

$: s("gm_drawbar_organ").note("c4 eb4 g4 bb4").clip(.8).room(.5).gain(.3)

$: note("<c2 g1 eb2 bb1>").s("sawtooth").lpf(600).release(.25).gain(.5)
