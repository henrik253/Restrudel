setcpm(110/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: n("C1 F1 G1").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("2 -5").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)
