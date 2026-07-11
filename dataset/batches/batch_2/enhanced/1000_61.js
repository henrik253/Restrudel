setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.15)

$: note("c4 g3 a3 f3").s("triangle").attack(.015).release(.2).lpf(1500).gain(.4)

$: note("<c2 g1 a1 f1>").s("sine").lpf(400).release(.3).gain(.5)
