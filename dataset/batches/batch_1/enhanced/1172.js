setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*16").gain(.15).pan(.5)

$: n("0 5 3 7 5 3 2 0").scale("a:minor").s("sawtooth").lpf(2400).resonance(6).release(.2).room(.3).delay(.3).gain(.4)

$: n("<a1 e2 c2 g1>").scale("a:minor").s("square").lpf(600).release(.3).gain(.5)
