setcpm(110/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2).room(.3)

$: n("~ c5 ~ e5 ~ ~ ~ d5 ~ ~ ~ c5 ~").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("<.5 .8>*16").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
