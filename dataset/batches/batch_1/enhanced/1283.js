setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("~ -7 0 1 2 3").scale("c:minor").s("sawtooth").lpf(2500).resonance(6).release(.2).delay(.4).room(.3).gain(.4)

$: note("a2*8").s("square").lpf(700).release(.2).gain(.45)
