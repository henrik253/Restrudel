setcpm(110/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: n("~ F3 A3 C4 F3 A3 C4 ~ F3 A3 C3").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("d2*8 g3").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
