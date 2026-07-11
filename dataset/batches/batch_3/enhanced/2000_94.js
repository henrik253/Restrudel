setcpm(28)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.77).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.19)

$: note("e3 b2 e3 b2").scale("e:minor").s("sawtooth").lpf(838).resonance(.2).release(.1).gain(0.31)

