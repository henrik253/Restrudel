setcpm(146/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.75)

$: s("~ hh ~ hh").gain(.2)

$: n("0 2 5 2").scale("b:major").s("sawtooth").lpf(900).gain(.45)

$: n("0 3 2 4 3 5 4 0").scale("b:major").s("square").lpf(2200).resonance(.6).gain(.4)

