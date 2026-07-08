setcpm(133/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.75)

$: s("~ hh ~ hh").gain(.2)

$: n("0 ~ 5 3").scale("c:minor").s("sawtooth").lpf(900).gain(.45)

$: n("0 2 4 2 5 4 2 0").scale("c:minor").s("square").lpf(2200).resonance(.6).gain(.4)

