setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: note("c3 eb3 g2 bb2 eb2 f#2 b2 f#2").s("sawtooth")
  .lpf(3500).release(.2).room(.3).gain(.4)

$: note("a1 f1 c2 g1").s("sawtooth")
  .lpf(200).room(.4).release(.25).gain(.5)
