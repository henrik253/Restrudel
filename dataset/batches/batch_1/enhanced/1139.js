setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.18).pan(.4)

$: n("~ 0 2 4 0 2 4 ~ -2 1 3").scale("c:major").s("sawtooth")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: note("g#4@2 ~ f#4 f#4@2").s("gm_drawbar_organ").lpf(1200)
  .release(.3).gain(.4)
