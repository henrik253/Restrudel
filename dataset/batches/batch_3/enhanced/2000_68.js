setcpm(32)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(0.65).release(.05)

$: s("~ hh ~ hh").bank("RolandTR909").gain(0.22)

$: note("a2 e2 a2 e2").scale("a:minor").s("sawtooth").lpf(621).resonance(.2).release(.1).gain(0.50)

