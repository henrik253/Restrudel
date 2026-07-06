setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hats*8").s("hh*8").gain(.18).room(.3)

$: note("e3 a3 c4 e4 c4 a3 g3 b3").s("triangle").lpf(2199).room(.5).release(.3).gain(.3)

$: note("<a1 a1 e2 c2>").s("sawtooth").lpf(700).release(.25).gain(.45)
