setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: n("0 2 4 ~ -2 1").scale("g:major").s("pad")
  .lpf(1800).release(.4).room(.5).gain(.4)

$: note("g#4@2 g#4").s("gm_drawbar_organ").lpf(1500)
  .release(.3).gain(.4)
