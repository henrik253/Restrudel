setcpm(28)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.69).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.20)

$: note("a2 e2 a2 e2").scale("a:minor").s("sawtooth").lpf(915).resonance(.2).release(.1).gain(0.48)

$: note("0 3 7 ~ 5 3").scale("a:minor").s("square").lpf(1315).decay(.2).sustain(.3).release(.1).gain(0.38)

