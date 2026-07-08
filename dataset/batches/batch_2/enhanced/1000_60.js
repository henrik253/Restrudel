setcpm(90/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.8)

$: s("hh*8").gain(.15)

$: note("g1 f1 g1 f1").s("triangle").lpf(500).release(.2).gain(.5)

$: note("<g3 f3>").s("sine").lpf(1200).resonance(10).release(.3).gain(.35)
