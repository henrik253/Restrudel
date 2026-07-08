setcpm(32)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.75).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.21)

$: note("e3 b2 e3 b2").scale("e:minor").s("sawtooth").lpf(909).resonance(.2).release(.1).gain(0.40)

