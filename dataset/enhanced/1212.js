setcpm(116/4)

$: s("bd ~ ~ bd ~ ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain("[.2 .13]*4").pan(.45)

$: note("eb4 g4 bb4 eb5 bb4 eb4").s("piano")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: note("<eb2 bb1 g1 eb2>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
