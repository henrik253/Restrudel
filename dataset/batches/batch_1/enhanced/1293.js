setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("lt*4").gain(.25)

$: s("hh*8").gain(.16)

$: n("8 ~ 14 6 ~ 10 4 ~ 6 13 9 7 8 5 1 2").scale("c:minor").s("sawtooth").clip(1).lpf(2500).resonance(6).release(.2).delay(.3).gain(.35)

$: note("c1 f1 g1 c1").s("square").lpf(700).lpq(2).shape(.3).release(.2).room(.4).delay(.3).gain(.45)
