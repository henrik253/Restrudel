setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("bd*4").bank("RolandTR909").gain(.3)

$: s("hh*8").gain(.16)

$: note("a2 c3 e3 a3 c4 e4 a4 c5 e4 c4 a3 e3").s("piano").clip("<1@3 [.3 1]>/2").lpf(2500).room(.3).gain(.35)

$: note("<a1 a1 e2 c2>").s("sawtooth").lpf(700).release(.25).gain(.5)
