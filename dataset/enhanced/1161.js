setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2).release(.1).pan(.5)

$: n("0 3 7 5 3 0").scale("e:minor").s("sawtooth").lpf(2400).resonance(6).release(.2).room(.3).gain(.4)

$: n("<e1 b1 g1 d2>").scale("e:minor").s("square").lpf(600).release(.3).gain(.5)
