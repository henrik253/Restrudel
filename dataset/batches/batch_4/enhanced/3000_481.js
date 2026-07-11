setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2).room(.3)

$: n("3 ~ 5 7 ~ 8 ~ 15 9*2 8 ~ 14").scale("a3:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("4 5 7 5 4 2 0 ~").scale("a3:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

